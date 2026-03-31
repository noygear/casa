// ============================================================
// Invoice Extractor — Pure Domain Types
// ============================================================
// Type definitions for AI-extracted invoice data.
// Zero framework imports. Used by both frontend and backend.
// ============================================================

export interface ExtractedLineItem {
  description: string;
  category?: 'labor' | 'materials' | 'equipment' | 'other';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ExtractedInvoice {
  vendorName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  lineItems: ExtractedLineItem[];
  subtotal?: number;
  tax?: number;
  total: number;
  confidence: number; // 0-1
}
