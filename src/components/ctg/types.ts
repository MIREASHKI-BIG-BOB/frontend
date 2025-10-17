export type CTGChannel = "fhr" | "toco" | "uc" | "tone";

export interface CTGSample {
  time: number; // seconds from the beginning of the session
  fhr: number | null;
  toco: number | null;
  uc: number | null;
  tone: number | null; // маточный тонус (0-40 mmHg)
  quality: "good" | "poor" | "lost";
}

export type CTGEventKind =
  | "acceleration"
  | "deceleration"
  | "mark"
  | "loss"
  | "anomaly";

export interface CTGEvent {
  id: string;
  kind: CTGEventKind;
  channel: CTGChannel;
  start: number;
  end: number;
  peak: number;
  amplitude: number;
  severity: "info" | "warning" | "critical";
  description: string;
  classification?: "early" | "late" | "variable";
}

export interface CTGQualitySegment {
  quality: "poor" | "lost";
  start: number;
  end: number;
}

export interface CTGMetrics {
  baseline: number | null;
  shortTermVariability: number | null;
  variabilityAmplitude: number | null;
  accelerations: {
    count: number;
    totalDuration: number;
  };
  decelerations: {
    count: number;
    totalDuration: number;
  };
  contractionFrequency: number | null; // per 10 minutes
  category: "Normal" | "Suspicious" | "Pathological";
  reasons: string[];
  hasUnstableBaseline: boolean;
}

export interface StaticWindowState {
  center: number;
  start: number;
  end: number;
  eventId: string;
}
