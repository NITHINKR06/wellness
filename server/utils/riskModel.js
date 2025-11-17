const QUESTION_WEIGHTS = {
  q1: 1,
  q2: 1,
  q3: 1,
  q4: 1,
  q5: 1,
  q6: 1,
  q7: 1,
  // Thoughts of self-harm is weighted higher to reflect clinical severity
  q8: 2,
  q9: 1, // Lack of support counts as a risk factor when answered "No"
};

const MODEL_VERSION = 'weighted-v1';
const RISK_THRESHOLD = 5; // Equivalent to ~50% of the weighted maximum (10)

const QUESTION_IDS = Object.keys(QUESTION_WEIGHTS);
const MAX_SCORE = Object.values(QUESTION_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

const normalizeResponses = (rawResponses = {}) => {
  const normalized = {};

  QUESTION_IDS.forEach((id) => {
    const value = rawResponses[id];
    if (typeof value === 'boolean') {
      normalized[id] = value;
    }
  });

  return normalized;
};

const calculateRiskScore = (rawResponses = {}) => {
  const normalizedResponses = normalizeResponses(rawResponses);
  const breakdown = {};
  let score = 0;

  QUESTION_IDS.forEach((id) => {
    const weight = QUESTION_WEIGHTS[id];
    const value = normalizedResponses[id];
    let contribution = 0;

    if (id === 'q9') {
      // q9 is phrased positively (adequate support). Count as risk only when explicitly false.
      if (value === false) {
        contribution = weight;
      }
    } else if (value === true) {
      contribution = weight;
    }

    breakdown[id] = contribution;
    score += contribution;
  });

  const riskFactors = Object.entries(breakdown)
    .filter(([, contribution]) => contribution > 0)
    .map(([questionId]) => questionId);

  const resultLabel = score >= RISK_THRESHOLD ? 'Possible PPD Risk' : 'Low Risk';

  return {
    score,
    maxScore: MAX_SCORE,
    threshold: RISK_THRESHOLD,
    resultLabel,
    riskFactors,
    breakdown,
    normalizedResponses,
    modelVersion: MODEL_VERSION,
  };
};

module.exports = {
  calculateRiskScore,
  QUESTION_WEIGHTS,
  MODEL_VERSION,
  MAX_SCORE,
  RISK_THRESHOLD,
};

