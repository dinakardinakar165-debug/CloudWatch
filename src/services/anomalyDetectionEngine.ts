/**
 * CloudWatch Sentinel - Anomaly Detection Engine
 * Statistical Z-Score Detection, Baseline Variance Analysis, and Metric Rules
 * Formula: Z = (x - μ) / σ
 */

import { Anomaly } from '../types/cloudwatch-sentinel';

export interface AnomalyDetectionConfig {
  minHistoricalPoints: number; // minimum sample points needed (default: 5)
  zScoreCriticalThreshold: number; // default: 3.5 (standard deviations)
  zScoreHighThreshold: number; // default: 2.5
  zScoreMediumThreshold: number; // default: 1.8
  minVarianceEpsilon: number; // epsilon for zero-variance protection (default: 0.0001)
}

export const DEFAULT_ANOMALY_CONFIG: AnomalyDetectionConfig = {
  minHistoricalPoints: 5,
  zScoreCriticalThreshold: 3.5,
  zScoreHighThreshold: 2.5,
  zScoreMediumThreshold: 1.8,
  minVarianceEpsilon: 0.0001,
};

export interface StatisticalSummary {
  count: number;
  mean: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
}

/**
 * Calculates mean, variance, and standard deviation with Bessel's correction
 */
export function calculateStatisticalSummary(
  values: number[],
  minVarianceEpsilon: number = 0.0001
): StatisticalSummary | null {
  if (!values || values.length === 0) return null;

  const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));
  if (validValues.length === 0) return null;

  const count = validValues.length;
  const sum = validValues.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / count;

  if (count === 1) {
    return {
      count: 1,
      mean,
      stdDev: minVarianceEpsilon,
      variance: minVarianceEpsilon * minVarianceEpsilon,
      min: mean,
      max: mean,
    };
  }

  // Sample variance using Bessel's correction (N - 1)
  const sumSquaredDiffs = validValues.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
  const rawVariance = sumSquaredDiffs / (count - 1);

  // Handle zero-variance edge cases (e.g. constant values or flatlines)
  const variance = Math.max(rawVariance, minVarianceEpsilon * minVarianceEpsilon);
  const stdDev = Math.sqrt(variance);

  return {
    count,
    mean,
    stdDev,
    variance,
    min: Math.min(...validValues),
    max: Math.max(...validValues),
  };
}

/**
 * Compute Z-Score: Z = (x - μ) / σ
 */
export function calculateZScore(
  observedValue: number,
  mean: number,
  stdDev: number,
  minVarianceEpsilon: number = 0.0001
): number {
  const safeStdDev = Math.max(stdDev, minVarianceEpsilon);
  return (observedValue - mean) / safeStdDev;
}

/**
 * Evaluate metric observation against historical baseline
 */
export function evaluateStatisticalAnomaly(
  targetIdentifier: string,
  metricName: string,
  observedValue: number,
  historicalValues: number[],
  unit: string,
  category: 'INFRASTRUCTURE' | 'COST' | 'PIPELINE',
  config: AnomalyDetectionConfig = DEFAULT_ANOMALY_CONFIG
): Anomaly | null {
  if (historicalValues.length < config.minHistoricalPoints) {
    // Insufficient historical points to establish an authoritative statistical baseline
    return null;
  }

  const stats = calculateStatisticalSummary(historicalValues, config.minVarianceEpsilon);
  if (!stats) return null;

  const z = calculateZScore(observedValue, stats.mean, stats.stdDev, config.minVarianceEpsilon);
  const absZ = Math.abs(z);

  // If outside normal variance
  if (absZ >= config.zScoreMediumThreshold) {
    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM';
    if (absZ >= config.zScoreCriticalThreshold) {
      severity = 'CRITICAL';
    } else if (absZ >= config.zScoreHighThreshold) {
      severity = 'HIGH';
    }

    const direction = z > 0 ? 'above' : 'below';
    const explanation = `Observed value of ${observedValue} ${unit} is ${absZ.toFixed(2)} standard deviations ${direction} the historical mean (μ = ${stats.mean.toFixed(2)} ${unit}, σ = ${stats.stdDev.toFixed(2)} ${unit}) across ${stats.count} baseline samples.`;

    return {
      id: `anom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category,
      title: `Statistical ${category} Anomaly in ${metricName}`,
      targetResourceOrPipeline: targetIdentifier,
      detectedAt: new Date().toISOString(),
      observedValue,
      baselineMean: Number(stats.mean.toFixed(2)),
      baselineStdDev: Number(stats.stdDev.toFixed(2)),
      zScore: Number(z.toFixed(2)),
      unit,
      severity,
      explanation,
      status: 'ACTIVE',
      historicalWindowPoints: stats.count,
      dataSource: 'DEMO',
    };
  }

  return null;
}
