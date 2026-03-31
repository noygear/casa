# Vendor Scoring Engine

The scoring engine at `src/domain/vendorScoringEngine.ts` computes vendor performance from ticket data. It is a pure function.

## Formula

```
score = 100
  − Σ(rejections × 10 × severityMultiplier)
  − Σ(skips × 5 × severityMultiplier)
  − Σ(daysLate × 3 × severityMultiplier)
  + bonus
```

## Severity Multipliers

| Severity | Multiplier |
|----------|-----------|
| minor | 1× |
| needs_fix_today | 2× |
| immediate | 4× |

## Output Dimensions

- **quality**: 100 − rejection penalties
- **consistency**: 100 − skip penalties
- **speed**: 100 − lateness penalties
- **volume**: raw completion count
- **total**: final score (can go negative)

## Grade Mapping

A+ (≥95), A (90–94), B+ (85–89), B (80–84), C (70–79), D (60–69), F (<60)

## Rules

- Scores can go negative. No floor. This exposes chronic underperformance.
- The scoring engine never writes to the database. Persistence is the service layer's job.
- Period-based: `VendorScoreRecord` stores snapshots with `periodStart` and `periodEnd`.
- Grade mapping is for display only. Sort and filter by numeric score.
