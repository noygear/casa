import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { WorkOrder, WorkOrderStatus, Severity, WorkOrderCategory } from '../types';

interface WorkOrderFilters {
  status?: WorkOrderStatus;
  severity?: Severity;
  category?: WorkOrderCategory;
  propertyId?: string;
  vendorId?: string;
  assignedToId?: string;
  createdById?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function useWorkOrders(filters?: WorkOrderFilters) {
  return useQuery({
    queryKey: ['work-orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });
      }
      if (!params.has('limit')) params.set('limit', '100');
      const { data } = await apiClient.get<PaginatedResponse<WorkOrder>>(`/work-orders?${params}`);
      return data;
    },
  });
}

export function useWorkOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const { data } = await apiClient.get<WorkOrder>(`/work-orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workOrder: {
      title: string;
      description: string;
      severity?: Severity;
      category?: WorkOrderCategory;
      isInspection?: boolean;
      propertyId: string;
      spaceId?: string | null;
      vendorId?: string | null;
      assignedToId?: string | null;
      dueDate?: string | null;
    }) => {
      const { data } = await apiClient.post<WorkOrder>('/work-orders', workOrder);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      status?: WorkOrderStatus;
      assignedToId?: string | null;
      vendorId?: string | null;
      cost?: number | null;
      comment?: string;
    }) => {
      const { data } = await apiClient.patch<WorkOrder>(`/work-orders/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', data.id] });
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workOrderId, ...photo }: {
      workOrderId: string;
      url: string;
      type: 'before' | 'after' | 'completion' | 'start' | 'invoice';
      caption?: string;
      gpsLatitude?: number;
      gpsLongitude?: number;
      gpsAccuracy?: number;
    }) => {
      const { data } = await apiClient.post(`/work-orders/${workOrderId}/photos`, photo);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['work-order', variables.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
