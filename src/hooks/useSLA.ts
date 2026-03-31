import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

interface SLAComplianceItem {
  workOrderId: string;
  title: string;
  status: string;
  severity: string;
  property: { id: string; name: string };
  sla: {
    responseOnTrack: boolean;
    resolveOnTrack: boolean;
    responseMinutesLeft: number | null;
    resolveMinutesLeft: number | null;
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
