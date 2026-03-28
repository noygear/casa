import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { PreferredVendorMapping, WorkOrderCategory } from '../types';

interface MappingWithRelations extends PreferredVendorMapping {
  property?: { id: string; name: string };
  vendor?: { id: string; companyName: string };
}

export function usePreferredVendorMappings() {
  return useQuery({
    queryKey: ['preferred-vendor-mappings'],
    queryFn: async () => {
      const { data } = await apiClient.get<MappingWithRelations[]>('/preferred-vendor-mappings');
      return data;
    },
  });
}

export function useCreateMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mapping: {
      propertyId: string;
      category: WorkOrderCategory;
      vendorId: string;
      priority?: number;
    }) => {
      const { data } = await apiClient.post<MappingWithRelations>('/preferred-vendor-mappings', mapping);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferred-vendor-mappings'] });
    },
  });
}
