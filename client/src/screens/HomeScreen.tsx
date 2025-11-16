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
  onNavigateToResources?: () => void;
  resultsCount?: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigateToQuestionnaire, 
  onNavigateToResults,
  onNavigateToResources,
  resultsCount = 0 
}) => {
  return (
    <View style={styles.container}>
      {/* Unique Home Header - Different from Questionnaire */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={styles.headerCircle3} />
        <View style={styles.headerContent}>
          <View style={styles.headerTopSection}>
            <View style={styles.headerLogoContainer}>
              <View style={styles.headerLogo}>
                <Ionicons name="heart" size={40} color="#fff" />
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Welcome</Text>
              <Text style={styles.headerSubtitle}>PPD Risk Assessment</Text>
            </View>
          </View>
          <Text style={styles.headerDescription}>
            Your trusted companion for mental wellness during pregnancy and postpartum
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Quick Stats Section (if results exist) */}
        {resultsCount > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Ionicons name="analytics" size={20} color="#667eea" />
              <Text style={styles.statsTitle}>Your Progress</Text>
            </View>
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{resultsCount}</Text>
                <Text style={styles.statLabel}>
                  {resultsCount === 1 ? 'Assessment' : 'Assessments'}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
                <Text style={styles.statLabel}>Tracked</Text>
              </View>
            </View>
          </View>
        )}

        {/* Enhanced Navigation Buttons */}
        <View style={styles.navigationSection}>
          {/* Primary Action - Start Assessment */}
          <TouchableOpacity
            style={styles.primaryNavButton}
            onPress={onNavigateToQuestionnaire}
            activeOpacity={0.85}
          >
            <View style={styles.primaryButtonContent}>
              <View style={styles.primaryButtonLeft}>
                <View style={styles.primaryIconContainer}>
                  <Ionicons name="clipboard" size={36} color="#fff" />
                </View>
                <View style={styles.primaryButtonTextContainer}>
                  <Text style={styles.primaryButtonTitle}>Start Assessment</Text>
                  <Text style={styles.primaryButtonSubtitle}>
                    Complete questionnaire • 5-10 minutes
                  </Text>
                </View>
              </View>
              <View style={styles.primaryButtonArrow}>
                <Ionicons name="arrow-forward-circle" size={32} color="#fff" />
              </View>
            </View>
            <View style={styles.primaryButtonAccent} />
          </TouchableOpacity>

          {/* Secondary Action - View Results */}
          <TouchableOpacity
            style={[
              styles.secondaryNavButton,
              resultsCount === 0 && styles.secondaryNavButtonDisabled
            ]}
            onPress={onNavigateToResults}
            activeOpacity={0.85}
            disabled={resultsCount === 0}
          >
            <View style={styles.secondaryButtonContent}>
              <View style={styles.secondaryButtonLeft}>
                <View style={styles.secondaryIconContainer}>
                  <Ionicons name="stats-chart" size={32} color="#667eea" />
                  {resultsCount > 0 && (
                    <View style={styles.resultsBadge}>
                      <Text style={styles.resultsBadgeText}>{resultsCount}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.secondaryButtonTextContainer}>
                  <Text style={styles.secondaryButtonTitle}>View Results</Text>
                  <Text style={styles.secondaryButtonSubtitle}>
                    {resultsCount > 0 
                      ? `${resultsCount} ${resultsCount === 1 ? 'assessment' : 'assessments'} available`
                      : 'Complete an assessment first'
                    }
                  </Text>
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={resultsCount > 0 ? "#667eea" : "#bdc3c7"} 
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Enhanced Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.infoIconContainer, styles.infoIconContainer1]}>
                <Ionicons name="shield-checkmark" size={26} color="#667eea" />
              </View>
            </View>
            <Text style={styles.infoTitle}>100% Confidential</Text>
            <Text style={styles.infoText}>
              Your responses are encrypted and kept completely private
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.infoIconContainer, styles.infoIconContainer2]}>
                <Ionicons name="time" size={26} color="#667eea" />
              </View>
            </View>
            <Text style={styles.infoTitle}>Quick & Easy</Text>
            <Text style={styles.infoText}>
              Takes only 5-10 minutes to complete the assessment
            </Text>
          </View>
        </View>

        {/* Resources Button */}
        {onNavigateToResources && (
          <TouchableOpacity
            style={styles.resourcesButton}
            onPress={onNavigateToResources}
            activeOpacity={0.85}
          >
            <View style={styles.resourcesButtonContent}>
              <View style={styles.resourcesIconContainer}>
                <Ionicons name="help-circle" size={28} color="#6c5ce7" />
              </View>
              <View style={styles.resourcesButtonTextContainer}>
                <Text style={styles.resourcesButtonTitle}>Resources & Support</Text>
                <Text style={styles.resourcesButtonSubtitle}>
                  Mental health hotlines, self-care tips, and guidance
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6c5ce7" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'transparent',
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerCircle2: {
    position: 'absolute',
    top: 100,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCircle3: {
    position: 'absolute',
    bottom: -40,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    zIndex: 1,
    position: 'relative',
  },
  headerTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLogoContainer: {
    marginRight: 16,
  },
  headerLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  headerDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    paddingTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 100,
  },
  quickActionText: {
    fontSize: 13,
    color: '#2d3436',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e9ecef',
  },
  navigationSection: {
    marginBottom: 24,
    gap: 16,
  },
  primaryNavButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  primaryButtonContent: {
    backgroundColor: '#667eea',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
    minWidth: 0,
  },
  primaryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  primaryButtonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  primaryButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  primaryButtonArrow: {
    marginLeft: 8,
    flexShrink: 0,
  },
  primaryButtonAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryNavButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  secondaryNavButtonDisabled: {
    borderColor: '#e0e0e0',
    opacity: 0.7,
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
    minWidth: 0,
  },
  secondaryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  resultsBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  resultsBadgeText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButtonTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  secondaryButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  secondaryButtonSubtitle: {
    fontSize: 14,
    color: '#636e72',
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
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  infoCardHeader: {
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconContainer1: {
    backgroundColor: '#f0f2ff',
  },
  infoIconContainer2: {
    backgroundColor: '#fff5f0',
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
    textAlign: 'left',
  },
  infoText: {
    fontSize: 13,
    color: '#636e72',
    textAlign: 'left',
    lineHeight: 20,
  },
  featuresSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  featureText: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
    flex: 1,
  },
  footerSpacer: {
    height: 20,
  },
  resourcesButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#6c5ce7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  resourcesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resourcesIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourcesButtonTextContainer: {
    flex: 1,
  },
  resourcesButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  resourcesButtonSubtitle: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
});

export default HomeScreen;