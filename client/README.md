# PPD Risk Assessment Application

A comprehensive React Native mobile application designed to assess and track Postpartum Depression (PPD) risk through an intuitive questionnaire interface. Built with Expo and TypeScript, this application provides healthcare professionals and individuals with a user-friendly tool for early detection and monitoring of PPD symptoms.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Risk Assessment Algorithm](#risk-assessment-algorithm)
- [Screens](#screens)
- [Data Models](#data-models)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The PPD Risk Assessment Application is a mobile health solution that enables users to complete a structured questionnaire to evaluate their risk of Postpartum Depression. The application collects demographic information, sleep patterns, and responses to clinically-relevant questions to generate risk assessments that can be tracked over time.

### Key Objectives

- **Early Detection**: Facilitate early identification of PPD risk factors
- **Data Tracking**: Maintain a history of assessments for longitudinal monitoring
- **User-Friendly Interface**: Provide an intuitive, accessible experience
- **Clinical Relevance**: Base assessments on established screening criteria

## ✨ Features

### Core Functionality

- **Comprehensive Questionnaire**: Multi-question assessment covering key PPD indicators
- **Demographic Data Collection**: Capture stage (trimester/postpartum), region, and sleep patterns
- **Risk Calculation**: Automated risk assessment based on questionnaire responses
- **Results History**: View and track all previous assessments in a chronological list
- **Visual Indicators**: Color-coded risk badges for quick identification
- **Progress Tracking**: Visual progress bars showing questionnaire response patterns
- **User Authentication**: Sign up and login functionality with JWT tokens
- **Offline Support**: Queue submissions when offline, auto-sync when online
- **Cloud Sync**: All data synced to MongoDB backend via Render API

### User Experience

- **Modern UI Design**: Clean, professional interface with consistent styling
- **Bottom Navigation**: Intuitive tab-based navigation for easy access
- **Loading Screen**: Smooth app initialization with branded loading experience
- **Responsive Layout**: Optimized for various screen sizes and orientations
- **Icon-Based Interface**: Professional iconography using Ionicons
- **Empty States**: Helpful messaging when no data is available

### Technical Features

- **TypeScript**: Full type safety throughout the application
- **State Management**: Efficient React hooks-based state management
- **Form Validation**: Input validation for all required fields
- **Modal Dialogs**: User-friendly selection interfaces for dropdowns
- **Safe Area Handling**: Proper spacing for devices with notches and safe areas

## 🛠 Technology Stack

### Core Technologies

- **React Native** (v0.81.5): Cross-platform mobile framework
- **Expo** (v54.0.26): Development platform and toolchain
- **TypeScript** (v5.9.2): Type-safe JavaScript
- **React** (v19.1.0): UI library

### Key Libraries

- **@expo/vector-icons**: Professional icon library (Ionicons)
- **expo-font**: Font loading for custom fonts
- **expo-status-bar**: Status bar management
- **@react-native-async-storage/async-storage**: Local data persistence
- **@react-native-community/netinfo**: Network connectivity detection
- **react-native-chart-kit**: Chart visualization for results
- **react-native-safe-area-context**: Safe area handling
- **react-native-svg**: SVG support for icons and graphics

### Development Tools

- **Expo CLI**: Development server and build tools
- **TypeScript Compiler**: Type checking and compilation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** package manager (yarn.lock removed - using npm only)
- **EAS CLI** (install globally: `npm install -g eas-cli`)
- **Expo account** (sign up at [expo.dev](https://expo.dev))
- **Expo Go** app on your mobile device (for testing) OR
- **iOS Simulator** (for macOS) OR
- **Android Emulator** (for Android development)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd client
```

### Step 2: Install Dependencies

```bash
npm install
```

> **Note**: This project uses npm only. `yarn.lock` has been removed to avoid conflicts.

### Step 3: Verify Installation

Ensure all dependencies are installed correctly:
```bash
npm list
```

## 🏃 Getting Started

### Backend Connection

The app connects to a backend API for data persistence. The backend is deployed on **Render** and accessible from anywhere.

**API Configuration** in `src/utils/api.ts`:
- **Development Mode**: 
  - **Android Emulator**: Set `USE_EMULATOR = true` → Uses `http://10.0.2.2:4000/api`
  - **Physical Device**: Set `USE_EMULATOR = false` and update `LOCAL_IP_ADDRESS` with your computer's IP
  - **iOS Simulator**: Uses `http://localhost:4000/api`
- **Production Mode**: Automatically uses Render backend URL (`https://wellness-backend-mte0.onrender.com/api`)

> See [NETWORK_GUIDE.md](./NETWORK_GUIDE.md) for detailed network configuration guide.

### Development Mode

Start the Expo development server:

```bash
npm start
```

This will:
- Start the Metro bundler
- Display a QR code in the terminal
- Open Expo DevTools in your browser

**Available Scripts:**
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

### Running on Devices

#### Using Expo Go (Recommended for Development)

1. Install **Expo Go** on your iOS or Android device
2. Scan the QR code displayed in the terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
3. The app will load on your device

#### Using Simulators/Emulators

**iOS Simulator** (macOS only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Web Browser**:
```bash
npm run web
```

## 📁 Project Structure

```
client/
├── src/
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication context provider
│   ├── models/
│   │   └── result.ts              # TypeScript data models
│   ├── screens/
│   │   ├── AuthScreen.tsx         # Login/Register screen
│   │   ├── HomeScreen.tsx         # Home screen with navigation
│   │   ├── LoadingScreen.tsx      # App initialization screen
│   │   ├── QuestionnaireScreen.tsx # Main questionnaire interface
│   │   ├── ResultsScreen.tsx      # Assessment results list
│   │   ├── DetailedResultScreen.tsx # Detailed result view
│   │   ├── ProfileScreen.tsx      # User profile screen
│   │   └── ResourcesScreen.tsx    # Resources and information
│   └── utils/
│       ├── api.ts                 # Backend API integration
│       ├── constants.ts           # App constants
│       └── dateUtils.ts          # Date formatting utilities
├── assets/                         # Images and static assets
│   ├── icon.png                   # App icon
│   ├── adaptive-icon.png          # Android adaptive icon
│   ├── splash-icon.png            # Splash screen image
│   └── favicon.png                # Web favicon
├── App.tsx                         # Main application component
├── index.ts                        # Application entry point
├── app.json                        # Expo configuration
├── eas.json                        # EAS Build configuration
├── .easignore                      # Files to exclude from EAS builds
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 📖 Usage Guide

### Completing an Assessment

1. **Launch the Application**: Open the app and wait for the loading screen to complete
2. **Navigate to Questionnaire**: Tap the "Questionnaire" tab at the bottom
3. **Fill Required Fields**:
   - Select your **Stage** (First/Second/Third Trimester or Postpartum)
   - Select your **Region**
   - Enter **Sleep Hours** per day (0-24)
4. **Answer Questions**: Toggle Yes/No for each of the 8 assessment questions
5. **Submit**: Tap "Submit Assessment" to calculate your risk
6. **View Results**: Automatically navigate to Results screen to see your assessment

### Viewing Results

1. **Navigate to Results**: Tap the "Results" tab at the bottom
2. **Review Assessment**: Each result card displays:
   - Timestamp of assessment
   - Risk level (color-coded badge)
   - Demographic information
   - Sleep hours
   - Questionnaire response summary
3. **Track Progress**: Scroll through your assessment history

### Understanding Risk Levels

- **Low Risk**: Green badge - Fewer than 5 positive responses
- **Possible PPD Risk**: Red badge - 5 or more positive responses

> **Note**: This application is a screening tool and does not replace professional medical diagnosis. Always consult with healthcare providers for clinical assessment.

## 🧮 Risk Assessment Algorithm

The risk calculation follows a simple scoring mechanism:

```typescript
function calculateRisk(responses: QuestionnaireResponse): RiskResult {
  const positiveCount = countPositiveResponses(responses);
  
  if (positiveCount >= 5) {
    return 'Possible PPD Risk';
  }
  return 'Low Risk';
}
```

**Threshold**: 5 or more positive responses indicate "Possible PPD Risk"

> The threshold can be adjusted in `QuestionnaireScreen.tsx` based on clinical requirements.

## 📱 Screens

### Loading Screen

- **Purpose**: App initialization and branding
- **Duration**: 2 seconds (configurable)
- **Features**: Animated icon, app title, loading indicator

### Questionnaire Screen

- **Purpose**: Data collection and assessment
- **Components**:
  - Header with app branding
  - Stage selection dropdown
  - Region selection dropdown
  - Sleep hours input
  - 8-question assessment with Yes/No toggles
  - Submit button

### Results Screen

- **Purpose**: Display assessment history
- **Components**:
  - Header with results count
  - Scrollable list of assessment cards
  - Empty state message
  - Color-coded risk indicators
  - Progress visualization

## 📊 Data Models

### AssessmentResult

```typescript
interface AssessmentResult {
  id: string;                      // Unique identifier
  stage: Stage;                     // Pregnancy/postpartum stage
  region: Region;                   // Geographic region
  sleepHours: number;               // Hours of sleep per day
  questionnaireResponses: {         // Question answers
    [questionId: string]: boolean;
  };
  riskResult: RiskResult;            // Calculated risk level
  timestamp: Date;                  // Assessment date/time
}
```

### Type Definitions

- **Stage**: `'First Trimester' | 'Second Trimester' | 'Third Trimester' | 'Postpartum'`
- **Region**: `string` (customizable regions)
- **RiskResult**: `'Possible PPD Risk' | 'Low Risk'`

## 🔧 Development

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Add comments for complex logic

### Adding New Questions

To add questions to the assessment:

1. Update `QUESTIONS` array in `QuestionnaireScreen.tsx`:
```typescript
const QUESTIONS = [
  // ... existing questions
  { id: 'q9', text: 'Your new question text' },
];
```

2. The risk calculation will automatically include the new question.

### Modifying Risk Threshold

Edit the `_calculateRisk` function in `QuestionnaireScreen.tsx`:

```typescript
const _calculateRisk = (responses: QuestionnaireResponse): RiskResult => {
  const trueCount = Object.values(responses).filter(Boolean).length;
  
  // Adjust threshold here (currently 5)
  if (trueCount >= YOUR_THRESHOLD) {
    return 'Possible PPD Risk';
  }
  return 'Low Risk';
};
```

### Customizing Regions

Update the `REGIONS` array in `QuestionnaireScreen.tsx`:

```typescript
const REGIONS: Region[] = ['Your', 'Custom', 'Regions'];
```

## 🏗 Building for Production

### EAS Build (Recommended)

This project uses **EAS Build** for creating production builds. EAS Build is the modern way to build Expo apps.

#### Prerequisites

1. **Login to EAS**:
```bash
cd client
eas login
```

2. **Verify your account**:
```bash
eas whoami
```

#### Build Commands

**Android Preview Build** (for testing and distribution):
```bash
npm run build
# or
eas build --platform android --profile preview
```

**Android Production Build** (for Play Store):
```bash
npm run build:android:production
# or
eas build --platform android --profile production
```

**iOS Build**:
```bash
npm run build:ios
# or
eas build --platform ios --profile preview
```

**Build for All Platforms**:
```bash
npm run build:all
# or
eas build --platform all --profile preview
```

#### Build Profiles

Build profiles are configured in `eas.json`:
- **preview**: Creates APK for direct installation (testing/distribution)
- **production**: Creates AAB for Play Store submission
- **development**: Development client builds

#### Build Output

After the build completes:
- EAS will provide a download link
- APK files can be installed directly on Android devices
- Works on any network (connects to Render backend)

#### Build Optimization

The project includes `.easignore` to reduce build archive size:
- Excludes `node_modules/` (reinstalled during build)
- Excludes `android/build/` artifacts
- Excludes documentation files
- Reduces upload time significantly

> **Note**: The first build may take longer. Subsequent builds are faster due to caching.

### Generate App Icons and Splash Screens

Ensure your assets are properly configured in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png"
    }
  }
}
```

### Environment Configuration

**Production API URL**: Update `PRODUCTION_API_URL` in `src/utils/api.ts` with your Render backend URL:
```typescript
const PRODUCTION_API_URL = 'https://your-backend-name.onrender.com/api';
```

**App Configuration**: Update `app.json` with your app details:
- `name`: Display name
- `slug`: URL-friendly identifier
- `version`: Version number
- `orientation`: Screen orientation preference
- `package`: Android package name (e.g., `com.yourcompany.wellnessapp`)

### Backend Deployment

The backend is deployed on **Render**. See [server/DEPLOY_RENDER.md](../server/DEPLOY_RENDER.md) for deployment instructions.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**: Follow code style and add tests if applicable
4. **Commit your changes**: `git commit -m 'Add some feature'`
5. **Push to the branch**: `git push origin feature/your-feature-name`
6. **Open a Pull Request**: Provide a clear description of changes

### Development Guidelines

- Write clear, self-documenting code
- Add comments for complex logic
- Test on both iOS and Android
- Ensure TypeScript compilation passes
- Follow existing code patterns

## 📄 License

This project is licensed under the 0BSD License - see the LICENSE file for details.

## ⚠️ Disclaimer

**Medical Disclaimer**: This application is intended for screening purposes only and does not provide medical diagnosis, treatment, or professional medical advice. The risk assessment algorithm is based on general screening criteria and may not be appropriate for all individuals. Always consult with qualified healthcare professionals for proper evaluation, diagnosis, and treatment of postpartum depression or any other medical condition.

## 📞 Support

For issues, questions, or contributions:

- Open an issue on the repository
- Contact the development team
- Refer to Expo documentation: https://docs.expo.dev/

## 🔮 Future Enhancements

Potential features for future versions:

- ✅ Data persistence with AsyncStorage and cloud storage (Implemented)
- ✅ User accounts and authentication (Implemented)
- ✅ Offline support with auto-sync (Implemented)
- Export assessment results
- Reminder notifications
- Multi-language support
- Advanced analytics and trends
- Integration with healthcare systems
- Customizable questionnaires
- Push notifications
- Data export (PDF/CSV)

## 🔍 Troubleshooting

### Build Issues

**"Entity not authorized" error:**
- Make sure you're logged in with the correct Expo account: `eas whoami`
- If project ID belongs to different account, remove it from `app.json` and let EAS create a new one

**Large build archive (380 MB):**
- Ensure `.easignore` file exists and excludes `node_modules/` and `android/build/`
- Archive should be ~10-50 MB after optimization

**Expo doctor warnings:**
- Run `npx expo doctor` to check for issues
- Install missing dependencies: `npx expo install <package>`

### Network Issues

**App can't connect to backend:**
- Check `PRODUCTION_API_URL` in `src/utils/api.ts`
- Verify Render backend is running: `https://your-backend.onrender.com/api/health`
- For development, ensure correct IP address in `LOCAL_IP_ADDRESS`

**Offline submissions not syncing:**
- App automatically syncs when connection is restored
- Check network status in app sync banner

### Development Issues

**Metro bundler errors:**
- Clear cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**TypeScript errors:**
- Run `npx tsc --noEmit` to check for type errors
- Ensure all dependencies are installed

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained by**: Development Team  
**Backend**: Deployed on Render  
**Build System**: EAS Build

