import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { RecurringTemplate, WorkOrderCategory, Severity, MaintenanceFrequency } from '../types';

export function useRecurringTemplates() {
  return useQuery({
    queryKey: ['recurring-templates'],
    queryFn: async () => {
      const { data } = await apiClient.get<RecurringTemplate[]>('/recurring-templates');
      return data;
    },
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: {
      name: string;
      description: string;
      category: WorkOrderCategory;
      severity?: Severity;
      frequency: MaintenanceFrequency;
      customDays?: number;
      propertyId: string;
      spaceId?: string;
      vendorId?: string;
    }) => {
      const { data } = await apiClient.post<RecurringTemplate>('/recurring-templates', template);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      description?: string;
      severity?: Severity;
      frequency?: MaintenanceFrequency;
      customDays?: number | null;
      vendorId?: string | null;
      isActive?: boolean;
    }) => {
      const { data } = await apiClient.patch<RecurringTemplate>(`/recurring-templates/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] });
    },
  });
}
