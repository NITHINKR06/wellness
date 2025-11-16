import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AssessmentResult } from '../models/result';

interface DetailedResultScreenProps {
  result: AssessmentResult;
  onBack: () => void;
}

const DetailedResultScreen: React.FC<DetailedResultScreenProps> = ({ result, onBack }) => {
  // Calculate the 4 factors and score
  const calculateFactors = () => {
    const appetite = result.questionnaireResponses['q4'] === true;
    const mood = !!(
      result.questionnaireResponses['q1'] ||
      result.questionnaireResponses['q2'] ||
      result.questionnaireResponses['q3'] ||
      result.questionnaireResponses['q5'] ||
      result.questionnaireResponses['q6'] ||
      result.questionnaireResponses['q7']
    );
    const lackOfSupport = result.questionnaireResponses.hasOwnProperty('q9') && result.questionnaireResponses['q9'] === false;
    const history = result.questionnaireResponses['q8'] === true;
    
    const factors = [];
    if (appetite) factors.push('Appetite');
    if (mood) factors.push('Mood');
    if (lackOfSupport) factors.push('Lack of Support');
    if (history) factors.push('History');
    
    const score = factors.length;
    return { factors, score };
  };

  const { factors, score } = calculateFactors();
  const isRisk = result.riskResult === 'Possible PPD Risk';

  // Question labels
  const questionLabels: { [key: string]: string } = {
    q1: 'I have been feeling sad, anxious, or empty',
    q2: 'I have lost interest in activities I used to enjoy',
    q3: 'I have been sleeping too much or too little',
    q4: 'I have had changes in my appetite',
    q5: 'I have been feeling irritable or angry',
    q6: 'I have had difficulty concentrating or making decisions',
    q7: 'I have been feeling guilty or worthless',
    q8: 'I have had thoughts of harming myself or my baby',
    q9: 'Do you feel you have adequate support from your family/partner?',
  };

  const formatDate = (date: Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const riskColors = isRisk 
    ? {
        primary: '#e74c3c',
        light: '#fee',
        iconBg: '#fee5e5',
      }
    : {
        primary: '#27ae60',
        light: '#e8f8f0',
        iconBg: '#e6f7f0',
      };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Assessment Details</Text>
          <Text style={styles.headerSubtitle}>{formatDate(result.timestamp)}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Summary Card */}
        <View style={[styles.summaryCard, { borderTopColor: riskColors.primary }]}>
          <View style={styles.summaryHeader}>
            <View style={[styles.riskBadge, { backgroundColor: riskColors.light }]}>
              <Ionicons 
                name={isRisk ? "alert-circle" : "checkmark-circle"} 
                size={24} 
                color={riskColors.primary}
              />
              <Text style={[styles.riskText, { color: riskColors.primary }]}>
                {result.riskResult}
              </Text>
            </View>
          </View>

          <View style={styles.scoreSection}>
            <Text style={styles.scoreTitle}>Risk Score: {score}/4</Text>
            <Text style={styles.scoreSubtitle}>
              Points came from: {factors.length > 0 ? factors.join(', ') : 'None'}
            </Text>
            <View style={styles.scoreBarContainer}>
              <View style={[styles.scoreBarBackground, { backgroundColor: riskColors.light }]}>
                <View 
                  style={[
                    styles.scoreBarFill, 
                    { 
                      width: `${(score / 4) * 100}%`,
                      backgroundColor: riskColors.primary,
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="flag" size={18} color="#636e72" />
              <Text style={styles.infoLabel}>Stage</Text>
              <Text style={styles.infoValue}>{result.stage}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={18} color="#636e72" />
              <Text style={styles.infoLabel}>Region</Text>
              <Text style={styles.infoValue}>{result.region}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="moon" size={18} color="#636e72" />
              <Text style={styles.infoLabel}>Sleep Hours</Text>
              <Text style={styles.infoValue}>{result.sleepHours}h</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={18} color="#636e72" />
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{formatTime(result.timestamp)}</Text>
            </View>
          </View>
        </View>

        {/* Questionnaire Responses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={22} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>Questionnaire Responses</Text>
          </View>
          {Object.entries(result.questionnaireResponses).map(([questionId, answer]) => (
            <View key={questionId} style={styles.questionItem}>
              <View style={styles.questionHeader}>
                <Ionicons 
                  name={answer ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={answer ? "#27ae60" : "#e74c3c"} 
                />
                <Text style={styles.questionText}>{questionLabels[questionId] || questionId}</Text>
              </View>
              <View style={[styles.answerBadge, answer ? styles.answerBadgeYes : styles.answerBadgeNo]}>
                <Text style={styles.answerText}>{answer ? 'Yes' : 'No'}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Factor Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={22} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>Risk Factor Breakdown</Text>
          </View>
          <View style={styles.factorList}>
            <View style={styles.factorItem}>
              <Ionicons 
                name={factors.includes('Appetite') ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={factors.includes('Appetite') ? riskColors.primary : "#ccc"} 
              />
              <Text style={[
                styles.factorText,
                factors.includes('Appetite') && styles.factorTextActive
              ]}>
                Appetite Changes
              </Text>
            </View>
            <View style={styles.factorItem}>
              <Ionicons 
                name={factors.includes('Mood') ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={factors.includes('Mood') ? riskColors.primary : "#ccc"} 
              />
              <Text style={[
                styles.factorText,
                factors.includes('Mood') && styles.factorTextActive
              ]}>
                Mood Symptoms
              </Text>
            </View>
            <View style={styles.factorItem}>
              <Ionicons 
                name={factors.includes('Lack of Support') ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={factors.includes('Lack of Support') ? riskColors.primary : "#ccc"} 
              />
              <Text style={[
                styles.factorText,
                factors.includes('Lack of Support') && styles.factorTextActive
              ]}>
                Lack of Support
              </Text>
            </View>
            <View style={styles.factorItem}>
              <Ionicons 
                name={factors.includes('History') ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={factors.includes('History') ? riskColors.primary : "#ccc"} 
              />
              <Text style={[
                styles.factorText,
                factors.includes('History') && styles.factorTextActive
              ]}>
                History of Harmful Thoughts
              </Text>
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  summaryHeader: {
    marginBottom: 20,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    alignSelf: 'flex-start',
  },
  riskText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scoreSection: {
    marginTop: 8,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 16,
    lineHeight: 20,
  },
  scoreBarContainer: {
    width: '100%',
  },
  scoreBarBackground: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '700',
  },
  questionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#2d3436',
    lineHeight: 20,
  },
  answerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  answerBadgeYes: {
    backgroundColor: '#e8f8f0',
  },
  answerBadgeNo: {
    backgroundColor: '#fee',
  },
  answerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d3436',
  },
  factorList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  factorText: {
    fontSize: 16,
    color: '#636e72',
    fontWeight: '500',
  },
  factorTextActive: {
    color: '#2d3436',
    fontWeight: '700',
  },
});

export default DetailedResultScreen;

