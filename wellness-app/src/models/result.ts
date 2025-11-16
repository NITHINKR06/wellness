// Stage enum - represents pregnancy/postpartum stages
export type Stage = 
  | 'First Trimester'
  | 'Second Trimester'
  | 'Third Trimester'
  | 'Postpartum';

// Region type - can be extended with specific regions
export type Region = string;

// Risk assessment result
export type RiskResult = 'Possible PPD Risk' | 'Low Risk';

// Questionnaire response - answers to true/false questions
export interface QuestionnaireResponse {
  [questionId: string]: boolean;
}

// Complete assessment result
export interface AssessmentResult {
  id: string;
  stage: Stage;
  region: Region;
  sleepHours: number;
  questionnaireResponses: QuestionnaireResponse;
  riskResult: RiskResult;
  timestamp: Date;
}

