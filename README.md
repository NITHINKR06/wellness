# Postpartum Depression (PPD) Risk Assessment Application

A comprehensive full-stack mobile application designed to help pregnant and postpartum women assess their risk of Postpartum Depression (PPD) through a structured questionnaire. The application provides early detection capabilities, tracks assessment history, and offers resources for mental health support.

## 🎯 What This Project Does

This application is a **screening tool** that helps identify potential risk factors for Postpartum Depression. It enables users to:

- **Complete a 9-question assessment** covering key PPD indicators (mood, sleep, appetite, support, and self-harm thoughts)
- **Receive automated risk assessment** based on their responses
- **Track assessment history** over time for longitudinal monitoring
- **Access mental health resources** and support information
- **Share results with healthcare providers** for professional evaluation

### Target Users

- **Pregnant Women** (First, Second, or Third Trimester)
- **Postpartum Women** (recently gave birth)
- **Healthcare Professionals** (who may use it with their patients)

## 🧮 How Risk Assessment Works

The application uses a **threshold-based scoring system** that evaluates 4 key risk factors:

### Risk Factors Evaluated

1. **Appetite Changes** (Q4): Changes in eating patterns
2. **Mood Symptoms** (Q1-Q3, Q5-Q7): Any of the following:
   - Feeling sad, anxious, or empty
   - Lost interest in activities
   - Sleeping too much or too little
   - Feeling irritable or angry
   - Difficulty concentrating or making decisions
   - Feeling guilty or worthless
3. **Lack of Support** (Q9): Inadequate support from family/partner (only counts if answered "No")
4. **History of Self-Harm Thoughts** (Q8): Thoughts of harming self or baby

### Risk Calculation Logic

- **Count** how many of the 4 risk factors are present
- **If 2 or more risk factors** → **"Possible PPD Risk"**
- **If fewer than 2 risk factors** → **"Low Risk"**

### Important Notes

- **Sleep hours** are collected for tracking but **not used** in risk calculation
- **Stage and region** are collected for demographic purposes but **not used** in risk calculation
- **Support question (Q9)** only counts as a risk factor if answered "No" (lack of support)

> ⚠️ **Medical Disclaimer**: This is a screening tool only and does not replace professional medical diagnosis. Always consult healthcare providers for proper evaluation and treatment.

## 📋 Project Structure

```
department/
├── client/          # React Native frontend (Expo)
├── server/          # Node.js/Express backend API
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Expo CLI (for mobile development)

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env  # Edit .env with your MongoDB URI
npm run dev
```

See [server/README.md](./server/README.md) for detailed backend setup.

### 2. Frontend Setup

```bash
cd client
npm install
npm start
```

See [client/README.md](./client/README.md) for detailed frontend setup.

### 3. Connect Frontend to Backend

1. **For Android Emulator**: Set `USE_EMULATOR = true` in `client/src/utils/api.ts`
2. **For Physical Device**: Set `USE_EMULATOR = false` and update `LOCAL_IP_ADDRESS` with your computer's IP

## 📱 Features

### Core Functionality

- ✅ **9-Question Assessment**: Comprehensive questionnaire covering PPD risk indicators
- ✅ **Automated Risk Calculation**: Real-time risk assessment based on responses
- ✅ **Assessment History**: Track all previous assessments with timestamps
- ✅ **Detailed Results View**: View complete assessment details including all responses
- ✅ **Resources Screen**: Access mental health resources and support information
- ✅ **MongoDB Storage**: All data securely stored in MongoDB (single source of truth)
- ✅ **Real-time Sync**: Results automatically fetched from MongoDB on app startup

### User Experience

- 🎨 **Modern UI Design**: Clean, professional interface with intuitive navigation
- 📱 **Cross-Platform**: Works on both iOS and Android devices
- 🔄 **Smooth Animations**: Polished loading screens and transitions
- 🎯 **Color-Coded Indicators**: Visual risk badges for quick identification
- 📊 **Progress Tracking**: Visual progress bars showing response patterns

## 🛠 Technology Stack

### Frontend
- React Native (Expo)
- TypeScript
- React Hooks

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- CORS enabled

## 📚 Documentation

- [Frontend Documentation](./client/README.md)
- [Backend Documentation](./server/README.md)

## 🔧 Development

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### API Endpoints

- `POST /api/questionnaire` - Submit new assessment
- `GET /api/questionnaire` - Get all assessments
- `GET /api/questionnaire/:id` - Get specific assessment
- `GET /api/questionnaire/stats` - Get aggregate statistics
- `DELETE /api/questionnaire/:id` - Soft delete assessment

See [server/README.md](./server/README.md) for complete API documentation.

## 📖 Usage Guide

### For End Users

1. **Launch the App**: Open the app and wait for initialization
2. **Start Assessment**: Tap "Start Now" or navigate to Questionnaire
3. **Fill Required Information**:
   - Select your **Stage** (Trimester or Postpartum)
   - Select your **Region**
   - Enter **Sleep Hours** per day
4. **Answer Questions**: Respond Yes/No to all 9 questions
5. **Submit**: Tap "Submit Assessment" to calculate your risk
6. **View Results**: Automatically redirected to Results screen
7. **Track History**: View all previous assessments in chronological order
8. **Access Resources**: Navigate to Resources screen for support information

### For Healthcare Professionals

- Use the app with patients during prenatal and postpartum visits
- Track patient assessments over time
- Export or share results for clinical documentation
- Use as a screening tool to identify patients who may need further evaluation

## 📊 Data Storage

### Important Notes

- **MongoDB Only**: All questionnaire responses are stored exclusively in MongoDB
- **No Local Storage**: The app does NOT use AsyncStorage or localStorage
- **Single Source of Truth**: MongoDB is the only place where data is persisted
- **Network Required**: Assessments cannot be saved if MongoDB connection is unavailable
- **Automatic Sync**: Results are automatically fetched from MongoDB when the app starts

### Data Model

Each assessment stores:
- Demographic information (stage, region, sleep hours)
- All 9 questionnaire responses
- Calculated risk level ("Low Risk" or "Possible PPD Risk")
- Risk score (count of positive risk factors)
- Timestamp of assessment

## ⚠️ Medical Disclaimer

**This application is intended for screening purposes only and does not provide medical diagnosis, treatment, or professional medical advice.**

The risk assessment algorithm is based on general screening criteria and may not be appropriate for all individuals. Always consult with qualified healthcare professionals for proper evaluation, diagnosis, and treatment of postpartum depression or any other medical condition.

## 📄 License

0BSD License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes following existing code style
4. Test on both iOS and Android
5. Submit a pull request with clear description

## 📞 Support

For issues, questions, or contributions:
- Open an issue on the repository
- Contact the development team
- Refer to Expo documentation: https://docs.expo.dev/

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Maintained by**: Development Team

