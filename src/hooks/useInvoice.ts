import { useMutation } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { ExtractedInvoice, ExtractedLineItem } from '../domain/invoiceExtractor';

export function useParseInvoice() {
  return useMutation({
    mutationFn: async ({ workOrderId, image }: { workOrderId: string; image: string }) => {
      const { data } = await apiClient.post<ExtractedInvoice>(
        `/work-orders/${workOrderId}/invoice/parse`,
        { image }
      );
      return data;
    },
  });
}

export function useConfirmInvoice() {
  return useMutation({
    mutationFn: async ({
      workOrderId,
      lineItems,
      invoiceImageUrl,
    }: {
      workOrderId: string;
      lineItems: ExtractedLineItem[];
      invoiceImageUrl?: string;
    }) => {
      const { data } = await apiClient.post<{ lineItems: number; total: number }>(
        `/work-orders/${workOrderId}/invoice/confirm`,
        { lineItems, invoiceImageUrl }
      );
      return data;
    },
  });
}
