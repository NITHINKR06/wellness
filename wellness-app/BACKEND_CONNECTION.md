# Backend Connection Guide

The frontend and backend are now connected! Here's what was implemented and how to use it.

## What Was Done

1. **Created API Service** (`src/utils/api.ts`)
   - Handles all backend communication
   - Maps frontend data format to backend format
   - Provides functions: `submitQuestionnaire()`, `fetchAllResponses()`, `checkBackendHealth()`

2. **Updated App.tsx**
   - Fetches all results from backend on app startup
   - Submits questionnaire responses to backend
   - Handles errors gracefully with fallback to local state

3. **Updated QuestionnaireScreen**
   - Shows loading state during submission
   - Disables submit button while submitting

## Data Mapping

The frontend has 8 questions (q1-q8), but the backend expects 4 specific fields:
- **appetite**: Maps from q4 (changes in appetite)
- **mood**: Maps from q1, q2, q5, q6, or q7 (any mood-related question)
- **support**: Defaults to `true` (adequate support)
- **history**: Maps from q8 (thoughts of harming)

## Setup Instructions

### 1. Start the Backend Server

```bash
cd wellness-backend
npm install
# Create .env file with:
# PORT=4000
# MONGO_URI=mongodb://localhost:27017/wellness_db
npm run dev
```

### 2. Configure API URL for Your Device

The API URL is automatically configured based on your platform:
- **Android Emulator**: Uses `http://10.0.2.2:4000/api`
- **iOS Simulator**: Uses `http://localhost:4000/api`
- **Physical Device**: You need to update the IP address

#### For Physical Devices:

1. Find your computer's local IP address:
   - **Windows**: Run `ipconfig` and look for IPv4 Address
   - **Mac/Linux**: Run `ifconfig` and look for inet address

2. Update `src/utils/api.ts`:
   ```typescript
   const getApiBaseUrl = () => {
     if (__DEV__) {
       if (Platform.OS === 'android') {
         return 'http://YOUR_IP_ADDRESS:4000/api'; // e.g., http://192.168.1.100:4000/api
       } else {
         return 'http://YOUR_IP_ADDRESS:4000/api'; // e.g., http://192.168.1.100:4000/api
       }
     }
     return 'https://your-production-api.com/api';
   };
   ```

3. Make sure your phone and computer are on the same WiFi network

### 3. Start the Frontend

```bash
cd wellness-app
npm start
# or
yarn start
```

## Testing the Connection

1. **Check Backend Health**: The app will automatically try to fetch results on startup
2. **Submit a Questionnaire**: Fill out the form and submit - it will save to the backend
3. **View Results**: Navigate to Results tab to see all submissions from the backend

## Troubleshooting

### "Failed to fetch" or Network Errors

1. **Check if backend is running**: Visit `http://localhost:4000/api/health` in your browser
2. **Check IP address**: Make sure you're using the correct IP for physical devices
3. **Check firewall**: Ensure port 4000 is not blocked
4. **Check MongoDB**: Make sure MongoDB is running

### Data Not Appearing

1. Check browser console or React Native debugger for errors
2. Verify backend is receiving requests (check backend console logs)
3. Check MongoDB connection in backend logs

## API Endpoints Used

- `GET /api/questionnaire` - Fetch all responses
- `POST /api/questionnaire` - Submit new response
- `GET /api/health` - Health check (not used in app, but useful for testing)

## Notes

- The app will continue to work even if the backend is unavailable (falls back to local state)
- All submissions are saved to both backend and local state for redundancy
- Results are fetched from backend on app startup

