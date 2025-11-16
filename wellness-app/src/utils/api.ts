import { AssessmentResult, QuestionnaireResponse } from '../models/result';
import { Platform } from 'react-native';

// Backend API base URL - adjust this based on your environment
// 
// CONFIGURATION:
// - Android Emulator: Use 'http://10.0.2.2:4000/api'
// - Android Physical Device: Use your computer's IP (e.g., 'http://192.168.1.100:4000/api')
// - iOS Simulator: Use 'http://localhost:4000/api'
// - iOS Physical Device: Use your computer's IP
// 
// To find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
// Look for IPv4 Address under your WiFi/Ethernet adapter (not VirtualBox/VMware)

// Set USE_EMULATOR to true if using Android Emulator, false for physical device
const USE_EMULATOR = false; // Change to true for Android emulator
const LOCAL_IP_ADDRESS = '192.168.0.108'; // Your WiFi IP address (found via ipconfig)

const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      if (USE_EMULATOR) {
        return 'http://10.0.2.2:4000/api'; // Android emulator
      } else {
        return `http://${LOCAL_IP_ADDRESS}:4000/api`; // Physical Android device
      }
    } else {
      // iOS simulator or web
      return 'http://localhost:4000/api';
    }
  }
  // Production URL - update this with your actual production API URL
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Map frontend questionnaire responses to backend format
 * Frontend has 8 questions (q1-q8), backend expects 4 specific fields
 */
const mapToBackendFormat = (questionnaireResponses: QuestionnaireResponse) => {
  // Map questions to backend fields:
  // q4 -> appetite (changes in appetite)
  // q1, q2, q5, q6, q7 -> mood (any mood-related question)
  // q8 -> history (thoughts of harming)
  // support -> default to true (adequate support) or can be derived from context
  
  const appetite = questionnaireResponses['q4'] || false; // Changes in appetite
  const mood = !!(
    questionnaireResponses['q1'] || // Feeling sad, anxious, or empty
    questionnaireResponses['q2'] || // Lost interest
    questionnaireResponses['q5'] || // Feeling irritable or angry
    questionnaireResponses['q6'] || // Difficulty concentrating
    questionnaireResponses['q7']    // Feeling guilty or worthless
  );
  const support = true; // Default to adequate support (can be updated if you add a support question)
  const history = questionnaireResponses['q8'] || false; // Thoughts of harming

  return { appetite, mood, support, history };
};

/**
 * Fetch with timeout helper
 */
const fetchWithTimeout = (url: string, options: RequestInit, timeout = 5000): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
};

/**
 * Map backend response to frontend format
 */
const mapFromBackendFormat = (backendResponse: any): AssessmentResult => {
  // Reconstruct questionnaireResponses from backend fields
  // This is a simplified mapping - you may want to adjust based on your needs
  const questionnaireResponses: QuestionnaireResponse = {
    q4: backendResponse.appetite,
    q1: backendResponse.mood,
    q2: backendResponse.mood,
    q5: backendResponse.mood,
    q6: backendResponse.mood,
    q7: backendResponse.mood,
    q8: backendResponse.history,
  };

  return {
    id: backendResponse._id || backendResponse.id,
    stage: backendResponse.stage,
    region: backendResponse.region,
    sleepHours: backendResponse.sleepHours,
    questionnaireResponses,
    riskResult: backendResponse.resultLabel as 'Possible PPD Risk' | 'Low Risk',
    timestamp: new Date(backendResponse.createdAt),
  };
};

/**
 * Submit questionnaire response to backend
 */
export const submitQuestionnaire = async (
  assessmentResult: AssessmentResult
): Promise<AssessmentResult> => {
  try {
    const { appetite, mood, support, history } = mapToBackendFormat(
      assessmentResult.questionnaireResponses
    );

    const response = await fetchWithTimeout(`${API_BASE_URL}/questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stage: assessmentResult.stage,
        region: assessmentResult.region,
        sleepHours: assessmentResult.sleepHours,
        appetite,
        mood,
        support,
        history,
      }),
    }, 10000); // 10 second timeout for POST

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit questionnaire');
    }

    const data = await response.json();
    return mapFromBackendFormat(data.data);
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    throw error;
  }
};

/**
 * Fetch all questionnaire responses from backend
 */
export const fetchAllResponses = async (): Promise<AssessmentResult[]> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/questionnaire`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 5000); // 5 second timeout

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch responses');
    }

    const data = await response.json();
    return data.data.map(mapFromBackendFormat);
  } catch (error) {
    console.error('Error fetching responses:', error);
    throw error;
  }
};

/**
 * Check backend health
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

