import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onNavigateToQuestionnaire: () => void;
  onNavigateToResults: () => void;
  onNavigateToResources?: () => void;
  resultsCount?: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigateToQuestionnaire, 
  onNavigateToResults,
  onNavigateToResources,
  resultsCount = 0 
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Illustration Section */}
        <View style={styles.illustrationSection}>
          {/* Decorative Leaves - Top Corners */}
          <View style={[styles.leaf, styles.leafTopLeft]}>
            <Ionicons name="leaf" size={24} color="#4ecdc4" />
          </View>
          <View style={[styles.leaf, styles.leafTopRight]}>
            <Ionicons name="leaf" size={20} color="#4ecdc4" />
          </View>

          {/* Main Illustration Container */}
          <View style={styles.brainContainer}>
            {/* Central Brain/Heart */}
            <View style={styles.brain}>
              <Ionicons name="heart" size={60} color="#ffb3d1" />
            </View>

            {/* Connection Line to Lightbulb */}
            <View style={styles.connectionLineLeft} />

            {/* Lightbulb on Left */}
            <View style={styles.lightbulbContainer}>
              <View style={styles.lightbulb}>
                <Ionicons name="bulb" size={32} color="#ffd93d" />
              </View>
            </View>

            {/* Connection Line to Gears */}
            <View style={styles.connectionLineRight} />

            {/* Gears on Right */}
            <View style={styles.gearsContainer}>
              <View style={styles.gear1}>
                <Ionicons name="settings" size={20} color="#636e72" />
              </View>
              <View style={styles.gear2}>
                <Ionicons name="settings" size={16} color="#636e72" />
              </View>
            </View>

            {/* Decorative Dots */}
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
            <View style={[styles.dot, styles.dot4]} />
            <View style={[styles.dot, styles.dot5]} />
          </View>

          {/* Decorative Leaves around brain */}
          <View style={[styles.leaf, styles.leafLeft]}>
            <Ionicons name="leaf" size={18} color="#4ecdc4" />
          </View>
          <View style={[styles.leaf, styles.leafRight]}>
            <Ionicons name="leaf" size={16} color="#4ecdc4" />
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Take Care Of Your Mental</Text>
          <Text style={styles.descriptionText}>
            Are you feeling overwhelmed by anxiety and stress? Our app will help you find calm and balance in your day to day life.
          </Text>
        </View>

        {/* Bottom Leaves */}
        <View style={styles.bottomLeaves}>
          <View style={[styles.leaf, styles.leafBottomLeft]}>
            <Ionicons name="leaf" size={22} color="#4ecdc4" />
          </View>
          <View style={[styles.leaf, styles.leafBottomRight]}>
            <Ionicons name="leaf" size={20} color="#4ecdc4" />
          </View>
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNavigateToQuestionnaire}
          activeOpacity={0.8}
        >
          <View style={styles.buttonGradient}>
            <Text style={styles.primaryButtonText}>Start Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
  },
  illustrationSection: {
    width: '100%',
    height: 300,
    position: 'relative',
    marginBottom: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brainContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brain: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffe0e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffb3d1',
    shadowColor: '#ffb3d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 3,
    left: '50%',
    top: '50%',
    marginLeft: -55,
    marginTop: -55,
  },
  connectionLineLeft: {
    position: 'absolute',
    left: 50,
    top: '50%',
    width: 50,
    height: 2,
    backgroundColor: '#95a5a6',
    zIndex: 1,
    marginTop: -1,
  },
  lightbulbContainer: {
    position: 'absolute',
    left: 20,
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: -28,
  },
  lightbulb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffd93d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  connectionLineRight: {
    position: 'absolute',
    right: 50,
    top: '50%',
    width: 50,
    height: 2,
    backgroundColor: '#95a5a6',
    zIndex: 1,
    marginTop: -1,
  },
  gearsContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: -40,
  },
  gear1: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gear2: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dot1: {
    top: 30,
    left: 80,
    backgroundColor: '#4ecdc4',
  },
  dot2: {
    top: 70,
    right: 70,
    backgroundColor: '#c0392b',
  },
  dot3: {
    bottom: 80,
    left: 60,
    backgroundColor: '#95e1d3',
  },
  dot4: {
    bottom: 50,
    right: 80,
    backgroundColor: '#ff6b9d',
  },
  dot5: {
    top: 100,
    left: 120,
    backgroundColor: '#3498db',
  },
  leaf: {
    position: 'absolute',
  },
  leafTopLeft: {
    top: 20,
    left: 20,
  },
  leafTopRight: {
    top: 30,
    right: 20,
  },
  leafLeft: {
    left: 20,
    top: '45%',
  },
  leafRight: {
    right: 20,
    top: '55%',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomLeaves: {
    width: '100%',
    height: 40,
    position: 'relative',
    marginBottom: 32,
  },
  leafBottomLeft: {
    left: 0,
    bottom: 0,
  },
  leafBottomRight: {
    right: 0,
    bottom: 0,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#ff6b9d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    backgroundColor: '#ff7ba3',
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  footerSpacer: {
    height: 20,
  },
});

export default HomeScreen;
