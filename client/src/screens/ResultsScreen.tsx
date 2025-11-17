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
  onDelete?: (id: string) => Promise<void>;
  onResultPress?: (result: AssessmentResult) => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ resultsHistory, onBack, onDelete, onResultPress }: ResultsScreenProps) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (item: AssessmentResult) => {
    Alert.alert(
      'Delete Assessment',
      'Are you sure you want to delete this assessment?',
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

  const calculateStats = () => {
    const total = resultsHistory.length;
    const riskCount = resultsHistory.filter((r: AssessmentResult) => r.riskResult === 'Possible PPD Risk').length;
    const lowRiskCount = total - riskCount;
    return { total, riskCount, lowRiskCount };
  };

  const stats = calculateStats();

  const calculateRiskScore = (item: AssessmentResult) => {
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

  const renderResultItem = ({ item, index }: { item: AssessmentResult; index: number }) => {
    const isRisk = item.riskResult === 'Possible PPD Risk';
    const riskScore = calculateRiskScore(item);
    const maxScore = 4;
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onResultPress && onResultPress(item)}
        style={styles.resultCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.dateBadge, isRisk ? styles.dateBadgeRisk : styles.dateBadgeLow]}>
              <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
            </View>
            <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          </View>
          <View style={[styles.riskBadge, isRisk ? styles.riskBadgeHigh : styles.riskBadgeLow]}>
            <Ionicons 
              name={isRisk ? "alert-circle" : "checkmark-circle"} 
              size={16} 
              color={isRisk ? "#e74c3c" : "#27ae60"}
            />
            <Text style={[styles.riskText, isRisk ? styles.riskTextHigh : styles.riskTextLow]}>
              {item.riskResult}
            </Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>Risk Score</Text>
            <Text style={[styles.scoreValue, isRisk ? styles.scoreValueRisk : styles.scoreValueLow]}>
              {riskScore}/{maxScore}
            </Text>
          </View>
          <View style={styles.scoreBarContainer}>
            <View style={[styles.scoreBar, { width: `${(riskScore / maxScore) * 100}%`, backgroundColor: isRisk ? '#e74c3c' : '#27ae60' }]} />
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="flag-outline" size={16} color="#636e72" />
            <Text style={styles.detailText}>{item.stage}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color="#636e72" />
            <Text style={styles.detailText}>{item.region}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="moon-outline" size={16} color="#636e72" />
            <Text style={styles.detailText}>{item.sleepHours}h</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
          disabled={deletingId === item.id}
        >
          <Ionicons 
            name={deletingId === item.id ? "hourglass-outline" : "trash-outline"} 
            size={18} 
            color="#e74c3c" 
          />
          <Text style={styles.deleteButtonText}>
            {deletingId === item.id ? 'Deleting...' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const calculateAverageSleep = () => {
    if (resultsHistory.length === 0) return 0;
    const total = resultsHistory.reduce((sum, r) => sum + r.sleepHours, 0);
    return (total / resultsHistory.length).toFixed(1);
  };

  const averageSleep = calculateAverageSleep();

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="clipboard-outline" size={64} color="#bdc3c7" />
      </View>
      <Text style={styles.emptyTitle}>No Assessments Yet</Text>
      <Text style={styles.emptyText}>
        Complete your first questionnaire to see your results here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Results</Text>
          <Text style={styles.headerSubtitle}>
            {stats.total} {stats.total === 1 ? 'assessment' : 'assessments'}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={resultsHistory.length === 0 ? styles.emptyScrollContainer : styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {resultsHistory.length > 0 && (
          <>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={[styles.statCard, styles.statCardRisk]}>
                <Text style={[styles.statValue, styles.statValueRisk]}>{stats.riskCount}</Text>
                <Text style={styles.statLabel}>Possible Risk</Text>
              </View>
              <View style={[styles.statCard, styles.statCardLow]}>
                <Text style={[styles.statValue, styles.statValueLow]}>{stats.lowRiskCount}</Text>
                <Text style={styles.statLabel}>Low Risk</Text>
              </View>
            </View>

            {/* Sleep Average */}
            {resultsHistory.length > 0 && (
              <View style={styles.sleepCard}>
                <View style={styles.sleepHeader}>
                  <Ionicons name="moon" size={20} color="#6c5ce7" />
                  <Text style={styles.sleepTitle}>Average Sleep</Text>
                </View>
                <Text style={styles.sleepValue}>{averageSleep} hours</Text>
              </View>
            )}

            {/* Results List */}
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>Recent Assessments</Text>
              <FlatList
                data={resultsHistory}
                renderItem={renderResultItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </>
        )}

        {resultsHistory.length === 0 && renderEmptyState()}
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
    backgroundColor: '#6c5ce7',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyScrollContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statCardRisk: {
    borderColor: '#ffe5e5',
    backgroundColor: '#fff5f5',
  },
  statCardLow: {
    borderColor: '#e6f7f0',
    backgroundColor: '#f0f9f4',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  statValueRisk: {
    color: '#e74c3c',
  },
  statValueLow: {
    color: '#27ae60',
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
  },
  sleepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sleepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sleepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
  },
  sleepValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  resultsSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  dateBadgeRisk: {
    backgroundColor: '#fff5f5',
  },
  dateBadgeLow: {
    backgroundColor: '#f0f9f4',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
  timeText: {
    fontSize: 13,
    color: '#636e72',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  riskBadgeHigh: {
    backgroundColor: '#fff5f5',
  },
  riskBadgeLow: {
    backgroundColor: '#f0f9f4',
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
  riskTextHigh: {
    color: '#e74c3c',
  },
  riskTextLow: {
    color: '#27ae60',
  },
  scoreRow: {
    marginBottom: 16,
  },
  scoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreValueRisk: {
    color: '#e74c3c',
  },
  scoreValueLow: {
    color: '#27ae60',
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#2d3436',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ResultsScreen;
