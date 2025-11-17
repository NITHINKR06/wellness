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
          <Text style={styles.headerSubtitle}>Get help when you need it</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency</Text>
          <Text style={styles.sectionDescription}>
            If you're in immediate danger or having thoughts of harming yourself or your baby
          </Text>
          
          <View style={styles.emergencyButtons}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => handleCall('112')}
            >
              <Ionicons name="call" size={24} color="#fff" />
              <Text style={styles.emergencyButtonText}>112</Text>
              <Text style={styles.emergencyButtonLabel}>Emergency</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.emergencyButton, styles.ambulanceButton]}
              onPress={() => handleCall('108')}
            >
              <Ionicons name="medical" size={24} color="#fff" />
              <Text style={styles.emergencyButtonText}>108</Text>
              <Text style={styles.emergencyButtonLabel}>Ambulance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Karnataka Helplines */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Karnataka Helplines</Text>
            <View style={styles.stateBadge}>
              <Text style={styles.stateBadgeText}>KA</Text>
            </View>
          </View>
          
          <View style={styles.helplineCard}>
            <View style={styles.helplineHeader}>
              <Text style={styles.helplineName}>We-Care Mental Health</Text>
              <Text style={styles.helplineLocation}>Bengaluru • NIMHANS</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall('918277946600')}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>82779-46600</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helplineCard}>
            <View style={styles.helplineHeader}>
              <Text style={styles.helplineName}>Arogyavani</Text>
              <Text style={styles.helplineLocation}>Karnataka Health Helpline • 24/7</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall('104')}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>104</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* National Helplines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>National Helplines</Text>
          
          <View style={styles.helplineCard}>
            <View style={styles.helplineHeader}>
              <Text style={styles.helplineName}>Vandrevala Foundation</Text>
              <Text style={styles.helplineLocation}>24/7 • All India</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.callButton, styles.callButtonSmall]}
                onPress={() => handleCall('18602662345')}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.callButtonTextSmall}>1860-2662-345</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.callButton, styles.callButtonSmall]}
                onPress={() => handleCall('18002333330')}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.callButtonTextSmall}>1800-2333-330</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => handleWebsite('https://www.vandrevalafoundation.com')}
            >
              <Ionicons name="globe-outline" size={18} color="#6c5ce7" />
              <Text style={styles.websiteButtonText}>Visit Website</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helplineCard}>
            <View style={styles.helplineHeader}>
              <Text style={styles.helplineName}>iCall Helpline</Text>
              <Text style={styles.helplineLocation}>Mon-Sat • 10 AM - 8 PM</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall('02225521111')}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>022-2552-1111</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => handleWebsite('https://icallhelpline.org')}
            >
              <Ionicons name="globe-outline" size={18} color="#6c5ce7" />
              <Text style={styles.websiteButtonText}>Visit Website</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helplineCard}>
            <View style={styles.helplineHeader}>
              <Text style={styles.helplineName}>AASRA</Text>
              <Text style={styles.helplineLocation}>Mumbai • 24/7</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall('912227546669')}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>91-22-2754-6669</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => handleWebsite('http://www.aasra.info')}
            >
              <Ionicons name="globe-outline" size={18} color="#6c5ce7" />
              <Text style={styles.websiteButtonText}>Visit Website</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helplineCard}>
            <View style={styles.helplineHeader}>
              <Text style={styles.helplineName}>Sneha Foundation</Text>
              <Text style={styles.helplineLocation}>Chennai • 24/7</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall('914424640050')}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>044-2464-0050</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => handleWebsite('https://snehaindia.org')}
            >
              <Ionicons name="globe-outline" size={18} color="#6c5ce7" />
              <Text style={styles.websiteButtonText}>Visit Website</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Self-Care Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Self-Care Tips</Text>
          
          <View style={styles.tipCard}>
            <Ionicons name="moon" size={20} color="#6c5ce7" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Prioritize Sleep</Text>
              <Text style={styles.tipText}>
                Aim for 7-9 hours of sleep per night. Rest when your baby sleeps.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="people" size={20} color="#6c5ce7" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Build Support Network</Text>
              <Text style={styles.tipText}>
                Connect with family, friends, or support groups. You don't have to do this alone.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="fitness" size={20} color="#6c5ce7" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay Active</Text>
              <Text style={styles.tipText}>
                Even a short walk can help improve your mood. Start with gentle activities.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="restaurant" size={20} color="#6c5ce7" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Eat Nutritious Meals</Text>
              <Text style={styles.tipText}>
                Maintain a balanced diet. Regular, healthy meals can help stabilize your mood.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="chatbubbles" size={20} color="#6c5ce7" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Talk About Your Feelings</Text>
              <Text style={styles.tipText}>
                Expressing your emotions is important. Talk to someone you trust.
              </Text>
            </View>
          </View>
        </View>

        {/* When to Seek Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When to Seek Professional Help</Text>
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              Consider seeking professional help if you experience:
            </Text>
            <View style={styles.warningList}>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningItemText}>Persistent feelings of sadness or hopelessness</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningItemText}>Difficulty bonding with your baby</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningItemText}>Thoughts of harming yourself or your baby</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningItemText}>Severe anxiety or panic attacks</Text>
              </View>
              <View style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
    marginBottom: 16,
  },
  stateBadge: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stateBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emergencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  emergencyButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ambulanceButton: {
    backgroundColor: '#c0392b',
  },
  emergencyButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyButtonLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  helplineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  helplineHeader: {
    marginBottom: 12,
  },
  helplineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  helplineLocation: {
    fontSize: 13,
    color: '#636e72',
  },
  callButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  callButtonSmall: {
    flex: 1,
    paddingVertical: 10,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  callButtonTextSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0d5ff',
    backgroundColor: '#f8f4ff',
  },
  websiteButtonText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#636e72',
    lineHeight: 18,
  },
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffe5e5',
  },
  warningText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 12,
  },
  warningList: {
    gap: 10,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  warningBullet: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginTop: 2,
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
