import Anthropic from '@anthropic-ai/sdk';
import prisma from '../prisma.js';
import type { ExtractedInvoice, ExtractedLineItem } from '../../../src/domain/invoiceExtractor.js';

export type { ExtractedInvoice, ExtractedLineItem };

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
  return new Anthropic({ apiKey });
}

/**
 * Parse an invoice image using Claude's vision capabilities.
 * Returns structured line items and totals for vendor review.
 */
export async function parseInvoice(imageBase64: string): Promise<ExtractedInvoice> {
  const client = getAnthropicClient();

  // Strip data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');
  const mediaType = imageBase64.startsWith('data:image/png') ? 'image/png'
    : imageBase64.startsWith('data:image/webp') ? 'image/webp'
    : imageBase64.startsWith('data:image/gif') ? 'image/gif'
    : 'image/jpeg';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Data },
          },
          {
            type: 'text',
            text: `Extract all invoice information from this image. Return a JSON object with this exact structure:
{
  "vendorName": "company name on the invoice",
  "invoiceNumber": "invoice/reference number if visible",
  "invoiceDate": "date in YYYY-MM-DD format if visible",
  "lineItems": [
    {
      "description": "description of the line item",
      "category": "labor" | "materials" | "equipment" | "other",
      "quantity": 1,
      "unitPrice": 100.00,
      "total": 100.00
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "confidence": 0.0 to 1.0
}

Rules:
- Extract every line item you can identify
- Categorize each item as "labor", "materials", "equipment", or "other"
- If quantity or unit price aren't clear, set quantity=1 and unitPrice=total
- Set confidence based on image quality and how much you could extract (1.0 = everything clear)
- Return ONLY the JSON object, no other text`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      lineItems: [],
      total: 0,
      confidence: 0,
    };
  }

  const parsed = JSON.parse(jsonMatch[0]) as ExtractedInvoice;

  // Validate and sanitize
  return {
    vendorName: parsed.vendorName || undefined,
    invoiceNumber: parsed.invoiceNumber || undefined,
    invoiceDate: parsed.invoiceDate || undefined,
    lineItems: (parsed.lineItems || []).map(item => ({
      description: item.description || 'Unknown item',
      category: (['labor', 'materials', 'equipment', 'other'].includes(item.category || '')
        ? item.category
        : 'other') as ExtractedLineItem['category'],
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
    })),
    subtotal: Number(parsed.subtotal) || undefined,
    tax: Number(parsed.tax) || undefined,
    total: Number(parsed.total) || 0,
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
  };
}

/**
 * Save confirmed invoice line items to the database.
 * Also updates the work order's total cost.
 */
export async function saveInvoiceLineItems(
  workOrderId: string,
  lineItems: ExtractedLineItem[],
  invoiceImageUrl?: string
) {
  // Delete any existing line items for this work order
  await prisma.invoiceLineItem.deleteMany({ where: { workOrderId } });

  // Create new line items
  await prisma.invoiceLineItem.createMany({
    data: lineItems.map(item => ({
      workOrderId,
      description: item.description,
      category: item.category || 'other',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
  });

  // Update work order total cost
  const total = lineItems.reduce((sum, item) => sum + item.total, 0);
  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { cost: total },
  });

  // Save invoice image as a photo if provided
  if (invoiceImageUrl) {
    await prisma.workOrderPhoto.create({
      data: {
        workOrderId,
        url: invoiceImageUrl,
        type: 'invoice',
        caption: 'Vendor invoice',
      },
    });
  }

  return { lineItems: lineItems.length, total };
}
