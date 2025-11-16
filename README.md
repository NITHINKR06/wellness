# Wellness Questionnaire Application

A full-stack mobile application for Postpartum Depression (PPD) risk assessment with React Native frontend and Node.js/Express backend.

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

- **Questionnaire Interface**: 8-question PPD risk assessment
- **Risk Calculation**: Automated risk assessment based on responses
- **Results History**: View and track all previous assessments
- **Backend Integration**: Persistent storage with MongoDB
- **Offline Support**: Works offline with local state fallback

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

## 📝 Notes

- The app works offline and falls back to local state if backend is unavailable
- All submissions are saved to both backend and local state for redundancy
- Results are automatically fetched from backend on app startup

## 📄 License

0BSD

