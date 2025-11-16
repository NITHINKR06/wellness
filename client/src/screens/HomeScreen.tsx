import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onNavigateToQuestionnaire: () => void;
  onNavigateToResults: () => void;
  resultsCount?: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigateToQuestionnaire, 
  onNavigateToResults,
  resultsCount = 0 
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="medical" size={32} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>PPD Risk Assessment</Text>
            <Text style={styles.headerSubtitle}>Your wellness companion</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="heart-circle" size={48} color="#6c5ce7" />
          </View>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeDescription}>
            Take a comprehensive assessment to evaluate your postpartum depression risk. 
            Your responses help us provide personalized insights and support.
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationSection}>
          {/* Questionnaire Button */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={onNavigateToQuestionnaire}
            activeOpacity={0.8}
          >
            <View style={styles.navButtonGradient}>
              <View style={styles.navButtonIconContainer}>
                <Ionicons name="clipboard" size={32} color="#fff" />
              </View>
              <View style={styles.navButtonContent}>
                <Text style={styles.navButtonTitle}>Start Assessment</Text>
                <Text style={styles.navButtonSubtitle}>
                  Complete the questionnaire to assess your risk
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Results Button */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={onNavigateToResults}
            activeOpacity={0.8}
          >
            <View style={[styles.navButtonGradient, styles.navButtonGradientSecondary]}>
              <View style={styles.navButtonIconContainer}>
                <Ionicons name="stats-chart" size={32} color="#fff" />
                {resultsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{resultsCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.navButtonContent}>
                <Text style={styles.navButtonTitle}>View Results</Text>
                <Text style={styles.navButtonSubtitle}>
                  {resultsCount > 0 
                    ? `View your ${resultsCount} ${resultsCount === 1 ? 'assessment' : 'assessments'}`
                    : 'No assessments yet. Complete an assessment first'
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#6c5ce7" />
            </View>
            <Text style={styles.infoTitle}>Confidential</Text>
            <Text style={styles.infoText}>
              Your responses are kept private and secure
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time" size={24} color="#6c5ce7" />
            </View>
            <Text style={styles.infoTitle}>Quick Assessment</Text>
            <Text style={styles.infoText}>
              Takes only a few minutes to complete
            </Text>
          </View>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#6c5ce7',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 24,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 15,
    color: '#636e72',
    lineHeight: 22,
    textAlign: 'center',
  },
  navigationSection: {
    marginBottom: 24,
    gap: 16,
  },
  navButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  navButtonGradient: {
    backgroundColor: '#6c5ce7',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navButtonGradientSecondary: {
    backgroundColor: '#a29bfe',
  },
  navButtonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  navButtonContent: {
    flex: 1,
  },
  navButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  navButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  infoSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerSpacer: {
    height: 20,
  },
});

export default HomeScreen;

