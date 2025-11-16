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
 * Frontend has 9 questions (q1-q9), backend expects 4 specific fields
 */
const mapToBackendFormat = (questionnaireResponses: QuestionnaireResponse) => {
  // Map questions to backend fields:
  // q4 -> appetite (changes in appetite)
  // q1, q2, q3, q5, q6, q7 -> mood (any mood-related question, including sleep issues)
  // q8 -> history (thoughts of harming)
  // q9 -> support (inverted: true = adequate support, false = lack of support)
  // Note: Server counts lack of support (!support) as a risk factor
  
  const appetite = questionnaireResponses['q4'] === true; // Changes in appetite (only true if explicitly answered)
  const mood = !!(
    questionnaireResponses['q1'] || // Feeling sad, anxious, or empty
    questionnaireResponses['q2'] || // Lost interest
    questionnaireResponses['q3'] || // Sleeping too much or too little (now included)
    questionnaireResponses['q5'] || // Feeling irritable or angry
    questionnaireResponses['q6'] || // Difficulty concentrating
    questionnaireResponses['q7']    // Feeling guilty or worthless
  );
  // Support: only count as false (lack of support) if explicitly answered as false
  // If not answered (undefined), treat as null/undefined so it doesn't count as a risk factor
  const support = questionnaireResponses.hasOwnProperty('q9') 
    ? questionnaireResponses['q9'] === true  // Explicitly answered: true = adequate support
    : null; // Not answered: don't count as risk factor
  const history = questionnaireResponses['q8'] === true; // Thoughts of harming (only true if explicitly answered)

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
  // Note: This is a best-effort reconstruction since we can't perfectly reverse
  // the OR logic used in mapping multiple questions to a single field
  const questionnaireResponses: QuestionnaireResponse = {
    q4: backendResponse.appetite,
    q1: backendResponse.mood, // If mood is true, at least one of q1,q2,q3,q5,q6,q7 was true
    q2: backendResponse.mood,
    q3: backendResponse.mood, // Now included in mood calculation
    q5: backendResponse.mood,
    q6: backendResponse.mood,
    q7: backendResponse.mood,
    q8: backendResponse.history,
    // Only include q9 if support was explicitly answered (not null)
    ...(backendResponse.support !== null && backendResponse.support !== undefined && {
      q9: backendResponse.support // Support question (true = adequate support, false = lack of support)
    }),
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
      let errorMessage = 'Failed to submit questionnaire to MongoDB';
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((e: any) => e.msg || e.message).join(', ');
        }
      } catch (parseError) {
        // If we can't parse the error, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error('Invalid response from server');
    }
    return mapFromBackendFormat(data.data);
  } catch (error: any) {
    console.error('Error submitting questionnaire:', error);
    // Provide more user-friendly error messages
    if (error.message === 'Request timeout') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    if (error.message.includes('NetworkError') || error.message.includes('fetch failed')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
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
      let errorMessage = 'Failed to fetch responses from MongoDB';
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (parseError) {
        // If we can't parse the error, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      // Return empty array if invalid response (graceful degradation)
      return [];
    }
    return data.data.map(mapFromBackendFormat);
  } catch (error: any) {
    console.error('Error fetching responses:', error);
    // Provide user-friendly error messages
    if (error.message === 'Request timeout') {
      throw new Error('Request timed out. Please check your internet connection.');
    }
    if (error.message.includes('NetworkError') || error.message.includes('fetch failed')) {
      // Return empty array on network error (graceful degradation)
      return [];
    }
    throw error;
  }
};

/**
 * Delete a questionnaire response (soft delete)
 */
export const deleteResponse = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/questionnaire/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 5000); // 5 second timeout

    if (!response.ok) {
      let errorMessage = 'Failed to delete response from MongoDB';
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (parseError) {
        // If we can't parse the error, use default message
      }
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('Error deleting response:', error);
    // Provide user-friendly error messages
    if (error.message === 'Request timeout') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.message.includes('NetworkError') || error.message.includes('fetch failed')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
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

