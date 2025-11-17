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
import { formatDate, formatTime } from '../utils/dateUtils';
import { QUESTION_LABELS, QUESTIONS } from '../utils/constants';

interface DetailedResultScreenProps {
  result: AssessmentResult;
  onBack: () => void;
}

const DetailedResultScreen: React.FC<DetailedResultScreenProps> = ({ result, onBack }) => {
  const score = result.score ?? 0;
  const maxScore = result.maxScore || QUESTIONS.length;
  const isRisk = result.riskResult === 'Possible PPD Risk';
  const scorePercentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const riskFactorLabels =
    result.riskFactors?.map((questionId) => QUESTION_LABELS[questionId] || questionId) || [];

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
        <View style={styles.summaryCard}>
          <View style={[styles.riskBadge, isRisk ? styles.riskBadgeHigh : styles.riskBadgeLow]}>
            <Ionicons 
              name={isRisk ? "alert-circle" : "checkmark-circle"} 
              size={20} 
              color={isRisk ? "#e74c3c" : "#27ae60"}
            />
            <Text style={[styles.riskText, isRisk ? styles.riskTextHigh : styles.riskTextLow]}>
              {result.riskResult}
            </Text>
          </View>

          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>Risk Score</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, isRisk ? styles.scoreValueRisk : styles.scoreValueLow]}>
                {score}/{maxScore}
              </Text>
              <View style={styles.scoreBarContainer}>
                <View 
                  style={[
                    styles.scoreBar, 
                    { 
                      width: `${scorePercentage}%`,
                      backgroundColor: isRisk ? '#e74c3c' : '#27ae60',
                    }
                  ]} 
                />
              </View>
            </View>
            {riskFactorLabels.length > 0 && (
              <Text style={styles.factorsText}>
                Risk factors: {riskFactorLabels.join(', ')}
              </Text>
            )}
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="flag-outline" size={18} color="#636e72" />
                <Text style={styles.infoLabel}>Stage</Text>
                <Text style={styles.infoValue}>{result.stage}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={18} color="#636e72" />
                <Text style={styles.infoLabel}>Region</Text>
                <Text style={styles.infoValue}>{result.region}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="moon-outline" size={18} color="#636e72" />
                <Text style={styles.infoLabel}>Sleep Hours</Text>
                <Text style={styles.infoValue}>{result.sleepHours}h</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={18} color="#636e72" />
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{formatTime(result.timestamp)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Questionnaire Responses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questionnaire Responses</Text>
          {QUESTIONS.map((question) => {
            const answer = result.questionnaireResponses[question.id];
            const hasAnswer = typeof answer === 'boolean';
            const isYes = answer === true;
            return (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionContent}>
                  <Ionicons 
                    name={
                      hasAnswer
                        ? isYes
                          ? 'checkmark-circle'
                          : 'close-circle'
                        : 'ellipse-outline'
                    } 
                    size={20} 
                    color={
                      hasAnswer
                        ? isYes
                          ? '#27ae60'
                          : '#e74c3c'
                        : '#bdc3c7'
                    } 
                  />
                  <Text style={styles.questionText}>{QUESTION_LABELS[question.id] || question.text}</Text>
                </View>
                <View style={[
                  styles.answerBadge, 
                  !hasAnswer
                    ? styles.answerBadgeNeutral
                    : isYes
                      ? styles.answerBadgeYes
                      : styles.answerBadgeNo
                ]}>
                  <Text style={[
                    styles.answerText, 
                    !hasAnswer
                      ? styles.answerTextNeutral
                      : isYes
                        ? styles.answerTextYes
                        : styles.answerTextNo
                  ]}>
                    {!hasAnswer ? 'N/A' : isYes ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Risk Factor Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Factor Breakdown</Text>
          <View style={styles.factorCard}>
            {riskFactorLabels.length > 0 ? (
              riskFactorLabels.map((label, index) => (
                <View
                  key={label}
                  style={[
                    styles.factorItem,
                    index === riskFactorLabels.length - 1 && styles.factorItemLast,
                  ]}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color="#e74c3c" 
                  />
                  <Text style={[styles.factorText, styles.factorTextActive]}>
                    {label}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.factorItem, styles.factorItemLast]}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={20} 
                  color="#27ae60" 
                />
                <Text style={[styles.factorText, styles.factorTextLow]}>
                  No high-risk indicators were triggered in this assessment.
                </Text>
              </View>
            )}
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
  contentContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  riskBadgeHigh: {
    backgroundColor: '#fff5f5',
  },
  riskBadgeLow: {
    backgroundColor: '#f0f9f4',
  },
  riskText: {
    fontSize: 15,
    fontWeight: '700',
  },
  riskTextHigh: {
    color: '#e74c3c',
  },
  riskTextLow: {
    color: '#27ae60',
  },
  scoreSection: {
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 50,
  },
  scoreValueRisk: {
    color: '#e74c3c',
  },
  scoreValueLow: {
    color: '#27ae60',
  },
  scoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  factorsText: {
    fontSize: 13,
    color: '#636e72',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '700',
  },
  questionCard: {
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
  questionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: '#2d3436',
    lineHeight: 20,
  },
  answerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  answerBadgeYes: {
    backgroundColor: '#f0f9f4',
  },
  answerBadgeNo: {
    backgroundColor: '#fff5f5',
  },
  answerBadgeNeutral: {
    backgroundColor: '#f6f6f6',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  answerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  answerTextYes: {
    color: '#27ae60',
  },
  answerTextNo: {
    color: '#e74c3c',
  },
  answerTextNeutral: {
    color: '#636e72',
  },
  factorCard: {
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
    borderBottomColor: '#f0f0f0',
  },
  factorItemLast: {
    borderBottomWidth: 0,
  },
  factorText: {
    fontSize: 15,
    color: '#636e72',
    fontWeight: '500',
  },
  factorTextActive: {
    color: '#2d3436',
    fontWeight: '700',
  },
  factorTextLow: {
    color: '#27ae60',
    fontWeight: '700',
  },
  footerSpacer: {
    height: 20,
  },
});

export default DetailedResultScreen;
