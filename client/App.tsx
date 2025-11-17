import React, { useCallback, useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import DetailedResultScreen from './src/screens/DetailedResultScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { AssessmentResult, QuestionnaireSubmission } from './src/models/result';
import { QUESTIONS } from './src/utils/constants';
import {
  submitQuestionnaire,
  fetchAllResponses,
  flushOfflineQueue,
  OFFLINE_ERROR_CODE,
  deleteResponse,
  queueSubmissionForLater,
} from './src/utils/api';
import { AuthProvider, useAuth } from './src/context/AuthContext';

type Screen = 'home' | 'questionnaire' | 'results' | 'detailedResult' | 'resources' | 'profile';

const LOCAL_RISK_THRESHOLD = 4;

const simulateLocalAssessment = (submission: QuestionnaireSubmission): AssessmentResult => {
  const riskFactors: string[] = [];

  QUESTIONS.forEach((question) => {
    const answer = submission.questionnaireResponses[question.id];
    if (question.id === 'q9') {
      if (answer === false) {
        riskFactors.push(question.id);
      }
    } else if (answer === true) {
      riskFactors.push(question.id);
    }
  });

  const score = riskFactors.length;
  const riskResult: AssessmentResult['riskResult'] =
    score >= LOCAL_RISK_THRESHOLD ? 'Possible PPD Risk' : 'Low Risk';

  const riskBreakdown = riskFactors.reduce<Record<string, number>>((acc, id) => {
    acc[id] = 1;
    return acc;
  }, {});

  return {
    id: `local-${Date.now()}`,
    stage: submission.stage,
    region: submission.region,
    sleepHours: submission.sleepHours,
    questionnaireResponses: { ...submission.questionnaireResponses },
    riskResult,
    score,
    maxScore: QUESTIONS.length,
    riskFactors,
    riskThreshold: LOCAL_RISK_THRESHOLD,
    modelVersion: 'local-simulation',
    riskBreakdown,
    timestamp: new Date(),
  };
};

const AppShell = () => {
  const { isAuthenticated, initializing, user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [resultsHistory, setResultsHistory] = useState<AssessmentResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSyncMessage = useCallback((message: string, persistent = false) => {
    setSyncMessage(message);
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    if (!persistent) {
      syncTimeoutRef.current = setTimeout(() => setSyncMessage(null), 4000);
    }
  }, []);

  useEffect(
    () => () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    },
    []
  );

  const loadResults = useCallback(
    async (options: { showLoader?: boolean } = {}) => {
      const { showLoader = false } = options;
      const startTime = Date.now();
      const minLoadingTime = 1000;
      if (showLoader) {
        setIsLoading(true);
      }
      try {
        const responses = await fetchAllResponses();
        setResultsHistory(responses);
      } catch (error: any) {
        const isNetworkError =
          error?.message?.includes('Network') ||
          error?.message?.includes('fetch failed') ||
          error?.name === 'TypeError';
        if (!isNetworkError) {
          console.error('Failed to load results from MongoDB:', error);
        }
      } finally {
        if (showLoader) {
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsed);
          setTimeout(() => {
            setIsLoading(false);
          }, remainingTime);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setResultsHistory([]);
      setIsLoading(false);
      setCurrentScreen('home');
      return;
    }
    loadResults({ showLoader: true });
  }, [isAuthenticated, loadResults]);

  const syncOfflineSubmissions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const result = await flushOfflineQueue();
      if (result.synced > 0) {
        await loadResults();
        showSyncMessage(
          `Synced ${result.synced} queued submission${result.synced > 1 ? 's' : ''}.`
        );
      } else if (result.remaining === 0) {
        setSyncMessage(null);
      }
    } catch (error) {
      console.error('Failed to sync queued submissions:', error);
    }
  }, [isAuthenticated, loadResults, showSyncMessage]);

  useEffect(() => {
    if (!isAuthenticated) return;
    syncOfflineSubmissions();
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable !== false;
      if (online) {
        syncOfflineSubmissions();
      } else {
        showSyncMessage('Offline mode: submissions will sync when you reconnect.', true);
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated, syncOfflineSubmissions, showSyncMessage]);

  const handleSubmit = async (submission: QuestionnaireSubmission) => {
    setIsSubmitting(true);
    try {
      if (!isAuthenticated) {
        const localResult = simulateLocalAssessment(submission);
        setResultsHistory((prev) => [localResult, ...prev]);
        await queueSubmissionForLater(submission);
        setCurrentScreen('results');
        Alert.alert(
          'Temporary result saved',
          'This assessment is stored on this device only for now. Sign in before closing the app to sync it to your account.'
        );
        return;
      }

      const savedResult = await submitQuestionnaire(submission);
      setResultsHistory((prev) => [savedResult, ...prev]);
      setCurrentScreen('results');
    } catch (error: any) {
      if (error?.message === OFFLINE_ERROR_CODE || error?.name === 'OfflineError') {
        Alert.alert(
          'Offline Submission Saved',
          'You are offline. The assessment was queued and will sync automatically when you reconnect.'
        );
      } else {
        const errorMessage = error?.message || 'An unknown error occurred. Please try again.';
        Alert.alert(
          'Submission Failed',
          `${errorMessage}\n\nYour assessment will be saved once the connection succeeds.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Retry',
              onPress: () => handleSubmit(submission),
              style: 'default',
            },
          ]
        );
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!isAuthenticated) {
      setResultsHistory((prev) => prev.filter((result) => result.id !== id));
      return;
    }
    await deleteResponse(id);
    await loadResults();
  };

  const onHomeScreen = currentScreen === 'home';
  const handleNavigateToHome = () => setCurrentScreen('home');
  const handleNavigateToProfile = () => setCurrentScreen('profile');
  const handleNavigateToQuestionnaire = () => setCurrentScreen('questionnaire');
  const handleNavigateToResults = () => setCurrentScreen('results');
  const isResultsScreen =
    currentScreen === 'results' || currentScreen === 'detailedResult';

  if (initializing || (isAuthenticated && isLoading)) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isAuthenticated ? 'auto' : 'dark'} />
      {syncMessage && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncBannerText}>{syncMessage}</Text>
        </View>
      )}

      <View style={styles.screenContainer}>
        {currentScreen === 'home' ? (
          <HomeScreen
            onNavigateToQuestionnaire={handleNavigateToQuestionnaire}
            onNavigateToResults={handleNavigateToResults}
            onNavigateToResources={() => setCurrentScreen('resources')}
            onNavigateToProfile={handleNavigateToProfile}
            userEmail={user?.email}
            isAuthenticated={isAuthenticated}
            resultsCount={resultsHistory.length}
          />
        ) : currentScreen === 'profile' ? (
          <ProfileScreen
            email={user?.email}
            resultsCount={resultsHistory.length}
            onSignOut={signOut}
            onNavigateToResults={handleNavigateToResults}
            onNavigateToQuestionnaire={handleNavigateToQuestionnaire}
            isAuthenticated={isAuthenticated}
          />
        ) : currentScreen === 'resources' ? (
          <ResourcesScreen onBack={handleNavigateToHome} />
        ) : currentScreen === 'questionnaire' ? (
          <QuestionnaireScreen onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        ) : currentScreen === 'detailedResult' && selectedResult ? (
          <DetailedResultScreen
            result={selectedResult}
            onBack={() => setCurrentScreen('results')}
          />
        ) : (
          <ResultsScreen
            resultsHistory={resultsHistory}
            onBack={handleNavigateToHome}
            onDelete={handleDelete}
            onResultPress={(result) => {
              setSelectedResult(result);
              setCurrentScreen('detailedResult');
            }}
          />
        )}
      </View>

      {!onHomeScreen && (
        <View style={styles.navFooter}>
          <View style={styles.navContainer}>
            <TouchableOpacity
              style={[styles.navButton, onHomeScreen && styles.navButtonActive]}
              onPress={handleNavigateToHome}
              activeOpacity={0.7}
            >
              <Ionicons
                name="home"
                size={22}
                color={onHomeScreen ? '#6c5ce7' : '#636e72'}
              />
              <Text
                style={[
                  styles.navButtonText,
                  onHomeScreen && styles.navButtonTextActive,
                ]}
              >
                Home
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentScreen === 'questionnaire' && styles.navButtonActive,
              ]}
              onPress={handleNavigateToQuestionnaire}
              activeOpacity={0.7}
            >
              <Ionicons
                name="clipboard-outline"
                size={22}
                color={currentScreen === 'questionnaire' ? '#6c5ce7' : '#636e72'}
              />
              <Text
                style={[
                  styles.navButtonText,
                  currentScreen === 'questionnaire' && styles.navButtonTextActive,
                ]}
              >
                Questionnaire
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, isResultsScreen && styles.navButtonActive]}
              onPress={handleNavigateToResults}
              activeOpacity={0.7}
            >
              <View style={styles.navButtonContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="stats-chart"
                    size={22}
                    color={isResultsScreen ? '#6c5ce7' : '#636e72'}
                  />
                  {resultsHistory.length > 0 && (
                    <View style={[styles.badge, isResultsScreen && styles.badgeActive]}>
                      <Text
                        style={[
                          styles.badgeText,
                          isResultsScreen && styles.badgeTextActive,
                        ]}
                      >
                        {resultsHistory.length}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.navButtonText,
                    isResultsScreen && styles.navButtonTextActive,
                  ]}
                >
                  Results
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'profile' && styles.navButtonActive]}
              onPress={handleNavigateToProfile}
              activeOpacity={0.7}
            >
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={currentScreen === 'profile' ? '#6c5ce7' : '#636e72'}
              />
              <Text
                style={[
                  styles.navButtonText,
                  currentScreen === 'profile' && styles.navButtonTextActive,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  syncBanner: {
    backgroundColor: '#fff9db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe8a1',
  },
  syncBannerText: {
    color: '#a46a00',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  screenContainer: {
    flex: 1,
  },
  navFooter: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  navButtonActive: {
    backgroundColor: '#f8f4ff',
  },
  navButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  navButtonText: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
    marginTop: 4,
  },
  navButtonTextActive: {
    color: '#6c5ce7',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#fff',
  },
  badgeText: {
    fontSize: 10,
    color: '#636e72',
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#fff',
  },
});
