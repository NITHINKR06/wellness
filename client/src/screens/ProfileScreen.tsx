import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthScreen from './AuthScreen';

interface ProfileScreenProps {
  email?: string;
  resultsCount: number;
  onSignOut: () => void;
  onNavigateToResults: () => void;
  onNavigateToQuestionnaire: () => void;
  isAuthenticated: boolean;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  email,
  resultsCount,
  onSignOut,
  onNavigateToResults,
  onNavigateToQuestionnaire,
  isAuthenticated,
}) => {
  if (!isAuthenticated) {
    return (
      <View style={styles.authWrapper}>
        <AuthScreen />
      </View>
    );
  }

  const displayName = email ? email.split('@')[0] : 'Explorer';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.welcomeText}>Hello, {displayName}</Text>
        {email && <Text style={styles.emailText}>{email}</Text>}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{resultsCount}</Text>
          <Text style={styles.statLabel}>Saved Assessments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.max(resultsCount, 1)}</Text>
          <Text style={styles.statLabel}>Calm Sessions</Text>
        </View>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Quick actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onNavigateToQuestionnaire}
          activeOpacity={0.85}
        >
          <Ionicons name="pulse-outline" size={20} color="#6c5ce7" />
          <Text style={styles.actionButtonText}>Start a new assessment</Text>
          <Ionicons name="chevron-forward" size={18} color="#b2bec3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onNavigateToResults}
          activeOpacity={0.85}
        >
          <Ionicons name="stats-chart-outline" size={20} color="#6c5ce7" />
          <Text style={styles.actionButtonText}>View your history</Text>
          <Ionicons name="chevron-forward" size={18} color="#b2bec3" />
        </TouchableOpacity>
      </View>

      <View style={styles.securityCard}>
        <Ionicons name="shield-checkmark" size={24} color="#2ecc71" />
        <View style={styles.securityTextWrapper}>
          <Text style={styles.securityTitle}>Secure sync</Text>
          <Text style={styles.securitySubtitle}>
            Your assessments are encrypted and saved to your account so you can continue on any device.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={onSignOut} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 48,
    gap: 20,
  },
  authWrapper: {
    flex: 1,
    backgroundColor: '#f3f2ff',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginTop: 59,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0e9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6c5ce7',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
  },
  emailText: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6c5ce7',
  },
  statLabel: {
    fontSize: 13,
    color: '#636e72',
    marginTop: 4,
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f5',
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#2d3436',
    fontWeight: '600',
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eafaf1',
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  securityTextWrapper: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d7b4d',
    marginBottom: 4,
  },
  securitySubtitle: {
    fontSize: 13,
    color: '#347a5a',
    lineHeight: 18,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffe3e0',
    backgroundColor: '#fff',
  },
  signOutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;


