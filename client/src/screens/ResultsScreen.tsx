import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssessmentResult } from '../models/result';
import { deleteResponse } from '../utils/api';

interface ResultsScreenProps {
  resultsHistory: AssessmentResult[];
  onBack?: () => void;
  onDelete?: (id: string) => Promise<void>; // Callback to refresh list after deletion
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ resultsHistory, onBack, onDelete }: ResultsScreenProps) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Handle delete action
  const handleDelete = async (item: AssessmentResult) => {
    Alert.alert(
      'Delete Assessment',
      'Are you sure you want to delete this assessment? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(item.id);
              await deleteResponse(item.id);
              // Call onDelete callback to refresh the list
              if (onDelete) {
                await onDelete(item.id);
              }
            } catch (error) {
              console.error('Error deleting response:', error);
              Alert.alert(
                'Delete Failed',
                'Failed to delete the assessment. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };
  // Format date for display
  const formatDate = (date: Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate statistics
  const calculateStats = () => {
    const total = resultsHistory.length;
    const riskCount = resultsHistory.filter((r: AssessmentResult) => r.riskResult === 'Possible PPD Risk').length;
    const lowRiskCount = total - riskCount;
    return { total, riskCount, lowRiskCount };
  };

  const stats = calculateStats();

  // Calculate risk score from backend data
  const calculateRiskScore = (item: AssessmentResult) => {
    // Map questions to backend fields (same logic as scoring)
    const appetite = item.questionnaireResponses['q4'] === true;
    const mood = !!(
      item.questionnaireResponses['q1'] ||
      item.questionnaireResponses['q2'] ||
      item.questionnaireResponses['q3'] ||
      item.questionnaireResponses['q5'] ||
      item.questionnaireResponses['q6'] ||
      item.questionnaireResponses['q7']
    );
    const lackOfSupport = item.questionnaireResponses.hasOwnProperty('q9') && item.questionnaireResponses['q9'] === false;
    const history = item.questionnaireResponses['q8'] === true;
    
    return [appetite, mood, lackOfSupport, history].filter(Boolean).length;
  };

  // Render individual result item
  const renderResultItem = ({ item, index }: { item: AssessmentResult; index: number }) => {
    const isRisk = item.riskResult === 'Possible PPD Risk';
    const riskScore = calculateRiskScore(item);
    const maxScore = 4;
    
    // Color scheme based on risk
    const riskColors = isRisk 
      ? {
          primary: '#ff6b6b',
          light: '#fff5f5',
          gradient: ['#ff6b6b', '#ee5a6f'],
          iconBg: '#fff5f5',
        }
      : {
          primary: '#51cf66',
          light: '#f0fdf4',
          gradient: ['#51cf66', '#69db7c'],
          iconBg: '#f0fdf4',
        };

    const percentage = (riskScore / maxScore) * 100;
    const riskStatus = isRisk ? 'Risk Detected' : 'Low Risk';
    
    return (
      <View style={styles.cardContainer}>
        <View style={[styles.resultCard]}>
          {/* Card Top Gradient Section */}
          <View style={[styles.cardTopGradient, { 
            backgroundColor: isRisk ? 'rgba(255, 107, 107, 0.08)' : 'rgba(81, 207, 102, 0.08)',
          }]}>
            <View style={styles.cardTopContent}>
              {/* Left Side - Number & Date */}
              <View style={styles.cardTopLeft}>
                <View style={[styles.cardNumberBadge, { 
                  backgroundColor: riskColors.primary,
                  shadowColor: riskColors.primary,
                }]}>
                  <Text style={styles.cardNumber}>#{resultsHistory.length - index}</Text>
                </View>
                <View style={styles.cardDateContainer}>
                  <View style={styles.cardDateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#636e72" />
                    <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
                  </View>
                  <View style={styles.cardDateRow}>
                    <Ionicons name="time-outline" size={14} color="#636e72" />
                    <Text style={styles.cardTime}>{formatTime(item.timestamp)}</Text>
                  </View>
                </View>
              </View>
              
              {/* Right Side - Risk Badge */}
              <View style={[styles.riskBadgeContainer, {
                backgroundColor: riskColors.primary,
              }]}>
                <Ionicons 
                  name={isRisk ? "warning" : "checkmark-circle"} 
                  size={24} 
                  color="#fff"
                />
                <View style={styles.riskBadgeTextContainer}>
                  <Text style={styles.riskStatus}>{riskStatus}</Text>
                  <Text style={styles.riskSubText}>{item.riskResult}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Main Card Content */}
          <View style={styles.cardMainContent}>
            {/* Risk Score Section - Center Focus */}
            <View style={styles.riskScoreMainSection}>
              <View style={[styles.circularScoreContainer, {
                borderColor: riskColors.primary,
              }]}>
                <View style={[styles.circularScoreInner, {
                  backgroundColor: riskColors.iconBg,
                }]}>
                  <Text style={[styles.circularScoreValue, { color: riskColors.primary }]}>
                    {riskScore}
                  </Text>
                  <Text style={styles.circularScoreLabel}>Risk Score</Text>
                  <View style={[styles.circularScoreMax, { color: riskColors.primary }]}>
                    <Text style={styles.circularScoreMaxText}>of {maxScore}</Text>
                  </View>
                </View>
                {/* Circular Progress Indicator */}
                <View style={[styles.circularProgress, {
                  borderColor: riskColors.primary,
                }]}>
                  <View style={[styles.circularProgressFill, {
                    borderColor: riskColors.primary,
                    borderTopColor: riskColors.primary,
                    borderRightColor: riskColors.primary,
                    borderBottomColor: percentage >= 75 ? riskColors.primary : 'transparent',
                    borderLeftColor: percentage >= 50 ? riskColors.primary : 'transparent',
                  }]} />
                </View>
              </View>
              
              {/* Progress Bar Below */}
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: riskColors.light }]}>
                  <View 
                    style={[styles.progressBarFill, { 
                      width: `${percentage}%`,
                      backgroundColor: riskColors.primary,
                    }]} 
                  >
                    <View style={styles.progressBarGlow} />
                  </View>
                </View>
                <Text style={[styles.progressPercentage, { color: riskColors.primary }]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
            </View>

            {/* Details Grid - Two Rows */}
            <View style={styles.detailsGridModern}>
              <View style={[styles.detailCard, { 
                backgroundColor: isRisk ? 'rgba(255, 107, 107, 0.06)' : 'rgba(81, 207, 102, 0.06)',
                borderColor: isRisk ? 'rgba(255, 107, 107, 0.2)' : 'rgba(81, 207, 102, 0.2)',
              }]}>
                <View style={[styles.detailIconModern, { backgroundColor: riskColors.primary }]}>
                  <Ionicons name="flag" size={22} color="#fff" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabelModern}>Stage</Text>
                  <Text style={[styles.detailValueModern, { color: riskColors.primary }]}>
                    {item.stage}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.detailCard, { 
                backgroundColor: isRisk ? 'rgba(255, 107, 107, 0.06)' : 'rgba(81, 207, 102, 0.06)',
                borderColor: isRisk ? 'rgba(255, 107, 107, 0.2)' : 'rgba(81, 207, 102, 0.2)',
              }]}>
                <View style={[styles.detailIconModern, { backgroundColor: riskColors.primary }]}>
                  <Ionicons name="location" size={22} color="#fff" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabelModern}>Region</Text>
                  <Text style={[styles.detailValueModern, { color: riskColors.primary }]}>
                    {item.region}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.detailCard, { 
                backgroundColor: isRisk ? 'rgba(255, 107, 107, 0.06)' : 'rgba(81, 207, 102, 0.06)',
                borderColor: isRisk ? 'rgba(255, 107, 107, 0.2)' : 'rgba(81, 207, 102, 0.2)',
              }]}>
                <View style={[styles.detailIconModern, { backgroundColor: riskColors.primary }]}>
                  <Ionicons name="moon" size={22} color="#fff" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabelModern}>Sleep Hours</Text>
                  <Text style={[styles.detailValueModern, { color: riskColors.primary }]}>
                    {item.sleepHours}h
                  </Text>
                </View>
              </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={[styles.deleteButtonModern, deletingId === item.id && styles.deleteButtonDisabled]}
              onPress={() => handleDelete(item)}
              disabled={deletingId === item.id}
              activeOpacity={0.7}
            >
              <View style={styles.deleteButtonContentModern}>
                <View style={styles.deleteIconContainer}>
                  <Ionicons 
                    name={deletingId === item.id ? "hourglass" : "trash"} 
                    size={20} 
                    color="#fff" 
                  />
                </View>
                <Text style={styles.deleteButtonTextModern}>
                  {deletingId === item.id ? 'Deleting...' : 'Delete Assessment'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Modern Statistics Header
  const renderStatsHeader = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statsCard, styles.statsCardPrimary]}>
        <View style={styles.statsCardHeader}>
          <View style={[styles.statsIconContainer, styles.statsIconContainerPrimary]}>
            <Ionicons name="document-text" size={26} color="#667eea" />
          </View>
          <View style={styles.statsGradient} />
        </View>
        <Text style={styles.statsValue}>{stats.total}</Text>
        <Text style={styles.statsLabel}>Total Assessments</Text>
        <View style={styles.statsTrend}>
          <Ionicons name="trending-up" size={16} color="#667eea" />
          <Text style={styles.statsTrendText}>Tracked</Text>
        </View>
      </View>
      
      <View style={[styles.statsCard, styles.statsCardRisk]}>
        <View style={styles.statsCardHeader}>
          <View style={[styles.statsIconContainer, styles.statsIconContainerRisk]}>
            <Ionicons name="alert-circle" size={26} color="#ff6b6b" />
          </View>
          <View style={styles.statsGradientRisk} />
        </View>
        <Text style={[styles.statsValue, styles.statsValueRisk]}>{stats.riskCount}</Text>
        <Text style={styles.statsLabel}>Possible Risk</Text>
        <View style={styles.statsIndicator}>
          <View style={styles.statsDot} />
          <Text style={styles.statsIndicatorText}>Monitor</Text>
        </View>
      </View>
      
      <View style={[styles.statsCard, styles.statsCardSafe]}>
        <View style={styles.statsCardHeader}>
          <View style={[styles.statsIconContainer, styles.statsIconContainerSafe]}>
            <Ionicons name="checkmark-circle" size={26} color="#51cf66" />
          </View>
          <View style={styles.statsGradientSafe} />
        </View>
        <Text style={[styles.statsValue, styles.statsValueSafe]}>{stats.lowRiskCount}</Text>
        <Text style={styles.statsLabel}>Low Risk</Text>
        <View style={styles.statsIndicator}>
          <View style={[styles.statsDot, styles.statsDotSafe]} />
          <Text style={styles.statsIndicatorText}>Healthy</Text>
        </View>
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.emptyIconCircle}>
          <View style={styles.emptyIconInner}>
            <Ionicons name="clipboard-outline" size={64} color="#667eea" />
          </View>
        </View>
      </View>
      <Text style={styles.emptyTitle}>No Assessments Yet</Text>
      <Text style={styles.emptySubtext}>
        Complete your first questionnaire to start tracking your PPD risk assessment results and gain valuable insights
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Modern Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={styles.headerCircle3} />
        <View style={styles.headerContent}>
          <View style={styles.headerTopSection}>
            <View style={styles.headerLogoContainer}>
              <View style={styles.headerLogo}>
                <Ionicons name="analytics" size={32} color="#fff" />
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Assessment History</Text>
              <Text style={styles.headerSubtitle}>
                {stats.total} {stats.total === 1 ? 'assessment' : 'assessments'} recorded
              </Text>
            </View>
          </View>
          <Text style={styles.headerDescription}>
            Track your mental wellness journey with detailed insights
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={resultsHistory.length === 0 ? styles.emptyScrollContainer : styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {resultsHistory.length > 0 && renderStatsHeader()}
        
        {resultsHistory.length > 0 ? (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIconWrapper}>
                  <Ionicons name="list" size={22} color="#667eea" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Recent Assessments</Text>
                  <Text style={styles.sectionSubtitle}>Your assessment history</Text>
                </View>
              </View>
            </View>
            <FlatList
              data={resultsHistory}
              renderItem={renderResultItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        ) : (
          renderEmptyState()
        )}
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
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  emptyScrollContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
    overflow: 'hidden',
  },
  statsCardPrimary: {
    borderTopWidth: 3,
    borderTopColor: '#667eea',
  },
  statsCardRisk: {
    borderTopWidth: 3,
    borderTopColor: '#ff6b6b',
  },
  statsCardSafe: {
    borderTopWidth: 3,
    borderTopColor: '#51cf66',
  },
  statsCardHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  statsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  statsIconContainerPrimary: {
    backgroundColor: '#f0f4ff',
  },
  statsIconContainerRisk: {
    backgroundColor: '#fff5f5',
  },
  statsIconContainerSafe: {
    backgroundColor: '#f0fdf4',
  },
  statsGradient: {
    position: 'absolute',
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  statsGradientRisk: {
    position: 'absolute',
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  statsGradientSafe: {
    position: 'absolute',
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 6,
  },
  statsValueRisk: {
    color: '#ff6b6b',
  },
  statsValueSafe: {
    color: '#51cf66',
  },
  statsLabel: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statsTrendText: {
    fontSize: 11,
    color: '#667eea',
    fontWeight: '600',
  },
  statsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
  },
  statsDotSafe: {
    backgroundColor: '#51cf66',
  },
  statsIndicatorText: {
    fontSize: 11,
    color: '#636e72',
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },
  separator: {
    height: 16,
  },
  cardContainer: {
    marginBottom: 4,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  riskText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scoreSection: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  scoreIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreHeaderText: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  scoreSubLabel: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 60,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 18,
    color: '#636e72',
    fontWeight: '600',
    marginLeft: 4,
  },
  scoreBarContainer: {
    flex: 1,
  },
  scoreBarBackground: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 7,
    position: 'relative',
  },
  scoreBarShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 7,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: '#636e72',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  deleteButton: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    overflow: 'hidden',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  deleteButtonText: {
    fontSize: 15,
    color: '#ff6b6b',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 32,
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#f0f4ff',
  },
  emptyIconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
});

export default ResultsScreen;
