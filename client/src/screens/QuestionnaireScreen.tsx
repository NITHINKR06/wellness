import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stage, Region, QuestionnaireResponse, QuestionnaireSubmission } from '../models/result';
import { STAGES, REGIONS, QUESTIONS, MIDDLE_EAST_COUNTRIES } from '../utils/constants';
import { OFFLINE_ERROR_CODE } from '../utils/api';

interface QuestionnaireScreenProps {
  onSubmit: (submission: QuestionnaireSubmission) => void | Promise<void>;
  isSubmitting?: boolean;
}

const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ onSubmit, isSubmitting = false }) => {
  const [stage, setStage] = useState<Stage | ''>('');
  const [region, setRegion] = useState<Region | ''>('');
  const [sleepHours, setSleepHours] = useState<string>('');
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse>({});
  const [showStageModal, setShowStageModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [middleEastCountry, setMiddleEastCountry] = useState('');

  const isMiddleEastRegion = region === 'Middle East';

  const handleRegionSelect = (selectedRegion: Region) => {
    setRegion(selectedRegion);
    setShowRegionModal(false);
    if (selectedRegion !== 'Middle East') {
      setMiddleEastCountry('');
    }
  };

  const handleCountrySelect = (country: string) => {
    setMiddleEastCountry(country);
    setShowCountryModal(false);
  };

  const handleQuestionChange = (questionId: string, value: boolean) => {
    setQuestionnaireResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSleepHoursChange = (text: string) => {
    if (text === '') {
      setSleepHours('');
      return;
    }

    const numericText = text.replace(/[^0-9.]/g, '');
    
    if ((numericText.match(/\./g) || []).length > 1) {
      return;
    }

    const numValue = parseFloat(numericText);
  
    if (isNaN(numValue)) {
      if (numericText === '' || numericText === '.') {
        setSleepHours(numericText);
        return;
      }
      return;
    }

    if (numValue < 0) {
      setSleepHours('0');
      return;
    }
  
    if (numValue > 24) {
      setSleepHours('24');
      return;
    }

    setSleepHours(numericText);
  };

  const handleSubmit = async () => {
    if (!stage || !region || !sleepHours) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields',
        [{ text: 'OK' }]
      );
      return;
    }

    if (region === 'Middle East' && !middleEastCountry) {
      Alert.alert(
        'Missing Information',
        'Please select your country within the Middle East region.',
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

    const unanswered = QUESTIONS.filter(
      (question) => !questionnaireResponses.hasOwnProperty(question.id)
    );

    if (unanswered.length > 0) {
      Alert.alert(
        'Incomplete Assessment',
        'Please answer every question before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    const submission: QuestionnaireSubmission = {
      stage: stage as Stage,
      region: region as Region,
      sleepHours: sleepHoursNum,
      questionnaireResponses: { ...questionnaireResponses },
      middleEastCountry: region === 'Middle East' ? middleEastCountry : undefined,
    };

    try {
      await onSubmit(submission);
      setStage('');
      setRegion('');
      setSleepHours('');
      setQuestionnaireResponses({});
      setMiddleEastCountry('');
    } catch (error: any) {
      if (error?.message === OFFLINE_ERROR_CODE || error?.name === 'OfflineError') {
        setStage('');
        setRegion('');
        setSleepHours('');
        setQuestionnaireResponses({});
        setMiddleEastCountry('');
      }
    }
  };

  const isFormValid = Boolean(
    stage &&
      region &&
      sleepHours &&
      (!isMiddleEastRegion || (isMiddleEastRegion && middleEastCountry))
  );

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
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldContainer, styles.fieldHalf]}>
              <Text style={styles.fieldLabel}>Stage <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.selectButton, !stage && styles.selectButtonEmpty]}
                onPress={() => setShowStageModal(true)}
              >
                <Text style={[styles.selectButtonText, !stage && styles.selectButtonTextEmpty]} numberOfLines={1}>
                  {stage || 'Select'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={stage ? '#6c5ce7' : '#999'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldContainer, styles.fieldHalf]}>
              <Text style={styles.fieldLabel}>Region <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.selectButton, !region && styles.selectButtonEmpty]}
                onPress={() => setShowRegionModal(true)}
              >
                <Text style={[styles.selectButtonText, !region && styles.selectButtonTextEmpty]} numberOfLines={1}>
                  {region || 'Select'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={region ? '#6c5ce7' : '#999'} />
              </TouchableOpacity>
            </View>
          </View>

          {isMiddleEastRegion && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Which country in Middle East region you belong <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectButton, !middleEastCountry && styles.selectButtonEmpty]}
                onPress={() => setShowCountryModal(true)}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    !middleEastCountry && styles.selectButtonTextEmpty,
                  ]}
                  numberOfLines={1}
                >
                  {middleEastCountry || 'Select'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={middleEastCountry ? '#6c5ce7' : '#999'}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Sleep Hours (per day) <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={sleepHours}
                onChangeText={handleSleepHoursChange}
                placeholder="0-24"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={styles.inputSuffix}>hrs</Text>
            </View>
          </View>
        </View>

        {/* Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions</Text>

          {QUESTIONS.map((question, index) => {
            const isAnswered = questionnaireResponses.hasOwnProperty(question.id);
            const answer = questionnaireResponses[question.id];
            
            return (
              <View key={question.id} style={styles.questionCard}>
                <Text style={styles.questionNumber}>Q{index + 1}</Text>
                <Text style={styles.questionText}>{question.text}</Text>
                
                <View style={styles.answerButtons}>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      isAnswered && !answer && styles.answerButtonNo,
                    ]}
                    onPress={() => handleQuestionChange(question.id, false)}
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

                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      isAnswered && answer && styles.answerButtonYes,
                    ]}
                    onPress={() => handleQuestionChange(question.id, true)}
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
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>Submitting...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Assessment</Text>
            </>
          )}
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
                  onPress={() => handleRegionSelect(r)}
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
      {/* Country Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setShowCountryModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#636e72" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptionsContainer}>
              {MIDDLE_EAST_COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country}
                  style={[
                    styles.modalOption,
                    middleEastCountry === country && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleCountrySelect(country)}
                >
                  <Ionicons
                    name={middleEastCountry === country ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={middleEastCountry === country ? '#6c5ce7' : '#999'}
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      middleEastCountry === country && styles.modalOptionTextSelected,
                    ]}
                  >
                    {country}
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
    backgroundColor: '#f8f9fa',
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldHalf: {
    flex: 1,
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6c5ce7',
    borderRadius: 12,
    padding: 14,
  },
  selectButtonEmpty: {
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  selectButtonText: {
    fontSize: 15,
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
    borderWidth: 1,
    borderColor: '#6c5ce7',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2d3436',
    fontWeight: '600',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '600',
    marginLeft: 8,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c5ce7',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 15,
    color: '#2d3436',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  answerButtonYes: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  answerButtonNo: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  answerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
  },
  answerButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6c5ce7',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#b2b2b2',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 20,
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
  modalOptionsContainer: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    gap: 12,
  },
  modalOptionSelected: {
    backgroundColor: '#f8f4ff',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#2d3436',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#6c5ce7',
    fontWeight: '600',
  },
});

export default QuestionnaireScreen;
