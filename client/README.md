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
- **Expo** (v54.0.23): Development platform and toolchain
- **TypeScript** (v5.9.2): Type-safe JavaScript
- **React** (v19.1.0): UI library

### Key Libraries

- **@expo/vector-icons**: Professional icon library (Ionicons)
- **expo-status-bar**: Status bar management

### Development Tools

- **Expo CLI**: Development server and build tools
- **TypeScript Compiler**: Type checking and compilation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** package manager
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **Expo Go** app on your mobile device (for testing) OR
- **iOS Simulator** (for macOS) OR
- **Android Emulator** (for Android development)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd wellness-app
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### Step 3: Verify Installation

Ensure all dependencies are installed correctly:
```bash
npm list
```

## 🏃 Getting Started

### Backend Connection

The app connects to a backend API for data persistence. See the main [README.md](../README.md) for backend setup.

**Configure API URL** in `src/utils/api.ts`:
- **Android Emulator**: Set `USE_EMULATOR = true`
- **Physical Device**: Set `USE_EMULATOR = false` and update `LOCAL_IP_ADDRESS` with your computer's IP

### Development Mode

Start the Expo development server:

```bash
npm start
# or
yarn start
```

This will:
- Start the Metro bundler
- Display a QR code in the terminal
- Open Expo DevTools in your browser

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
wellness-app/
├── src/
│   ├── models/
│   │   └── result.ts              # TypeScript data models
│   ├── screens/
│   │   ├── LoadingScreen.tsx       # App initialization screen
│   │   ├── QuestionnaireScreen.tsx # Main questionnaire interface
│   │   └── ResultsScreen.tsx      # Assessment results display
│   └── utils/                      # Utility functions (if any)
├── assets/                          # Images and static assets
├── App.tsx                         # Main application component
├── index.ts                        # Application entry point
├── app.json                        # Expo configuration
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

### Create a Standalone Build

#### Android

```bash
expo build:android
```

#### iOS

```bash
expo build:ios
```

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

Update `app.json` with your app details:

- `name`: Display name
- `slug`: URL-friendly identifier
- `version`: Version number
- `orientation`: Screen orientation preference

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

- Data persistence with AsyncStorage or cloud storage
- Export assessment results
- Reminder notifications
- Multi-language support
- Advanced analytics and trends
- Integration with healthcare systems
- User accounts and profiles
- Customizable questionnaires

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Maintained by**: Development Team

