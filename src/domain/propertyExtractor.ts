// ============================================================
// Property Extractor — Pure Domain Logic (Placeholder)
// ============================================================
// In production, this would call an OCR/AI API to extract
// property details from uploaded documents. Zero framework imports.
// ============================================================

export interface ExtractedPropertyData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  type?: string;
  totalSqFt?: number;
  yearBuilt?: number;
  confidence: number; // 0-1
}

/**
 * Placeholder: returns mock extracted data based on file type.
 * In production, this would send the file to an OCR/AI service.
 */
export function extractPropertyFromDocument(fileName: string): ExtractedPropertyData {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return {
      name: 'Summit Office Plaza',
      address: '4200 Preston Rd',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75252',
      type: 'Office',
      totalSqFt: 156000,
      yearBuilt: 2019,
      confidence: 0.87,
    };
  }

  return {
    name: 'Extracted Property',
    address: '100 Main Street',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    type: 'Office',
    totalSqFt: 100000,
    confidence: 0.72,
  };
}
