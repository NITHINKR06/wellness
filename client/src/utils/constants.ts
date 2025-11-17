import { Stage, Region } from '../models/result';

export const STAGES: Stage[] = [
  'First Trimester',
  'Second Trimester',
  'Third Trimester',
  'Postpartum',
];

export const REGIONS: Region[] = [
  'North',
  'South',
  'East',
  'West',
  'Central',
];

export const QUESTIONS = [
  { id: 'q1', text: 'I have been feeling sad, anxious, or empty' },
  { id: 'q2', text: 'I have lost interest in activities I used to enjoy' },
  { id: 'q3', text: 'I have been sleeping too much or too little' },
  { id: 'q4', text: 'I have had changes in my appetite' },
  { id: 'q5', text: 'I have been feeling irritable or angry' },
  { id: 'q6', text: 'I have had difficulty concentrating or making decisions' },
  { id: 'q7', text: 'I have been feeling guilty or worthless' },
  { id: 'q8', text: 'I have had thoughts of harming myself or my baby' },
  { id: 'q9', text: 'Do you feel you have adequate support from your family/partner?' },
];

export const QUESTION_LABELS: { [key: string]: string } = {
  q1: 'I have been feeling sad, anxious, or empty',
  q2: 'I have lost interest in activities I used to enjoy',
  q3: 'I have been sleeping too much or too little',
  q4: 'I have had changes in my appetite',
  q5: 'I have been feeling irritable or angry',
  q6: 'I have had difficulty concentrating or making decisions',
  q7: 'I have been feeling guilty or worthless',
  q8: 'I have had thoughts of harming myself or my baby',
  q9: 'Do you feel you have adequate support from your family/partner?',
};

