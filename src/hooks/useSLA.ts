import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

interface SLAComplianceItem {
  workOrderId: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
  property: { id: string; name: string };
  sla: {
    responseOnTrack: boolean;
    resolveOnTrack: boolean;
    responseElapsedMin: number;
    resolveElapsedMin: number;
    responseTargetMin: number;
    resolveTargetMin: number;
    responsePercentUsed: number;
    resolvePercentUsed: number;
  };
}

interface SLAComplianceResponse {
  items: SLAComplianceItem[];
  summary: {
    total: number;
    responseCompliancePercent: number;
    resolveCompliancePercent: number;
  };
}

interface PortfolioAnalytics {
  portfolio: {
    totalProperties: number;
    totalWorkOrders: number;
    healthScore: number;
    avgCompletionTime: number;
    costPerUnit: number;
  };
  costTrends: { month: string; totalCost: number; count: number; avgCost: number }[];
  vendorAudit: {
    totalVendors: number;
    avgScore: number;
    topPerformers: { id: string; companyName: string; score: number; completions: number }[];
    underperformers: { id: string; companyName: string; score: number; rejections: number }[];
  };
  topCostCenters: {
    property: { id: string; name: string };
    totalCost: number;
    workOrderCount: number;
    avgCostPerOrder: number;
  }[];
}

export function useSLACompliance() {
  return useQuery({
    queryKey: ['sla-compliance'],
    queryFn: async () => {
      const { data } = await apiClient.get<SLAComplianceResponse>('/sla/compliance');
      return data;
    },
  });
}

export function usePortfolioAnalytics() {
  return useQuery({
    queryKey: ['portfolio-analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get<PortfolioAnalytics>('/sla/analytics');
      return data;
    },
  });
}

// ── SLA Configuration ───────────────────────────────────────

export interface SLAConfig {
  id: string;
  propertyId: string;
  category: string;
  severity: string;
  responseTimeMin: number;
  resolveTimeMin: number;
  property: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export function useSLAConfigs() {
  return useQuery({
    queryKey: ['sla-configs'],
    queryFn: async () => {
      const { data } = await apiClient.get<SLAConfig[]>('/sla/configs');
      return data;
    },
  });
}

export function useUpsertSLAConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      propertyId: string;
      category: string;
      severity: string;
      responseTimeMin: number;
      resolveTimeMin: number;
    }) => {
      const { data } = await apiClient.put<SLAConfig>('/sla/configs', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sla-configs'] });
    },
  });
}

export function useDeleteSLAConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/sla/configs/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sla-configs'] });
    },
  });
}
