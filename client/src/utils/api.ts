import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  AssessmentResult,
  QuestionnaireSubmission,
  QuestionnaireResponse,
  AuthResponse,
} from '../models/result';

/**
 * API Configuration
 * 
 * CONFIGURATION:
 * - Android Emulator: Use 'http://10.0.2.2:4000/api'
 * - Android Physical Device: Use your computer's IP (e.g., 'http://192.168.1.100:4000/api')
 * - iOS Simulator: Use 'http://localhost:4000/api'
 * - iOS Physical Device: Use your computer's IP
 * 
 * To find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
 * Look for IPv4 Address under your WiFi/Ethernet adapter (not VirtualBox/VMware)
 */
const USE_EMULATOR = false;
const LOCAL_IP_ADDRESS = '192.168.0.109';

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
  // For now, using the same local IP for production builds
  // TODO: Replace with your actual production API URL
  // You can also use environment variables via EAS Build secrets
  return `http://${LOCAL_IP_ADDRESS}:4000/api`;
};

const API_BASE_URL = getApiBaseUrl();
const OFFLINE_QUEUE_KEY = '@wellness/offlineQueue';
export const OFFLINE_ERROR_CODE = 'OFFLINE_SUBMISSION_QUEUED';

type OfflineSubmission = {
  submission: QuestionnaireSubmission;
  queuedAt: string;
};

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const isNetworkError = (error: any) =>
  error?.message === 'Request timeout' ||
  error?.message?.includes('NetworkError') ||
  error?.message?.includes('fetch failed') ||
  error?.message?.includes('Network request failed') ||
  error?.name === 'TypeError';

type HeaderMap = Record<string, string>;
type FetchRequestOptions = {
  method?: string;
  headers?: HeaderMap;
  body?: string;
};

const buildHeaders = (authRequired: boolean, extraHeaders?: HeaderMap): HeaderMap => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };

  if (authRequired) {
    if (!authToken) {
      throw new Error('You are no longer authenticated. Please sign in again.');
    }
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
};

/**
 * Fetch with timeout helper
 */
const fetchWithTimeout = (
  url: string,
  options: FetchRequestOptions,
  timeout = 5000,
  authRequired = true
): Promise<Response> => {
  const headers = buildHeaders(authRequired, options.headers);
  return Promise.race([
    fetch(url, { ...options, headers }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeout)),
  ]);
};

const handleJsonResponse = async (response: Response, defaultError: string) => {
  if (response.ok) {
    return response.json();
  }

  let errorMessage = defaultError;
  try {
    const errorData = await response.json();
    if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    } else if (errorData.errors && Array.isArray(errorData.errors)) {
      errorMessage = errorData.errors.map((e: any) => e.msg || e.message).join(', ');
    }
  } catch (error) {
    // Ignore JSON parse errors and use default error message
  }

  throw new Error(errorMessage);
};

const readOfflineQueue = async (): Promise<OfflineSubmission[]> => {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OfflineSubmission[];
  } catch (error) {
    console.error('Failed to parse offline queue payload. Clearing queue.', error);
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    return [];
  }
};

const persistOfflineQueue = async (queue: OfflineSubmission[]) => {
  if (!queue.length) {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    return;
  }
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

const enqueueOfflineSubmission = async (submission: QuestionnaireSubmission) => {
  const queue = await readOfflineQueue();
  queue.push({
    submission,
    queuedAt: new Date().toISOString(),
  });
  await persistOfflineQueue(queue);
};

export const getQueuedSubmissionCount = async () => {
  const queue = await readOfflineQueue();
  return queue.length;
};

export const queueSubmissionForLater = async (submission: QuestionnaireSubmission) => {
  await enqueueOfflineSubmission(submission);
};

/**
 * Map backend response to frontend format
 */

/**
 * Map backend response to frontend format
 */
const mapFromBackendFormat = (backendResponse: any): AssessmentResult => {
  // Use stored individual question responses if available (preferred method)
  // Otherwise, fall back to reconstruction from aggregated fields (for backward compatibility)
  let questionnaireResponses: QuestionnaireResponse = {};
  
  if (backendResponse.questionnaireResponses && 
      typeof backendResponse.questionnaireResponses === 'object' &&
      !Array.isArray(backendResponse.questionnaireResponses)) {
    // Use stored individual responses (most accurate)
    // MongoDB Map type is serialized as a plain object in JSON responses
    questionnaireResponses = { ...backendResponse.questionnaireResponses };
  } else {
    // Fallback: Reconstruct from aggregated fields (for old records without individual responses)
    // Note: This is a best-effort reconstruction since we can't perfectly reverse
    // the OR logic used in mapping multiple questions to a single field
    questionnaireResponses = {
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
  }

  return {
    id: backendResponse._id || backendResponse.id,
    stage: backendResponse.stage,
    region: backendResponse.region,
    middleEastCountry: backendResponse.middleEastCountry || undefined,
    sleepHours: backendResponse.sleepHours,
    questionnaireResponses,
    riskResult: backendResponse.resultLabel as 'Possible PPD Risk' | 'Low Risk',
    score: backendResponse.score ?? 0,
    maxScore: backendResponse.maxScore ?? 0,
    riskFactors: backendResponse.riskFactors ?? [],
    riskThreshold: backendResponse.riskThreshold,
    modelVersion: backendResponse.modelVersion,
    riskBreakdown: backendResponse.riskBreakdown
      ? { ...backendResponse.riskBreakdown }
      : undefined,
    timestamp: backendResponse.createdAt ? new Date(backendResponse.createdAt) : new Date(),
  };
};

const sendQuestionnaire = async (
  submission: QuestionnaireSubmission
): Promise<AssessmentResult> => {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/questionnaire`,
    {
      method: 'POST',
      body: JSON.stringify({
        stage: submission.stage,
        region: submission.region,
        middleEastCountry:
          submission.region === 'Middle East' ? submission.middleEastCountry ?? null : null,
        sleepHours: submission.sleepHours,
        questionnaireResponses: submission.questionnaireResponses,
      }),
    },
    10000,
    true
  );

  const data = await handleJsonResponse(response, 'Failed to submit questionnaire to MongoDB');
  if (!data.success || !data.data) {
    throw new Error('Invalid response from server');
  }
  return mapFromBackendFormat(data.data);
};

/**
 * Submit questionnaire response to backend
 */
export const submitQuestionnaire = async (
  submission: QuestionnaireSubmission,
  options: { skipQueue?: boolean } = {}
): Promise<AssessmentResult> => {
  const { skipQueue = false } = options;
  const networkState = await NetInfo.fetch();
  const isOffline = !networkState.isConnected || networkState.isInternetReachable === false;

  if (isOffline && !skipQueue) {
    await enqueueOfflineSubmission(submission);
    const offlineError = new Error(OFFLINE_ERROR_CODE);
    offlineError.name = 'OfflineError';
    throw offlineError;
  }

  try {
    return await sendQuestionnaire(submission);
  } catch (error: any) {
    if (!skipQueue && isNetworkError(error)) {
      await enqueueOfflineSubmission(submission);
      const offlineError = new Error(OFFLINE_ERROR_CODE);
      offlineError.name = 'OfflineError';
      throw offlineError;
    }

    console.error('Error submitting questionnaire:', error);
    throw error;
  }
};

export const flushOfflineQueue = async (): Promise<{ synced: number; remaining: number }> => {
  const queue = await readOfflineQueue();
  if (!queue.length) {
    return { synced: 0, remaining: 0 };
  }

  const remaining: OfflineSubmission[] = [];
  let synced = 0;

  for (const entry of queue) {
    try {
      await sendQuestionnaire(entry.submission);
      synced += 1;
    } catch (error) {
      if (isNetworkError(error)) {
        remaining.push(entry, ...queue.slice(queue.indexOf(entry) + 1));
        break;
      }
      console.error('Failed to replay offline submission:', error);
    }
  }

  if (synced === queue.length) {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    return { synced, remaining: 0 };
  }

  await persistOfflineQueue(remaining);
  return { synced, remaining: remaining.length };
};

/**
 * Fetch all questionnaire responses from backend
 */
export const fetchAllResponses = async (): Promise<AssessmentResult[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/questionnaire`,
      { method: 'GET' },
      5000,
      true
    );

    const data = await handleJsonResponse(response, 'Failed to fetch responses from MongoDB');
    if (!data.success || !data.data) {
      return [];
    }
    return data.data.map(mapFromBackendFormat);
  } catch (error: any) {
    if (isNetworkError(error)) {
      return [];
    }
    console.error('Error fetching responses:', error);
    throw error;
  }
};

/**
 * Delete a questionnaire response (soft delete)
 */
export const deleteResponse = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/questionnaire/${id}`,
      {
        method: 'DELETE',
      },
      5000,
      true
    );

    await handleJsonResponse(response, 'Failed to delete response from MongoDB');
  } catch (error: any) {
    console.error('Error deleting response:', error);
    throw error;
  }
};

/**
 * Check backend health
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/health`,
      { method: 'GET' },
      4000,
      false
    );
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

const handleAuthRequest = async (endpoint: 'login' | 'register', email: string, password: string) => {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/auth/${endpoint}`,
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    5000,
    false
  );

  const data = await handleJsonResponse(
    response,
    endpoint === 'login' ? 'Failed to sign in' : 'Failed to register'
  );

  if (!data.success || !data.data?.token || !data.data?.user) {
    throw new Error('Invalid response from authentication server');
  }

  return data.data as AuthResponse;
};

export const signInUser = (email: string, password: string) =>
  handleAuthRequest('login', email, password);

export const registerUser = (email: string, password: string) =>
  handleAuthRequest('register', email, password);

