import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ResourcesScreenProps {
  onBack: () => void;
}

const ResourcesScreen: React.FC<ResourcesScreenProps> = ({ onBack }) => {
  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Resources & Support</Text>
          <Text style={styles.headerSubtitle}>Help and guidance when you need it</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={24} color="#e74c3c" />
            <Text style={styles.sectionTitle}>Emergency Support</Text>
          </View>
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyText}>
              If you are experiencing a mental health crisis or having thoughts of harming yourself or your baby, please seek immediate help.
            </Text>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => handleCall('911')}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.emergencyButtonText}>Call 911</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mental Health Hotlines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={22} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>Mental Health Hotlines</Text>
          </View>
          
          <View style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Ionicons name="call" size={20} color="#6c5ce7" />
              <Text style={styles.resourceTitle}>National Suicide Prevention Lifeline</Text>
            </View>
            <Text style={styles.resourceDescription}>
              24/7 free and confidential support for people in distress
            </Text>
            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => handleCall('988')}
            >
              <Text style={styles.resourceButtonText}>Call 988</Text>
              <Ionicons name="chevron-forward" size={18} color="#6c5ce7" />
            </TouchableOpacity>
          </View>

          <View style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Ionicons name="call" size={20} color="#6c5ce7" />
              <Text style={styles.resourceTitle}>Postpartum Support International</Text>
            </View>
            <Text style={styles.resourceDescription}>
              Support for perinatal mood and anxiety disorders
            </Text>
            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => handleCall('18009444772')}
            >
              <Text style={styles.resourceButtonText}>Call 1-800-944-4773</Text>
              <Ionicons name="chevron-forward" size={18} color="#6c5ce7" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => handleWebsite('https://www.postpartum.net')}
            >
              <Text style={styles.resourceButtonText}>Visit Website</Text>
              <Ionicons name="chevron-forward" size={18} color="#6c5ce7" />
            </TouchableOpacity>
          </View>

          <View style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Ionicons name="call" size={20} color="#6c5ce7" />
              <Text style={styles.resourceTitle}>Crisis Text Line</Text>
            </View>
            <Text style={styles.resourceDescription}>
              Text HOME to 741741 for 24/7 crisis support
            </Text>
            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => Linking.openURL('sms:741741&body=HOME')}
            >
              <Text style={styles.resourceButtonText}>Text HOME to 741741</Text>
              <Ionicons name="chevron-forward" size={18} color="#6c5ce7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Self-Care Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={22} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>Self-Care Tips</Text>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="moon" size={24} color="#6c5ce7" />
            <Text style={styles.tipTitle}>Prioritize Sleep</Text>
            <Text style={styles.tipText}>
              Aim for 7-9 hours of sleep per night. Rest when your baby sleeps, and don't hesitate to ask for help with nighttime feedings.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="people" size={24} color="#6c5ce7" />
            <Text style={styles.tipTitle}>Build Your Support Network</Text>
            <Text style={styles.tipText}>
              Connect with family, friends, or support groups. You don't have to do this alone. Reach out to people you trust.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="fitness" size={24} color="#6c5ce7" />
            <Text style={styles.tipTitle}>Stay Active</Text>
            <Text style={styles.tipText}>
              Even a short walk can help improve your mood. Start with gentle activities and gradually increase as you feel ready.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="restaurant" size={24} color="#6c5ce7" />
            <Text style={styles.tipTitle}>Eat Nutritious Meals</Text>
            <Text style={styles.tipText}>
              Maintain a balanced diet. Regular, healthy meals can help stabilize your mood and energy levels.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="chatbubbles" size={24} color="#6c5ce7" />
            <Text style={styles.tipTitle}>Talk About Your Feelings</Text>
            <Text style={styles.tipText}>
              Expressing your emotions is important. Talk to your partner, a friend, or a mental health professional about what you're experiencing.
            </Text>
          </View>
        </View>

        {/* When to Seek Help */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={22} color="#6c5ce7" />
            <Text style={styles.sectionTitle}>When to Seek Professional Help</Text>
          </View>
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              Consider seeking professional help if you experience:
            </Text>
            <View style={styles.warningList}>
              <View style={styles.warningItem}>
                <Ionicons name="ellipse" size={8} color="#e74c3c" />
                <Text style={styles.warningItemText}>Persistent feelings of sadness or hopelessness</Text>
              </View>
              <View style={styles.warningItem}>
                <Ionicons name="ellipse" size={8} color="#e74c3c" />
                <Text style={styles.warningItemText}>Difficulty bonding with your baby</Text>
              </View>
              <View style={styles.warningItem}>
                <Ionicons name="ellipse" size={8} color="#e74c3c" />
                <Text style={styles.warningItemText}>Thoughts of harming yourself or your baby</Text>
              </View>
              <View style={styles.warningItem}>
                <Ionicons name="ellipse" size={8} color="#e74c3c" />
                <Text style={styles.warningItemText}>Severe anxiety or panic attacks</Text>
              </View>
              <View style={styles.warningItem}>
                <Ionicons name="ellipse" size={8} color="#e74c3c" />
                <Text style={styles.warningItemText}>Inability to care for yourself or your baby</Text>
              </View>
            </View>
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
  section: {
    marginBottom: 28,
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
  emergencyCard: {
    backgroundColor: '#fee',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  emergencyText: {
    fontSize: 15,
    color: '#c0392b',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    flex: 1,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
    marginBottom: 16,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f4ff',
    borderRadius: 12,
    marginBottom: 8,
  },
  resourceButtonText: {
    fontSize: 15,
    color: '#6c5ce7',
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 12,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffe5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  warningText: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '600',
    marginBottom: 16,
  },
  warningList: {
    gap: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  warningItemText: {
    flex: 1,
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
  footerSpacer: {
    height: 20,
  },
});

export default ResourcesScreen;

