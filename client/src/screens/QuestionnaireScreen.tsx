import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stage, Region, RiskResult, QuestionnaireResponse, AssessmentResult } from '../models/result';

// Define available stages and regions
const STAGES: Stage[] = ['First Trimester', 'Second Trimester', 'Third Trimester', 'Postpartum'];
const REGIONS: Region[] = ['North', 'South', 'East', 'West', 'Central'];

// Define questionnaire questions (can be expanded)
const QUESTIONS = [
  { id: 'q1', text: 'I have been feeling sad, anxious, or empty', icon: 'sad-outline' },
  { id: 'q2', text: 'I have lost interest in activities I used to enjoy', icon: 'heart-outline' },
  { id: 'q3', text: 'I have been sleeping too much or too little', icon: 'moon-outline' },
  { id: 'q4', text: 'I have had changes in my appetite', icon: 'restaurant-outline' },
  { id: 'q5', text: 'I have been feeling irritable or angry', icon: 'flame-outline' },
  { id: 'q6', text: 'I have had difficulty concentrating or making decisions', icon: 'bulb-outline' },
  { id: 'q7', text: 'I have been feeling guilty or worthless', icon: 'warning-outline' },
  { id: 'q8', text: 'I have had thoughts of harming myself or my baby', icon: 'alert-circle-outline' },
  { id: 'q9', text: 'Do you feel you have adequate support from your family/partner?', icon: 'people-outline' },
];

interface QuestionnaireScreenProps {
  onSubmit: (result: AssessmentResult) => void | Promise<void>;
  isSubmitting?: boolean;
}

const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ onSubmit, isSubmitting = false }) => {
  // State for form inputs
  const [stage, setStage] = useState<Stage | ''>('');
  const [region, setRegion] = useState<Region | ''>('');
  const [sleepHours, setSleepHours] = useState<string>('');
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse>({});
  
  // State for dropdown modals
  const [showStageModal, setShowStageModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Calculate risk based on questionnaire responses
  // This matches the server-side logic: map 9 questions to 4 core fields and use ≥2 threshold
  const _calculateRisk = (responses: QuestionnaireResponse): RiskResult => {
    // Map questions to backend fields (same logic as in api.ts):
    // q4 -> appetite (changes in appetite)
    // q1, q2, q3, q5, q6, q7 -> mood (any mood-related question, including sleep issues)
    // q8 -> history (thoughts of harming)
    // q9 -> support (inverted: true = adequate support = NOT a risk factor, false = lack of support = IS a risk factor)
    
    const appetite = responses['q4'] === true; // Only true if explicitly answered
    const mood = !!(
      responses['q1'] || // Feeling sad, anxious, or empty
      responses['q2'] || // Lost interest
      responses['q3'] || // Sleeping too much or too little
      responses['q5'] || // Feeling irritable or angry
      responses['q6'] || // Difficulty concentrating
      responses['q7']    // Feeling guilty or worthless
    );
    // Support: only count lack of support if explicitly answered as false
    // If not answered, don't count it as a risk factor
    const lackOfSupport = responses.hasOwnProperty('q9') && responses['q9'] === false;
    const history = responses['q8'] === true; // Only true if explicitly answered
    
    // Count positive risk factors (same as server logic)
    const positiveCount = [appetite, mood, lackOfSupport, history].filter(Boolean).length;
    
    // Risk calculation: If 2 or more positive factors, it's "Possible PPD Risk"
    // This matches the server-side threshold
    if (positiveCount >= 2) {
      return 'Possible PPD Risk';
    }
    return 'Low Risk';
  };

  // Get current risk preview
  const currentRisk = _calculateRisk(questionnaireResponses);
  const riskScore = (() => {
    const appetite = questionnaireResponses['q4'] === true;
    const mood = !!(questionnaireResponses['q1'] || questionnaireResponses['q2'] || questionnaireResponses['q3'] || 
                    questionnaireResponses['q5'] || questionnaireResponses['q6'] || questionnaireResponses['q7']);
    const lackOfSupport = questionnaireResponses.hasOwnProperty('q9') && questionnaireResponses['q9'] === false;
    const history = questionnaireResponses['q8'] === true;
    return [appetite, mood, lackOfSupport, history].filter(Boolean).length;
  })();

  // Handle question answer change
  const handleQuestionChange = (questionId: string, value: boolean) => {
    setQuestionnaireResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handle sleep hours input with validation (0-24 only)
  const handleSleepHoursChange = (text: string) => {
    // Allow empty string (for deletion)
    if (text === '') {
      setSleepHours('');
      return;
    }

    // Remove any non-numeric characters except decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    if ((numericText.match(/\./g) || []).length > 1) {
      return;
    }

    // Parse the number
    const numValue = parseFloat(numericText);
  
    // Check if it's a valid number
    if (isNaN(numValue)) {
      // Allow partial input (e.g., just "2" while typing "24" or just ".")
      if (numericText === '' || numericText === '.') {
        setSleepHours(numericText);
        return;
      }
      return;
    }

    // Restrict to 0-24 range
    if (numValue < 0) {
      setSleepHours('0');
      return;
    }
  
    if (numValue > 24) {
      setSleepHours('24');
      return;
    }

    // Allow valid input
    setSleepHours(numericText);
  };

  // Handle form submission
  // Only reset form after successful MongoDB save
  const handleSubmit = async () => {
    // Validation
    if (!stage || !region || !sleepHours) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields (Stage, Region, and Sleep Hours)',
        [{ text: 'OK' }]
      );
      return;
    }

    const sleepHoursNum = parseFloat(sleepHours);
    if (isNaN(sleepHoursNum) || sleepHoursNum < 0 || sleepHoursNum > 24) {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid number of sleep hours (0-24)',
        [{ text: 'OK' }]
      );
      return;
    }

    // Calculate risk
    const riskResult = _calculateRisk(questionnaireResponses);

    // Create assessment result
    const assessmentResult: AssessmentResult = {
      id: Date.now().toString(),
      stage: stage as Stage,
      region: region as Region,
      sleepHours: sleepHoursNum,
      questionnaireResponses: { ...questionnaireResponses },
      riskResult,
      timestamp: new Date(),
    };

    try {
      // Submit the result to MongoDB - wait for success before resetting
      await onSubmit(assessmentResult);
      
      // Only reset form after successful save to MongoDB
      setStage('');
      setRegion('');
      setSleepHours('');
      setQuestionnaireResponses({});
    } catch (error) {
      // Form data is preserved on error so user can retry
      // Error handling is done in App.tsx
      console.error('Form submission error:', error);
    }
  };

  // Check if form is valid
  const isFormValid = stage && region && sleepHours;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="clipboard" size={28} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>PPD Risk Assessment</Text>
            <Text style={styles.headerSubtitle}>Complete the questionnaire below</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Preview Card */}
        {Object.keys(questionnaireResponses).length > 0 && (
          <View style={styles.riskPreviewCard}>
            <View style={styles.riskPreviewHeader}>
              <Ionicons name="pulse" size={20} color="#6c5ce7" />
              <Text style={styles.riskPreviewTitle}>Current Risk Assessment</Text>
            </View>
            <View style={styles.riskPreviewContent}>
              <View style={styles.riskScoreContainer}>
                <Text style={styles.riskScoreValue}>{riskScore}</Text>
                <Text style={styles.riskScoreMax}>/ 4</Text>
              </View>
              <View style={styles.riskBarContainer}>
                <View style={[styles.riskBar, { width: `${(riskScore / 4) * 100}%` }]} />
              </View>
              <View style={[styles.riskBadge, currentRisk === 'Possible PPD Risk' && styles.riskBadgeHigh]}>
                <Ionicons 
                  name={currentRisk === 'Possible PPD Risk' ? 'alert-circle' : 'checkmark-circle'} 
                  size={16} 
                  color={currentRisk === 'Possible PPD Risk' ? '#e74c3c' : '#27ae60'} 
                />
                <Text style={[styles.riskBadgeText, currentRisk === 'Possible PPD Risk' && styles.riskBadgeTextHigh]}>
                  {currentRisk}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle" size={22} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          {/* Stage Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              <Ionicons name="flag" size={16} color="#636e72" /> Stage <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selectButton, !stage && styles.selectButtonEmpty]}
              onPress={() => setShowStageModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.selectButtonText, !stage && styles.selectButtonTextEmpty]}>
                {stage || 'Select your stage'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={stage ? '#6c5ce7' : '#999'} />
            </TouchableOpacity>
          </View>

          {/* Region Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              <Ionicons name="location" size={16} color="#636e72" /> Region <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selectButton, !region && styles.selectButtonEmpty]}
              onPress={() => setShowRegionModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.selectButtonText, !region && styles.selectButtonTextEmpty]}>
                {region || 'Select your region'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={region ? '#6c5ce7' : '#999'} />
            </TouchableOpacity>
          </View>

          {/* Sleep Hours Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              <Ionicons name="moon" size={16} color="#636e72" /> Sleep Hours (per day) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={sleepHours}
                onChangeText={handleSleepHoursChange}
                placeholder="Enter hours (0-24)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={5}
              />
              <View style={styles.inputSuffixContainer}>
                <Text style={styles.inputSuffix}>hrs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Questions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={22} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>Assessment Questions</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Please answer each question honestly. Your responses help determine your risk level.
          </Text>

          {QUESTIONS.map((question, index) => {
            const isAnswered = questionnaireResponses.hasOwnProperty(question.id);
            const answer = questionnaireResponses[question.id];
            
            return (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionNumberBadge}>
                    <Text style={styles.questionNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.questionIconContainer}>
                    <Ionicons name={question.icon as any} size={20} color="#6c5ce7" />
                  </View>
                  <Text style={styles.questionText}>{question.text}</Text>
                </View>
                
                <View style={styles.answerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      isAnswered && !answer && styles.answerButtonActive,
                      !isAnswered && styles.answerButtonInactive
                    ]}
                    onPress={() => handleQuestionChange(question.id, false)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="close-circle" 
                      size={20} 
                      color={isAnswered && !answer ? '#fff' : '#636e72'} 
                    />
                    <Text style={[
                      styles.answerButtonText,
                      isAnswered && !answer && styles.answerButtonTextActive
                    ]}>
                      No
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.switchContainer}>
                    <Switch
                      value={answer || false}
                      onValueChange={(value) => handleQuestionChange(question.id, value)}
                      trackColor={{ false: '#e0e0e0', true: '#6c5ce7' }}
                      thumbColor="#ffffff"
                      ios_backgroundColor="#e0e0e0"
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      isAnswered && answer && styles.answerButtonActive,
                      !isAnswered && styles.answerButtonInactive
                    ]}
                    onPress={() => handleQuestionChange(question.id, true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color={isAnswered && answer ? '#fff' : '#636e72'} 
                    />
                    <Text style={[
                      styles.answerButtonText,
                      isAnswered && answer && styles.answerButtonTextActive
                    ]}>
                      Yes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              (!isFormValid || isSubmitting) && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit} 
            activeOpacity={0.8}
            disabled={!isFormValid || isSubmitting}
          >
            <View style={styles.submitButtonContent}>
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#fff" style={styles.submitLoader} />
                  <Text style={styles.submitButtonText}>
                    Saving to MongoDB...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    Submit Assessment
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Stage Modal */}
      <Modal
        visible={showStageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Stage</Text>
              <TouchableOpacity 
                onPress={() => setShowStageModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#636e72" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptionsContainer}>
              {STAGES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.modalOption, stage === s && styles.modalOptionSelected]}
                  onPress={() => {
                    setStage(s);
                    setShowStageModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={stage === s ? 'radio-button-on' : 'radio-button-off'} 
                    size={20} 
                    color={stage === s ? '#6c5ce7' : '#999'} 
                  />
                  <Text style={[styles.modalOptionText, stage === s && styles.modalOptionTextSelected]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Region Modal */}
      <Modal
        visible={showRegionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Region</Text>
              <TouchableOpacity 
                onPress={() => setShowRegionModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#636e72" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptionsContainer}>
              {REGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.modalOption, region === r && styles.modalOptionSelected]}
                  onPress={() => {
                    setRegion(r);
                    setShowRegionModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={region === r ? 'radio-button-on' : 'radio-button-off'} 
                    size={20} 
                    color={region === r ? '#6c5ce7' : '#999'} 
                  />
                  <Text style={[styles.modalOptionText, region === r && styles.modalOptionTextSelected]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  contentContainer: {
    padding: 20,
    paddingTop: 24,
  },
  riskPreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  riskPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  riskPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
  },
  riskPreviewContent: {
    alignItems: 'center',
  },
  riskScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  riskScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  riskScoreMax: {
    fontSize: 20,
    color: '#636e72',
    fontWeight: '600',
    marginLeft: 4,
  },
  riskBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  riskBar: {
    height: '100%',
    backgroundColor: '#6c5ce7',
    borderRadius: 5,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e8f8f0',
    gap: 6,
  },
  riskBadgeHigh: {
    backgroundColor: '#fee',
  },
  riskBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27ae60',
  },
  riskBadgeTextHigh: {
    color: '#e74c3c',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
    marginBottom: 20,
    paddingLeft: 32,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 10,
  },
  required: {
    color: '#e74c3c',
    fontSize: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6c5ce7',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectButtonEmpty: {
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '600',
    flex: 1,
  },
  selectButtonTextEmpty: {
    color: '#999',
    fontWeight: '400',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6c5ce7',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '600',
  },
  inputSuffixContainer: {
    paddingRight: 16,
    paddingLeft: 8,
  },
  inputSuffix: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questionNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: '#2d3436',
    lineHeight: 22,
    fontWeight: '500',
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    gap: 8,
  },
  answerButtonActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  answerButtonInactive: {
    opacity: 0.6,
  },
  answerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#636e72',
  },
  answerButtonTextActive: {
    color: '#fff',
  },
  switchContainer: {
    paddingHorizontal: 8,
  },
  submitButton: {
    backgroundColor: '#6c5ce7',
    padding: 18,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#b2b2b2',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitLoader: {
    marginRight: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerSpacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionsContainer: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    gap: 12,
  },
  modalOptionSelected: {
    backgroundColor: '#f8f4ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2d3436',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#6c5ce7',
    fontWeight: '600',
  },
});

export default QuestionnaireScreen;
