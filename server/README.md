# Wellness Backend API

Backend API server for the Wellness Questionnaire application.

## Features

- RESTful API endpoints for questionnaire submissions
- MongoDB database integration
- Input validation using express-validator
- CORS enabled for frontend integration
- Request logging with Morgan

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote instance)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/wellness_db
```

   Or use MongoDB Atlas (cloud):
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/wellness_db?retryWrites=true&w=majority
   ```

## MongoDB Setup

### Option 1: Local MongoDB

1. **Install MongoDB**: Download from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. **Start MongoDB Service**:
   - Windows: Open Services (`services.msc`) → Start MongoDB service
   - Or run: `mongod --dbpath "C:\data\db"`
3. **Verify**: Check that MongoDB is running on port 27017

### Option 2: MongoDB Atlas (Recommended for Quick Start)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `.env` with the connection string

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 4000 (or the port specified in `.env`).

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns server health status

### Questionnaire Routes

#### Submit Questionnaire Response
- **POST** `/api/questionnaire`
  - Submit a new questionnaire response
  - **Request Body:**
    ```json
    {
      "stage": "First Trimester",
      "region": "North",
      "sleepHours": 8,
      "appetite": true,
      "mood": false,
      "support": true,
      "history": false
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "_id": "...",
        "stage": "First Trimester",
        "region": "North",
        "sleepHours": 8,
        "appetite": true,
        "mood": false,
        "support": true,
        "history": false,
        "resultLabel": "Low Risk",
        "score": 2,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
    ```

#### Get All Responses
- **GET** `/api/questionnaire`
  - Retrieve all questionnaire responses (sorted by creation date, newest first)
  - **Response:**
    ```json
    {
      "success": true,
      "count": 10,
      "data": [...]
    }
    ```

#### Get Single Response
- **GET** `/api/questionnaire/:id`
  - Retrieve a specific questionnaire response by ID

## Data Model

### Response Schema
- `stage` (String, required): Pregnancy/postpartum stage
- `region` (String, required): Geographic region
- `sleepHours` (Number, required): Hours of sleep per day
- `appetite` (Boolean, required): Appetite changes indicator
- `mood` (Boolean, required): Mood changes indicator
- `support` (Boolean, required): Adequate support indicator (true = adequate)
- `history` (Boolean, required): History indicator
- `resultLabel` (String, required): Risk assessment result ("Low Risk" or "Possible PPD Risk")
- `score` (Number, required): Count of positive responses
- `createdAt` (Date): Timestamp of creation

## Risk Calculation

The risk is calculated based on the number of positive responses:
- **Low Risk**:** 0-1 positive responses
- **Possible PPD Risk**:** 2 or more positive responses

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

## Frontend Connection

The frontend app connects to this backend API. Configure the API URL in the frontend:

1. **For Android Emulator**: Use `http://10.0.2.2:4000/api`
2. **For Physical Device**: Use `http://YOUR_COMPUTER_IP:4000/api`
3. **For iOS Simulator**: Use `http://localhost:4000/api`

Find your computer's IP:
- Windows: `ipconfig` (look for IPv4 Address under Wi-Fi)
- Mac/Linux: `ifconfig` (look for inet under en0 or wlan0)

## Troubleshooting

### MongoDB Connection Error

- **Error**: "MongoDB connection error" or "MONGO_URI is undefined"
- **Solution**: 
  - Ensure `.env` file exists with `MONGO_URI` set
  - Verify MongoDB is running (local) or connection string is correct (Atlas)
  - Check firewall isn't blocking port 27017

### MongoDB Atlas Authentication Failed (Error Code 8000)

- **Error**: "bad auth : Authentication failed" or "AtlasError"
- **Common Causes**:
  1. **Wrong username/password**: Check your MongoDB Atlas credentials
  2. **IP not whitelisted**: Add your IP address in MongoDB Atlas → Network Access
  3. **User doesn't exist**: Create a database user in MongoDB Atlas → Database Access
  4. **Incorrect connection string format**

- **Solution Steps**:
  1. **Verify Connection String Format**:
     ```
     mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
     ```
     - Replace `<username>` with your MongoDB Atlas username
     - Replace `<password>` with your MongoDB Atlas password (URL-encode special characters)
     - Replace `<cluster>` with your cluster name (e.g., `cluster0.xxxxx`)
     - Replace `<database>` with your database name (e.g., `wellness_db`)

  2. **Check MongoDB Atlas Settings**:
     - Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
     - **Database Access**: Ensure your user exists and has read/write permissions
     - **Network Access**: Add your current IP address (or `0.0.0.0/0` for all IPs - less secure)
     - **Clusters**: Verify your cluster is running and get the correct connection string

  3. **URL-encode Special Characters in Password**:
     - If your password contains special characters like `@`, `#`, `%`, etc., URL-encode them
     - Example: `@` becomes `%40`, `#` becomes `%23`

  4. **Test Connection String**:
     - Copy the connection string directly from MongoDB Atlas (click "Connect" → "Connect your application")
     - Make sure you select the correct database name

  5. **Alternative: Use Local MongoDB**:
     - If Atlas continues to fail, switch to local MongoDB:
     ```env
     MONGO_URI=mongodb://localhost:27017/wellness_db
     ```

### Port Already in Use

- **Error**: "Port 4000 already in use"
- **Solution**: Change `PORT` in `.env` file or stop the process using port 4000

### Frontend Can't Connect

- **Error**: "Request timeout" in frontend
- **Solution**:
  - Verify backend is running (`npm run dev`)
  - Check API URL in frontend matches your setup
  - Ensure firewall allows port 4000
  - For physical devices, ensure phone and computer are on same WiFi network

