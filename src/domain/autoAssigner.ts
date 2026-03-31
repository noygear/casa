// ============================================================
// Auto-Assigner — Pure Domain Logic
// ============================================================
// Finds the preferred vendor for a given property + category
// combination. Zero framework imports.
// ============================================================

import { WorkOrderCategory, Vendor, PreferredVendorMapping } from '../types/index.js';

/**
 * Finds the highest-priority active vendor for a property/category pair.
 * Returns null if no mapping exists or no matching vendor is active.
 */
export function findPreferredVendor(
  propertyId: string,
  category: WorkOrderCategory,
  mappings: PreferredVendorMapping[],
  activeVendors: Vendor[]
): Vendor | null {
  const matched = mappings
    .filter(m => m.propertyId === propertyId && m.category === category)
    .sort((a, b) => a.priority - b.priority);

  for (const mapping of matched) {
    const vendor = activeVendors.find(v => v.id === mapping.vendorId && v.isActive);
    if (vendor) return vendor;
  }

  return null;
}
