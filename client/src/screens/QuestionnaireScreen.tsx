import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stage, Region, RiskResult, QuestionnaireResponse, AssessmentResult } from '../models/result';

// Define available stages and regions
const STAGES: Stage[] = ['First Trimester', 'Second Trimester', 'Third Trimester', 'Postpartum'];
const REGIONS: Region[] = ['North', 'South', 'East', 'West', 'Central'];

// Define questionnaire questions (can be expanded)
const QUESTIONS = [
  { id: 'q1', text: 'I have been feeling sad, anxious, or empty' },
  { id: 'q2', text: 'I have lost interest in activities I used to enjoy' },
  { id: 'q3', text: 'I have been sleeping too much or too little' },
  { id: 'q4', text: 'I have had changes in my appetite' },
  { id: 'q5', text: 'I have been feeling irritable or angry' },
  { id: 'q6', text: 'I have had difficulty concentrating or making decisions' },
  { id: 'q7', text: 'I have been feeling guilty or worthless' },
  { id: 'q8', text: 'I have had thoughts of harming myself or my baby' },
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
  const _calculateRisk = (responses: QuestionnaireResponse): RiskResult => {
    // Count number of "true" responses
    const trueCount = Object.values(responses).filter(Boolean).length;
    
    // Risk calculation: If 5 or more questions are answered as true, it's "Possible PPD Risk"
    // This threshold can be adjusted based on clinical requirements
    if (trueCount >= 5) {
      return 'Possible PPD Risk';
    }
    return 'Low Risk';
  };

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
  const handleSubmit = () => {
    // Validation
    if (!stage || !region || !sleepHours) {
      alert('Please fill in all fields (Stage, Region, and Sleep Hours)');
      return;
    }

    const sleepHoursNum = parseFloat(sleepHours);
    if (isNaN(sleepHoursNum) || sleepHoursNum < 0 || sleepHoursNum > 24) {
      alert('Please enter a valid number of sleep hours (0-24)');
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

    // Submit the result
    onSubmit(assessmentResult);

    // Reset form
    setStage('');
    setRegion('');
    setSleepHours('');
    setQuestionnaireResponses({});
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="clipboard-outline" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>PPD Risk Assessment</Text>
        <Text style={styles.subtitle}>Complete the questionnaire to assess your risk</Text>
      </View>

      {/* Stage Dropdown */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Ionicons name="flag-outline" size={16} color="#636e72" style={styles.labelIcon} />
          <Text style={styles.label}>
            Stage <Text style={styles.required}>*</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.dropdown, !stage && styles.dropdownPlaceholder]}
          onPress={() => setShowStageModal(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !stage && styles.dropdownTextPlaceholder]}>
            {stage || 'Select Stage'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Stage Modal */}
      <Modal
        visible={showStageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowStageModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Stage</Text>
              <TouchableOpacity 
                onPress={() => setShowStageModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalOptionsContainer}>
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
                  <Text style={[styles.modalOptionText, stage === s && styles.modalOptionTextSelected]}>
                    {s}
                  </Text>
                  {stage === s && (
                    <Ionicons name="checkmark" size={20} color="#6c5ce7" style={styles.modalOptionCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Region Dropdown */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Ionicons name="globe-outline" size={16} color="#636e72" style={styles.labelIcon} />
          <Text style={styles.label}>
            Region <Text style={styles.required}>*</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.dropdown, !region && styles.dropdownPlaceholder]}
          onPress={() => setShowRegionModal(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !region && styles.dropdownTextPlaceholder]}>
            {region || 'Select Region'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Region Modal */}
      <Modal
        visible={showRegionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowRegionModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Region</Text>
              <TouchableOpacity 
                onPress={() => setShowRegionModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalOptionsContainer}>
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
                  <Text style={[styles.modalOptionText, region === r && styles.modalOptionTextSelected]}>
                    {r}
                  </Text>
                  {region === r && (
                    <Ionicons name="checkmark" size={20} color="#6c5ce7" style={styles.modalOptionCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sleep Hours Input */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Ionicons name="moon-outline" size={16} color="#636e72" style={styles.labelIcon} />
          <Text style={styles.label}>
            Sleep Hours (per day) <Text style={styles.required}>*</Text>
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={sleepHours}
            onChangeText={handleSleepHoursChange}
            placeholder="Enter sleep hours (0-24)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={5}
          />
          <Text style={styles.inputSuffix}>hours</Text>
        </View>
      </View>

      {/* Questionnaire Questions */}
      <View style={styles.sectionHeader}>
        <Ionicons name="help-circle-outline" size={20} color="#2d3436" style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Please answer the following questions:</Text>
      </View>
      {QUESTIONS.map((question, index) => (
        <View key={question.id} style={styles.questionContainer}>
          <View style={styles.questionHeader}>
            <View style={styles.questionNumber}>
              <Text style={styles.questionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.questionText}>{question.text}</Text>
          </View>
          <View style={styles.switchContainer}>
            <View style={[styles.switchOption, !questionnaireResponses[question.id] && styles.switchOptionActive]}>
              <Text style={[styles.switchLabel, !questionnaireResponses[question.id] && styles.switchLabelActive]}>
                No
              </Text>
            </View>
            <View style={styles.switchWrapper}>
              <Switch
                value={questionnaireResponses[question.id] || false}
                onValueChange={(value) => handleQuestionChange(question.id, value)}
                trackColor={{ false: '#e0e0e0', true: '#6c5ce7' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e0e0e0"
              />
            </View>
            <View style={[styles.switchOption, questionnaireResponses[question.id] && styles.switchOptionActive]}>
              <Text style={[styles.switchLabel, questionnaireResponses[question.id] && styles.switchLabelActive]}>
                Yes
              </Text>
            </View>
          </View>
        </View>
      ))}

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit} 
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.submitButtonIcon} />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 30,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 30,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2d3436',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 22,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
  },
  labelIcon: {
    marginRight: 6,
  },
  required: {
    color: '#e74c3c',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#2d3436',
  },
  inputSuffix: {
    paddingRight: 16,
    fontSize: 14,
    color: '#636e72',
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownPlaceholder: {
    borderColor: '#e0e0e0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#2d3436',
    flex: 1,
  },
  dropdownTextPlaceholder: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#636e72',
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e9ecef',
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    flex: 1,
  },
  questionContainer: {
    marginBottom: 18,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  questionNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 16,
    color: '#2d3436',
    flex: 1,
    lineHeight: 22,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  switchWrapper: {
    marginHorizontal: 12,
  },
  switchOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    minWidth: 60,
    alignItems: 'center',
  },
  switchOptionActive: {
    backgroundColor: '#6c5ce7',
  },
  switchLabel: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '600',
  },
  switchLabelActive: {
    color: '#fff',
  },
  buttonContainer: {
    marginTop: 35,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#6c5ce7',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#636e72',
    fontWeight: 'bold',
  },
  modalOptionsContainer: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
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
  modalOptionCheck: {
    marginLeft: 10,
  },
});

export default QuestionnaireScreen;

