import { useMemo } from 'react';
import { WorkOrder, WorkOrderCategory, Property, Space } from '../types';
import { subDays, isAfter } from 'date-fns';

export interface RecurringIssueFlag {
  category: WorkOrderCategory;
  property: Property;
  space: Space | null | undefined;
  ticketCount: number;
  recentTickets: WorkOrder[];
}

export function useIssueDetection(
  workOrders: WorkOrder[],
  daysToLookBack: number = 90,
  triggerThreshold: number = 2
) {
  return useMemo(() => {
    const flags: RecurringIssueFlag[] = [];
    const cutoffDate = subDays(new Date(), daysToLookBack);

    // Filter to ONLY recent, reactive (non-inspection) tickets
    const recentReactiveOrders = workOrders.filter(
      (wo) => !wo.isInspection && isAfter(new Date(wo.createdAt), cutoffDate)
    );

    // Grouping Signature: PropertyID::SpaceID::Category
    const groups = new Map<string, WorkOrder[]>();

    recentReactiveOrders.forEach((wo) => {
      // If no space, use 'COMMON'
      const sig = wo.propertyId + "::" + (wo.spaceId || 'COMMON') + "::" + wo.category;
      const existing = groups.get(sig) || [];
      existing.push(wo);
      groups.set(sig, existing);
    });

    // Detect triggers
    groups.forEach((tickets) => {
      if (tickets.length >= triggerThreshold) {
        flags.push({
          category: tickets[0].category,
          property: tickets[0].property!,
          space: tickets[0].space,
          ticketCount: tickets.length,
          recentTickets: tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        });
      }
    });

    // Sort flags by most severe (highest ticket count)
    return flags.sort((a, b) => b.ticketCount - a.ticketCount);
  }, [workOrders, daysToLookBack, triggerThreshold]);
}
