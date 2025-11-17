import { QuestionnaireResponse, RiskResult } from '../models/result';

/**
 * Calculate risk factors from questionnaire responses
 */
export const calculateRiskFactors = (responses: QuestionnaireResponse) => {
  const appetite = responses['q4'] === true;
  const mood = !!(
    responses['q1'] ||
    responses['q2'] ||
    responses['q3'] ||
    responses['q5'] ||
    responses['q6'] ||
    responses['q7']
  );
  const lackOfSupport = responses.hasOwnProperty('q9') && responses['q9'] === false;
  const history = responses['q8'] === true;

  return { appetite, mood, lackOfSupport, history };
};

/**
 * Calculate risk score (count of positive risk factors)
 */
export const calculateRiskScore = (responses: QuestionnaireResponse): number => {
  const { appetite, mood, lackOfSupport, history } = calculateRiskFactors(responses);
  return [appetite, mood, lackOfSupport, history].filter(Boolean).length;
};

/**
 * Calculate risk result based on questionnaire responses
 */
export const calculateRiskResult = (responses: QuestionnaireResponse): RiskResult => {
  const score = calculateRiskScore(responses);
  return score >= 2 ? 'Possible PPD Risk' : 'Low Risk';
};

