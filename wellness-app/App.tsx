import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import { AssessmentResult } from './src/models/result';
import { submitQuestionnaire, fetchAllResponses } from './src/utils/api';

type Screen = 'questionnaire' | 'results';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('questionnaire');
  const [resultsHistory, setResultsHistory] = useState<AssessmentResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load results from backend on app start
  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now();
      const minLoadingTime = 1000; // Reduced to 1 second minimum
      
      try {
        // Fetch existing results from backend with timeout
        const responses = await fetchAllResponses();
        setResultsHistory(responses);
      } catch (error) {
        console.error('Failed to load results from backend:', error);
        // Continue with empty results if backend is not available
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
  const handleSubmit = async (result: AssessmentResult) => {
    setIsSubmitting(true);
    try {
      // Submit to backend
      const savedResult = await submitQuestionnaire(result);
      
      // Update local state with the saved result from backend
      setResultsHistory((prev) => [savedResult, ...prev]);
      
      // Automatically navigate to results screen after submission
      setCurrentScreen('results');
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
      Alert.alert(
        'Submission Error',
        'Failed to submit questionnaire. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      // Still add to local state as fallback
      setResultsHistory((prev) => [result, ...prev]);
      setCurrentScreen('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to results screen
  const handleViewResults = () => {
    setCurrentScreen('results');
  };

  // Navigate back to questionnaire
  const handleBackToQuestionnaire = () => {
    setCurrentScreen('questionnaire');
  };

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Current Screen */}
      <View style={styles.screenContainer}>
        {currentScreen === 'questionnaire' ? (
          <QuestionnaireScreen onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        ) : (
          <ResultsScreen
            resultsHistory={resultsHistory}
            onBack={handleBackToQuestionnaire}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.navFooter} edges={['bottom']}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === 'questionnaire' && styles.navButtonActive,
            ]}
            onPress={handleBackToQuestionnaire}
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
            onPress={handleViewResults}
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
      </SafeAreaView>
    </SafeAreaView>
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
