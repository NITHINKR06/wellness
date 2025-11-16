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
          primary: '#e74c3c',
          light: '#fee',
          gradient: ['#ff6b6b', '#ee5a6f'],
          iconBg: '#fee5e5',
        }
      : {
          primary: '#27ae60',
          light: '#e8f8f0',
          gradient: ['#52c41a', '#73d13d'],
          iconBg: '#e6f7f0',
        };

    return (
      <View style={styles.cardContainer}>
        <View style={[styles.resultCard, { borderTopColor: riskColors.primary }]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardNumberBadge, { backgroundColor: riskColors.iconBg }]}>
                <Text style={[styles.cardNumber, { color: riskColors.primary }]}>
                  #{resultsHistory.length - index}
                </Text>
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
                <Text style={styles.cardTime}>{formatTime(item.timestamp)}</Text>
              </View>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: riskColors.light }]}>
              <Ionicons 
                name={isRisk ? "alert-circle" : "checkmark-circle"} 
                size={18} 
                color={riskColors.primary}
              />
              <Text style={[styles.riskText, { color: riskColors.primary }]}>
                {item.riskResult}
              </Text>
            </View>
          </View>

          {/* Risk Score Display */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreHeader}>
              <Ionicons name="pulse" size={20} color={riskColors.primary} />
              <Text style={styles.scoreLabel}>Risk Score</Text>
            </View>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreValueContainer}>
                <Text style={[styles.scoreValue, { color: riskColors.primary }]}>
                  {riskScore}
                </Text>
                <Text style={styles.scoreMax}>/ {maxScore}</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View style={[styles.scoreBarBackground, { backgroundColor: riskColors.light }]}>
                  <View 
                    style={[
                      styles.scoreBarFill, 
                      { 
                        width: `${(riskScore / maxScore) * 100}%`,
                        backgroundColor: riskColors.primary,
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: riskColors.iconBg }]}>
                <Ionicons name="flag" size={18} color={riskColors.primary} />
              </View>
              <Text style={styles.detailLabel}>Stage</Text>
              <Text style={styles.detailValue}>{item.stage}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: riskColors.iconBg }]}>
                <Ionicons name="location" size={18} color={riskColors.primary} />
              </View>
              <Text style={styles.detailLabel}>Region</Text>
              <Text style={styles.detailValue}>{item.region}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: riskColors.iconBg }]}>
                <Ionicons name="moon" size={18} color={riskColors.primary} />
              </View>
              <Text style={styles.detailLabel}>Sleep</Text>
              <Text style={styles.detailValue}>{item.sleepHours}h</Text>
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.deleteButton, deletingId === item.id && styles.deleteButtonDisabled]}
            onPress={() => handleDelete(item)}
            disabled={deletingId === item.id}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={deletingId === item.id ? "hourglass" : "trash-outline"} 
              size={18} 
              color="#e74c3c" 
            />
            <Text style={styles.deleteButtonText}>
              {deletingId === item.id ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Statistics Header
  const renderStatsHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsCard}>
        <View style={styles.statsIconContainer}>
          <Ionicons name="document-text" size={24} color="#6c5ce7" />
        </View>
        <Text style={styles.statsValue}>{stats.total}</Text>
        <Text style={styles.statsLabel}>Total Assessments</Text>
      </View>
      
      <View style={styles.statsCard}>
        <View style={[styles.statsIconContainer, { backgroundColor: '#fee' }]}>
          <Ionicons name="alert-circle" size={24} color="#e74c3c" />
        </View>
        <Text style={[styles.statsValue, { color: '#e74c3c' }]}>{stats.riskCount}</Text>
        <Text style={styles.statsLabel}>Possible Risk</Text>
      </View>
      
      <View style={styles.statsCard}>
        <View style={[styles.statsIconContainer, { backgroundColor: '#e8f8f0' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
        </View>
        <Text style={[styles.statsValue, { color: '#27ae60' }]}>{stats.lowRiskCount}</Text>
        <Text style={styles.statsLabel}>Low Risk</Text>
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="clipboard-outline" size={60} color="#6c5ce7" />
        </View>
      </View>
      <Text style={styles.emptyTitle}>No Assessments Yet</Text>
      <Text style={styles.emptySubtext}>
        Complete your first questionnaire to start tracking your PPD risk assessment results
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="analytics" size={28} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Assessment History</Text>
            <Text style={styles.headerSubtitle}>
              {stats.total} {stats.total === 1 ? 'assessment' : 'assessments'} recorded
            </Text>
          </View>
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
              <Ionicons name="list" size={20} color="#2d3436" />
              <Text style={styles.sectionTitle}>Recent Assessments</Text>
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
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#6c5ce7',
    paddingTop: 60,
    paddingBottom: 24,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginLeft: 8,
  },
  separator: {
    height: 16,
  },
  cardContainer: {
    marginBottom: 4,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardNumber: {
    fontSize: 16,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  riskText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scoreSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d3436',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: '#636e72',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '700',
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fee',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcc',
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 15,
    color: '#e74c3c',
    fontWeight: '600',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});

export default ResultsScreen;
