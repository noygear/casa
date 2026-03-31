import { generateDueInstances } from './services/recurringGeneration.service.js';

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let intervalHandle: ReturnType<typeof setInterval> | null = null;

/**
 * Start the recurring generation scheduler.
 * Runs immediately on startup, then on a configurable interval.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function startScheduler(intervalMs?: number): void {
  if (intervalHandle) return;

  const interval =
    intervalMs ??
    parseInt(process.env.SCHEDULER_INTERVAL_MS || String(DEFAULT_INTERVAL_MS), 10);

  console.log(`Recurring scheduler started (interval: ${Math.round(interval / 1000)}s)`);

  // Run immediately on startup, then on interval
  runGeneration();
  intervalHandle = setInterval(runGeneration, interval);
}

/**
 * Stop the scheduler. Called during graceful shutdown.
 */
export function stopScheduler(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('Recurring scheduler stopped');
  }
}

async function runGeneration(): Promise<void> {
  try {
    const results = await generateDueInstances();
    if (results.length > 0) {
      console.log(`Scheduler: generated ${results.length} recurring work order(s):`);
      for (const r of results) {
        console.log(`  - ${r.templateName} → WO ${r.workOrderId} (due ${r.dueDate})`);
      }
    }
  } catch (err) {
    console.error('Scheduler: generation failed', err);
  }
}
