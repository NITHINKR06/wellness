# Postpartum Depression Risk App – Working Flow (PPT Style)

## 1. Problem & Mission
- **Goal**: Give pregnant/postpartum women a fast, guided way to screen for PPD risk and surface support resources.
- **Promise**: 5-minute assessment, instant risk badge, longitudinal history for clinicians.

## 2. System Snapshot
- **Client**: React Native (Expo) app with AuthContext for login, questionnaire, history, resources.
- **API**: Node.js/Express (`server/server.js`) with JWT auth, validation, MongoDB persistence.
- **Data Store**: MongoDB `Response` documents per submission; Map fields keep each answer + computed metrics.
- **Risk Engine**: `server/utils/riskModel.js` weighted scorer (`weighted-v1`) with thresholding.

```
User → Expo UI → `submitQuestionnaire()` → `/api/questionnaire`
   ↘ auth/login        ↑JWT          ↘ fetchAllResponses()
                      MongoDB ← Risk model + persistence
```

## 3. End-to-End Flow (Step View)
1. **Sign-In** → User enters credentials on `AuthScreen`; `AuthContext` caches JWT.
2. **Questionnaire** → `QuestionnaireScreen` captures demographics + q1–q9 booleans.
3. **Submit** → `api.submitQuestionnaire()` sends payload, `LoadingScreen` guards UX.
4. **Risk Response** → Backend returns score + label; `ResultsScreen` renders card + CTA to `DetailedResultScreen`.
5. **History/Insights** → `HomeScreen` pulls `fetchAllResponses()`, `ResourcesScreen` surfaces support links.

## 4. Authentication Flow (Frontend + Backend)
- **Frontend**:
  - `AuthScreen` calls `signInUser()` / `registerUser()` (POST `/auth/login|register`).
  - Successful response returns `{ token, user }`; `AuthContext` stores token in memory.
  - `api.ts` attaches `Authorization: Bearer <token>` for every protected request via `buildHeaders()`.
- **Backend**:
  - `router.use(authMiddleware)` on questionnaire routes.
  - `authMiddleware` verifies JWT using `JWT_SECRET`, injects `req.userId`, rejects missing/expired tokens.

## 5. Questionnaire Capture Flow
- **Form Inputs**: Stage (trimester/postpartum), region, numeric sleep hours, 9 yes/no answers.
- **Validation (Client)**: UI ensures every toggle answered before enabling submit.
- **Transport Layer**: `submitQuestionnaire()` builds `{ stage, region, sleepHours, questionnaireResponses }`.
- **Offline Aware**: If NetInfo says offline, submission is queued instead of sent (see section 8).

## 6. Risk Engine Logic (Server)
- **Inputs**: `questionnaireResponses` object `{ q1: boolean, …, q9: boolean }`.
- **Special Cases**:
  - q9 is positive (“Do you have support?”) → risk only when `false`.
  - Sleep hours, stage, region are stored for context but don’t affect score.
- **Outputs**: score, threshold (=5), max (=10), result label, list of triggered factors, breakdown map, `modelVersion`.
- **Usage**: Frontend displays `riskFactors`, `riskBreakdown`, `score/max` gauge; stored data powers statistics.

## 7. Data Persistence & Read Flow
1. **Validation**: `express-validator` enforces required fields + boolean q1–q9 before any logic runs.
2. **Risk Calculation**: `calculateRiskScore()` (weighted-v1) normalizes answers, sums contributions, tags risk factors.
3. **Document Creation**: `Response` schema stores:
   - Demographics (stage, region, sleepHours) + derived booleans (appetite/mood/support/history).
   - `questionnaireResponses` Map (exact answers) and `riskBreakdown` Map.
   - Metadata: score, maxScore, threshold, resultLabel, modelVersion, userId, timestamps.
4. **Read APIs**:
   - `GET /questionnaire` → chronological history (excludes `deleted=true`).
   - `GET /questionnaire/:id` → detailed single record.
   - `GET /questionnaire/stats` → totals, average score/sleep, risk distribution, averages by stage/region.
   - `DELETE /questionnaire/:id` → soft delete by toggling `deleted`.

## 8. Offline & Reliability Story
- **Queued submissions**: `submitQuestionnaire()` detects offline via `NetInfo`; unsent payloads saved in `AsyncStorage`.
- **Replay**: `flushOfflineQueue()` replays when connectivity returns; queue stored under `@wellness/offlineQueue`.
- **Timeouts**: `fetchWithTimeout()` wraps every call; network failures trigger graceful errors.

## 9. Security & Compliance Notes
- JWT-based auth (`/auth/login|register`) protects every questionnaire route (`router.use(authMiddleware)`).
- Validation prevents malformed data; server logs errors but never leaks stack traces to client.
- Data is single-source-of-truth in MongoDB; no PHI stored locally on device.
- Soft delete keeps audit trail while hiding records in UI.

## 10. “Tell Me in 30 Seconds”
- User logs in → fills 9-question form → app posts to `/api/questionnaire`.
- Server validates, runs weighted risk model, stores normalized record + computed stats in MongoDB.
- Client shows immediate badge, breakdown, history pulled live from Mongo.
- Offline queues, JWT auth, and anti-tamper validation keep the workflow resilient and compliant.

