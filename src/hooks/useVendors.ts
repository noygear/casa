import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { Vendor, VendorScoreRecord } from '../types';

interface VendorWithScores extends Vendor {
  scoreRecords?: VendorScoreRecord[];
  _count?: { workOrders: number };
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function useVendors(filters?: { isActive?: boolean; specialty?: string }) {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
      if (filters?.specialty) params.set('specialty', filters.specialty);
      const { data } = await apiClient.get<PaginatedResponse<VendorWithScores>>(`/vendors?${params}`);
      return data;
    },
  });
}

export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const { data } = await apiClient.get<VendorWithScores>(`/vendors/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useVendorScores() {
  return useQuery({
    queryKey: ['vendor-scores'],
    queryFn: async () => {
      const { data } = await apiClient.get<(VendorScoreRecord & { vendor: Vendor })[]>('/vendors/scores');
      return data;
    },
  });
}

export function useVendorReferrals() {
  return useQuery({
    queryKey: ['vendor-referrals'],
    queryFn: async () => {
      const { data } = await apiClient.get('/vendors/referrals');
      return data;
    },
  });
}
