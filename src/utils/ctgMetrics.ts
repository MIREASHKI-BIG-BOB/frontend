import { CTGEvent, CTGMetrics, CTGQualitySegment, CTGSample } from "../components/ctg/types";

interface DetectionResult {
  events: CTGEvent[];
  qualitySegments: CTGQualitySegment[];
  metrics: CTGMetrics;
}

interface ComputeOptions {
  windowSec: number;
  contractionWindowSec: number;
}

const DEFAULT_OPTIONS: ComputeOptions = {
  windowSec: 600,
  contractionWindowSec: 600,
};

export function computeCTGMetrics(
  samples: CTGSample[],
  lastTimestamp: number,
  options: Partial<ComputeOptions> = {}
): DetectionResult {
  const { windowSec, contractionWindowSec } = { ...DEFAULT_OPTIONS, ...options };

  const windowStart = lastTimestamp - windowSec;
  const windowSamples = samples.filter((sample) => sample.time >= windowStart && sample.time <= lastTimestamp && sample.quality !== "lost");

  const baseline = computeBaseline(windowSamples);
  const shortTermVariability = computeShortTermVariability(windowSamples);
  const variabilityAmplitude = computeAmplitude(windowSamples);
  const qualitySegments = computeQualitySegments(samples);

  const events = detectEvents(samples, baseline, windowSec);

  const tenMinStart = lastTimestamp - contractionWindowSec;
  const tenMinSamples = samples.filter((sample) => sample.time >= tenMinStart && sample.time <= lastTimestamp);
  const contractionFrequency = computeContractionFrequency(tenMinSamples);

  const accelerations = summariseEvents(events, "acceleration", tenMinStart, lastTimestamp);
  const decelerations = summariseEvents(events, "deceleration", tenMinStart, lastTimestamp);

  const classification = classifyTrace({
    baseline,
    shortTermVariability,
    variabilityAmplitude,
    accelerations,
    decelerations,
  });

  const metrics: CTGMetrics = {
    baseline,
    shortTermVariability,
    variabilityAmplitude,
    accelerations,
    decelerations,
    contractionFrequency,
    category: classification.category,
    reasons: classification.reasons,
    hasUnstableBaseline: classification.hasUnstableBaseline,
  };

  return { events, qualitySegments, metrics };
}

function computeBaseline(samples: CTGSample[]) {
  const fhrValues = samples.map((sample) => sample.fhr).filter((value): value is number => value !== null && !Number.isNaN(value));
  if (!fhrValues.length) {
    return null;
  }
  const sum = fhrValues.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / fhrValues.length);
}

function computeShortTermVariability(samples: CTGSample[]) {
  const values = samples
    .map((sample) => sample.fhr)
    .filter((value): value is number => value !== null && !Number.isNaN(value));
  if (values.length < 2) {
    return null;
  }
  let sumDiff = 0;
  for (let i = 1; i < values.length; i += 1) {
    sumDiff += Math.abs(values[i] - values[i - 1]);
  }
  return Math.round(sumDiff / (values.length - 1));
}

function computeAmplitude(samples: CTGSample[]) {
  const values = samples
    .map((sample) => sample.fhr)
    .filter((value): value is number => value !== null && !Number.isNaN(value));
  if (!values.length) {
    return null;
  }
  return Math.round(Math.max(...values) - Math.min(...values));
}

function computeQualitySegments(samples: CTGSample[]): CTGQualitySegment[] {
  const segments: CTGQualitySegment[] = [];
  let current: CTGQualitySegment | null = null;
  for (const sample of samples) {
    if (sample.quality === "good") {
      if (current) {
        current.end = sample.time;
        segments.push(current);
        current = null;
      }
      continue;
    }
    if (current && current.quality === sample.quality) {
      current.end = sample.time;
    } else {
      if (current) {
        segments.push(current);
      }
      current = { quality: sample.quality, start: sample.time, end: sample.time };
    }
  }
  if (current) {
    segments.push(current);
  }
  return segments;
}

function detectEvents(samples: CTGSample[], baseline: number | null, windowSec: number): CTGEvent[] {
  if (!samples.length) {
    return [];
  }

  const events: CTGEvent[] = [];
  const relevantSamples = samples.slice(-windowSec * 2);
  const effectiveBaseline = baseline ?? 140;

  let ongoingAcceleration: { start: CTGSample; peakValue: number; peakTime: number } | null = null;
  let ongoingDeceleration: { start: CTGSample; nadirValue: number; nadirTime: number } | null = null;

  for (const sample of relevantSamples) {
    const { fhr, time, toco } = sample;
    if (fhr === null) {
      continue;
    }
    const delta = fhr - effectiveBaseline;

    // Accelerations detection
    if (delta >= 15) {
      if (!ongoingAcceleration) {
        ongoingAcceleration = { start: sample, peakValue: fhr, peakTime: time };
      }
      if (fhr > (ongoingAcceleration?.peakValue ?? 0)) {
        ongoingAcceleration.peakValue = fhr;
        ongoingAcceleration.peakTime = time;
      }
    } else if (ongoingAcceleration) {
      const duration = time - ongoingAcceleration.start.time;
      if (duration >= 15) {
        events.push({
          id: `acc-${ongoingAcceleration.start.time}`,
          kind: "acceleration",
          channel: "fhr",
          start: ongoingAcceleration.start.time,
          end: time,
          peak: ongoingAcceleration.peakTime,
          amplitude: ongoingAcceleration.peakValue - effectiveBaseline,
          severity: ongoingAcceleration.peakValue - effectiveBaseline > 25 ? "warning" : "info",
          description: `Acceleration ${duration.toFixed(0)}s` ,
        });
      }
      ongoingAcceleration = null;
    }

    // Decelerations detection
    if (delta <= -15) {
      if (!ongoingDeceleration) {
        ongoingDeceleration = { start: sample, nadirValue: fhr, nadirTime: time };
      }
      if (fhr < (ongoingDeceleration?.nadirValue ?? Number.POSITIVE_INFINITY)) {
        ongoingDeceleration.nadirValue = fhr;
        ongoingDeceleration.nadirTime = time;
      }
    } else if (ongoingDeceleration) {
      const duration = time - ongoingDeceleration.start.time;
      if (duration >= 15) {
        const classification = classifyDeceleration(ongoingDeceleration, relevantSamples, toco ?? 0);
        events.push({
          id: `dec-${ongoingDeceleration.start.time}`,
          kind: "deceleration",
          channel: "fhr",
          start: ongoingDeceleration.start.time,
          end: time,
          peak: ongoingDeceleration.nadirTime,
          amplitude: effectiveBaseline - ongoingDeceleration.nadirValue,
          severity:
            effectiveBaseline - ongoingDeceleration.nadirValue > 40 || duration > 90
              ? "critical"
              : "warning",
          description: `${classification.toUpperCase()} deceleration ${duration.toFixed(0)}s`,
          classification,
        });
      }
      ongoingDeceleration = null;
    }
  }

  // Signal loss detection
  for (const segment of computeQualitySegments(samples)) {
    events.push({
      id: `qual-${segment.start}`,
      kind: "loss",
      channel: "fhr",
      start: segment.start,
      end: segment.end,
      peak: segment.start,
      amplitude: 0,
      severity: segment.quality === "lost" ? "critical" : "warning",
      description: segment.quality === "lost" ? "Signal lost" : "Poor trace",
    });
  }

  return events;
}

function classifyDeceleration(
  decel: { start: CTGSample; nadirValue: number; nadirTime: number },
  samples: CTGSample[],
  instantaneousToco: number
): "early" | "late" | "variable" {
  const window = samples.filter((sample) => sample.time >= decel.start.time - 60 && sample.time <= decel.start.time + 120);
  if (!window.length) {
    return "variable";
  }
  const tocoPeak = window.reduce<{ value: number; time: number } | null>((acc, sample) => {
    const value = sample.toco ?? 0;
    if (!acc || value > acc.value) {
      return { value, time: sample.time };
    }
    return acc;
  }, null);
  if (!tocoPeak || tocoPeak.value < 30) {
    return "variable";
  }
  const deltaTime = decel.nadirTime - tocoPeak.time;
  if (Math.abs(deltaTime) <= 15) {
    return "early";
  }
  if (deltaTime > 15) {
    return "late";
  }
  return "variable";
}

function computeContractionFrequency(samples: CTGSample[]) {
  if (!samples.length) {
    return null;
  }
  let count = 0;
  let aboveThreshold = false;
  const threshold = 25;
  for (const sample of samples) {
    const value = sample.toco ?? 0;
    if (value >= threshold && !aboveThreshold) {
      count += 1;
      aboveThreshold = true;
    }
    if (value < threshold - 5) {
      aboveThreshold = false;
    }
  }
  return count;
}

function summariseEvents(
  events: CTGEvent[],
  kind: CTGEvent["kind"],
  start: number,
  end: number
): { count: number; totalDuration: number } {
  const filtered = events.filter((event) => event.kind === kind && event.start >= start && event.end <= end);
  const totalDuration = filtered.reduce((acc, event) => acc + (event.end - event.start), 0);
  return {
    count: filtered.length,
    totalDuration: Math.round(totalDuration),
  };
}

function classifyTrace(input: {
  baseline: number | null;
  shortTermVariability: number | null;
  variabilityAmplitude: number | null;
  accelerations: { count: number; totalDuration: number };
  decelerations: { count: number; totalDuration: number };
}): { category: "Normal" | "Suspicious" | "Pathological"; reasons: string[]; hasUnstableBaseline: boolean } {
  const reasons: string[] = [];
  let category: "Normal" | "Suspicious" | "Pathological" = "Normal";
  let hasUnstableBaseline = false;

  if (input.baseline === null) {
    reasons.push("Baseline not determined");
    hasUnstableBaseline = true;
    category = "Suspicious";
  } else {
    if (input.baseline < 110 || input.baseline > 160) {
      reasons.push(`Baseline ${input.baseline} bpm`);
      category = input.baseline < 100 || input.baseline > 170 ? "Pathological" : "Suspicious";
    }
  }

  if (input.shortTermVariability === null || input.shortTermVariability < 3) {
    reasons.push("Low variability");
    category = "Pathological";
  } else if (input.shortTermVariability < 5 || (input.variabilityAmplitude ?? 0) < 10) {
    reasons.push("Reduced variability");
    category = category === "Pathological" ? "Pathological" : "Suspicious";
  }

  if (input.decelerations.count > 0) {
    reasons.push(`Decelerations x${input.decelerations.count}`);
    category = "Pathological";
  }

  if (!reasons.length) {
    reasons.push("All parameters within normal range");
  }

  return { category, reasons, hasUnstableBaseline };
}

export function buildSample(
  time: number,
  fhr: number | null,
  toco: number | null,
  uc: number | null
): CTGSample {
  return {
    time,
    fhr,
    toco,
    uc,
    quality: classifyQuality(fhr),
  };
}

function classifyQuality(fhr: number | null): "good" | "poor" | "lost" {
  if (fhr === null || Number.isNaN(fhr) || fhr <= 0) {
    return "lost";
  }
  if (fhr < 60 || fhr > 220) {
    return "poor";
  }
  return "good";
}
