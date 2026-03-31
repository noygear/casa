import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { Property, Space } from '../types';

interface PropertyWithCount extends Property {
  _count?: { workOrders: number };
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function useProperties(filters?: { type?: string; city?: string; state?: string; search?: string }) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
      }
      const { data } = await apiClient.get<PaginatedResponse<PropertyWithCount>>(`/properties?${params}`);
      return data;
    },
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data } = await apiClient.get<PropertyWithCount>(`/properties/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useSpaces(propertyId?: string) {
  return useQuery({
    queryKey: ['spaces', propertyId],
    queryFn: async () => {
      const params = propertyId ? `?propertyId=${propertyId}` : '';
      const { data } = await apiClient.get<Space[]>(`/spaces${params}`);
      return data;
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (property: {
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      type: string;
      totalSqFt?: number;
      yearBuilt?: number;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
      occupancyPercent?: number;
      monthlyRevenue?: number;
      spaces?: {
        name: string;
        floor?: number;
        type: 'suite' | 'common_area';
        tenantName?: string;
        sqFt?: number;
      }[];
    }) => {
      const { data } = await apiClient.post<Property>('/properties', property);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
