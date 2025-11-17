# Postpartum Depression Risk App – Working Flow (PPT Style)

## 1. Purpose
- Rapid screening tool for pregnant/postpartum women to flag PPD risk.
- Clinicians get structured history, patients get instant guidance and resources.

## 2. Architecture at a Glance
- **App**: React Native (Expo) with AuthContext + offline queue.
- **API**: Node/Express with JWT auth and validation middleware.
- **Data**: MongoDB `Response` documents storing raw answers, derived metrics, and audit history.
- **Risk Engine**: `weighted-v1` model inside `server/utils/riskModel.js`.

```
User → Expo questionnaire → submitQuestionnaire()
      → Express API → riskModel → MongoDB → results back to UI
```

## 3. User Journey
1. Sign in / register → JWT cached client-side.
2. Fill demographics + 9 yes/no questions.
3. Submit → loader while API validates + scores.
4. Results screen shows badge, score, factors, and quick links to detail/history/resources.

## 4. Authentication & Data Handling
- Frontend sends `Authorization: Bearer <token>` on every protected call.
- `authMiddleware` verifies token, attaches `req.userId`, blocks invalid tokens.
- `express-validator` guards payload shape before business logic.
- Saved `Response` includes demographics, normalized answers, risk breakdown, soft-delete flag, timestamps.

## 5. Risk Logic Essentials
- Inputs: q1–q9 booleans (q8 weighs 2, q9 only counts when false).
- Threshold: score ≥ 5 → “Possible PPD Risk”; otherwise “Low Risk”.
- Outputs feed UI gauges plus `/questionnaire/stats` aggregates.

## 6. Reliability & Security
- Offline queue via AsyncStorage + `flushOfflineQueue()` replay.
- Timeouts + network checks prevent hanging requests.
- MongoDB is the single source of truth; no local PHI persistence.
- Soft delete keeps history while hiding removed entries.

## 7. 30-Second Pitch
“User authenticates, completes a 9-question survey, and the backend runs a weighted risk model before persisting the record in MongoDB. The app instantly surfaces the risk badge, history, and resources, while offline queuing and JWT enforcement keep the workflow resilient and secure.”

