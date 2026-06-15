export type ScoringSignals = {
  technicalSkills?: number;
  experience?: number;
  communication?: number;
  consistency?: number;
  motivation?: number;
};

export type Recommendation =
  | "REJECT"
  | "CONSIDER"
  | "INTERVIEW"
  | "STRONG_MATCH";

const weights = {
  technicalSkills: 0.4,
  experience: 0.25,
  communication: 0.15,
  consistency: 0.1,
  motivation: 0.1,
};

function normalize(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 50;
  }

  return Math.min(100, Math.max(0, value));
}

export function calculateRecruitmentScore(signals: ScoringSignals) {
  const score =
    normalize(signals.technicalSkills) * weights.technicalSkills +
    normalize(signals.experience) * weights.experience +
    normalize(signals.communication) * weights.communication +
    normalize(signals.consistency) * weights.consistency +
    normalize(signals.motivation) * weights.motivation;

  return Math.round(score);
}

export function recommendationFromScore(score: number): Recommendation {
  if (score >= 85) return "STRONG_MATCH";
  if (score >= 70) return "INTERVIEW";
  if (score >= 50) return "CONSIDER";
  return "REJECT";
}
