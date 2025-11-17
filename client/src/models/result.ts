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

export interface QuestionnaireSubmission {
  stage: Stage;
  region: Region;
  sleepHours: number;
  questionnaireResponses: QuestionnaireResponse;
  middleEastCountry?: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Complete assessment result
export interface AssessmentResult {
  id: string;
  stage: Stage;
  region: Region;
  sleepHours: number;
  questionnaireResponses: QuestionnaireResponse;
  riskResult: RiskResult;
  score: number;
  maxScore: number;
  riskFactors: string[];
  riskThreshold?: number;
  modelVersion?: string;
  riskBreakdown?: { [questionId: string]: number };
  timestamp: Date;
  middleEastCountry?: string;
}

