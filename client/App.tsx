import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import { AssessmentResult } from './src/models/result';
import { submitQuestionnaire, fetchAllResponses } from './src/utils/api';

type Screen = 'home' | 'questionnaire' | 'results';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [resultsHistory, setResultsHistory] = useState<AssessmentResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load results from backend on app start
  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now();
      const minLoadingTime = 1200; // 1.2 seconds minimum for smooth UX
      
      try {
        // Fetch existing results from MongoDB (single source of truth)
        const responses = await fetchAllResponses();
        setResultsHistory(responses);
      } catch (error) {
        console.error('Failed to load results from MongoDB:', error);
        // Continue with empty results if backend is not available
        // Data is only stored in MongoDB, so we show empty state
      } finally {
        // Ensure minimum loading time for smooth UX
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);
        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      }
    };

    loadData();
  }, []);

  // Handle submission from questionnaire
  // All data must be saved to MongoDB - no local fallback
  const handleSubmit = async (result: AssessmentResult) => {
    setIsSubmitting(true);
    try {
      // Submit to backend (MongoDB) - this is the only source of truth
      const savedResult = await submitQuestionnaire(result);
      
      // Only update local state after successful MongoDB save
      setResultsHistory((prev) => [savedResult, ...prev]);
      
      // Automatically navigate to results screen after successful submission
      setCurrentScreen('results');
    } catch (error: any) {
      console.error('Failed to submit questionnaire to MongoDB:', error);
      const errorMessage = error?.message || 'An unknown error occurred. Please try again.';
      Alert.alert(
        'Submission Failed',
        `${errorMessage}\n\nAll data is stored securely in MongoDB only. Your assessment will not be saved until the connection succeeds.`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel'
          },
          { 
            text: 'Retry', 
            onPress: () => handleSubmit(result),
            style: 'default'
          },
        ]
      );
      // Do NOT add to local state - data must be in MongoDB first
      // User stays on questionnaire screen to retry
      // Rethrow error so form doesn't reset
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to home screen
  const handleNavigateToHome = () => {
    setCurrentScreen('home');
  };

  // Navigate to questionnaire screen
  const handleNavigateToQuestionnaire = () => {
    setCurrentScreen('questionnaire');
  };

  // Navigate to results screen
  const handleNavigateToResults = () => {
    setCurrentScreen('results');
  };

  // Handle deletion of a response
  const handleDelete = async (id: string) => {
    try {
      // Refresh the list from MongoDB (which will exclude deleted items)
      // All data is stored in MongoDB only, so we refresh from there
      const responses = await fetchAllResponses();
      setResultsHistory(responses);
    } catch (error: any) {
      console.error('Failed to refresh results after deletion:', error);
      // On error, optimistically update local state (deletion likely succeeded)
      // But show a warning that sync may be needed
      setResultsHistory((prev) => prev.filter((r) => r.id !== id));
      // Note: In a production app, you might want to show a toast here
      // indicating that deletion may need to be retried
    }
  };

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Current Screen */}
      <View style={styles.screenContainer}>
        {currentScreen === 'home' ? (
          <HomeScreen
            onNavigateToQuestionnaire={handleNavigateToQuestionnaire}
            onNavigateToResults={handleNavigateToResults}
            resultsCount={resultsHistory.length}
          />
        ) : currentScreen === 'questionnaire' ? (
          <QuestionnaireScreen onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        ) : (
          <ResultsScreen
            resultsHistory={resultsHistory}
            onBack={handleNavigateToHome}
            onDelete={handleDelete}
          />
        )}
      </View>

      {/* Bottom Navigation - Only show when not on home screen */}
      {currentScreen !== 'home' && (
        <View style={styles.navFooter}>
          <View style={styles.navContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNavigateToHome}
              activeOpacity={0.7}
            >
              <Ionicons name="home" size={22} color="#636e72" />
              <Text style={styles.navButtonText}>Home</Text>
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
              style={[
                styles.navButton,
                currentScreen === 'results' && styles.navButtonActive,
              ]}
              onPress={handleNavigateToResults}
              activeOpacity={0.7}
            >
              <View style={styles.navButtonContent}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name="stats-chart" 
                    size={22} 
                    color={currentScreen === 'results' ? '#6c5ce7' : '#636e72'} 
                  />
                  {resultsHistory.length > 0 && (
                    <View style={[
                      styles.badge,
                      currentScreen === 'results' && styles.badgeActive
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        currentScreen === 'results' && styles.badgeTextActive
                      ]}>
                        {resultsHistory.length}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.navButtonText,
                    currentScreen === 'results' && styles.navButtonTextActive,
                  ]}
                >
                  Results
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
