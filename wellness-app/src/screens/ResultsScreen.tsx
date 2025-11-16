import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssessmentResult } from '../models/result';

interface ResultsScreenProps {
  resultsHistory: AssessmentResult[];
  onBack?: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ resultsHistory, onBack }) => {
  // Format date for display
  const formatDate = (date: Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render individual result item
  const renderResultItem = ({ item }: { item: AssessmentResult }) => {
    const isRisk = item.riskResult === 'Possible PPD Risk';
    const riskColor = isRisk ? '#e74c3c' : '#27ae60';
    const riskBackground = isRisk ? '#fee' : '#e8f8f0';
    const positiveCount = Object.values(item.questionnaireResponses).filter(Boolean).length;
    const totalCount = Object.keys(item.questionnaireResponses).length;

    return (
      <View style={[styles.resultCard, { borderLeftColor: riskColor }]}>
        <View style={styles.resultHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#636e72" style={styles.dateIcon} />
            <Text style={styles.resultDate}>{formatDate(item.timestamp)}</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: riskBackground }]}>
            <Ionicons 
              name={isRisk ? "warning" : "checkmark-circle"} 
              size={16} 
              color={riskColor} 
              style={styles.riskIcon} 
            />
            <Text style={[styles.riskText, { color: riskColor }]}>
              {item.riskResult}
            </Text>
          </View>
        </View>
        
        <View style={styles.resultDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="flag-outline" size={18} color="#636e72" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Stage</Text>
              <Text style={styles.detailValue}>{item.stage}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="globe-outline" size={18} color="#636e72" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Region</Text>
              <Text style={styles.detailValue}>{item.region}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="moon-outline" size={18} color="#636e72" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Sleep Hours</Text>
              <Text style={styles.detailValue}>{item.sleepHours} hrs/day</Text>
            </View>
          </View>
        </View>

        {/* Show count of positive responses */}
        <View style={styles.responseSummary}>
          <View style={styles.summaryHeader}>
            <Ionicons name="bar-chart-outline" size={16} color="#636e72" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Questionnaire Responses</Text>
          </View>
          <View style={styles.summaryBar}>
            <View 
              style={[
                styles.summaryBarFill, 
                { 
                  width: `${(positiveCount / totalCount) * 100}%`,
                  backgroundColor: riskColor,
                }
              ]} 
            />
          </View>
          <Text style={styles.summaryText}>
            {positiveCount} of {totalCount} positive responses
          </Text>
        </View>
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="clipboard-outline" size={50} color="#636e72" />
      </View>
      <Text style={styles.emptyText}>No assessment results yet</Text>
      <Text style={styles.emptySubtext}>Complete a questionnaire to see your assessment results here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="stats-chart" size={24} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Assessment Results</Text>
            <Text style={styles.headerSubtitle}>
              {resultsHistory.length} {resultsHistory.length === 1 ? 'result' : 'results'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={resultsHistory}
        renderItem={renderResultItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          resultsHistory.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
  },
  separator: {
    height: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderLeftWidth: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIcon: {
    marginRight: 6,
  },
  resultDate: {
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
    marginLeft: 10,
  },
  riskIcon: {
    marginRight: 6,
  },
  riskText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resultDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    paddingTop: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '600',
  },
  responseSummary: {
    marginTop: 12,
    paddingTop: 16,
    padding: 14,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});

export default ResultsScreen;

