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

