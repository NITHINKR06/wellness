# Deploying Backend to Render

This guide will help you deploy your Wellness Backend API to Render.

## Prerequisites

1. **MongoDB Atlas Account** (Free tier works fine)
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string

2. **Render Account**
   - Sign up at [Render](https://render.com) (Free tier available)

## Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. **Create Database User** (if not already created):
   - Go to **Database Access** → **Add New Database User**
   - Choose **Password** authentication
   - Create username and password (save these!)
   - Set privileges to **Read and write to any database**

3. **Whitelist IP Addresses**:
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0) for Render
   - Or add Render's IP ranges (check Render docs)

4. **Get Connection String**:
   - Go to **Database** → Click **Connect** on your cluster
   - Choose **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `wellness_db` (or your database name)
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wellness_db?retryWrites=true&w=majority`

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create New Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select the repository and branch

3. **Configure the Service**:
   - **Name**: `wellness-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server` (if your server folder is in a subdirectory)

4. **Set Environment Variables**:
   Click **Environment** tab and add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render sets this automatically, but you can specify)
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = A random secret string (generate one: `openssl rand -base64 32`)

5. **Deploy**:
   - Click **Create Web Service**
   - Render will build and deploy your app
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Get Your Backend URL**:
   - Once deployed, Render will provide a URL like: `https://wellness-backend.onrender.com`
   - Your API will be available at: `https://wellness-backend.onrender.com/api`

### Option B: Using render.yaml (Alternative)

If you prefer using the `render.yaml` file:

1. The `render.yaml` file is already created in the `server` folder
2. In Render Dashboard, go to **New +** → **Blueprint**
3. Connect your repository
4. Render will automatically detect and use `render.yaml`
5. Still need to set `MONGO_URI` and `JWT_SECRET` in the dashboard

## Step 3: Update Frontend

1. **Update Production API URL** in `client/src/utils/api.ts`:
   ```typescript
   const PRODUCTION_API_URL = 'https://your-backend-name.onrender.com/api';
   ```
   Replace `your-backend-name` with your actual Render service name.

2. **Rebuild your app**:
   ```bash
   cd client
   eas build --platform android --profile preview
   ```

## Step 4: Test Your Deployment

1. **Test Health Endpoint**:
   Open in browser: `https://your-backend-name.onrender.com/api/health`
   Should return: `{"ok":true,"ts":"..."}`

2. **Test from Mobile App**:
   - Install the rebuilt APK
   - Try signing up/logging in
   - Submit a questionnaire

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `package.json` has correct `start` script
- Verify all dependencies are listed in `package.json`

### MongoDB Connection Error
- Verify `MONGO_URI` is set correctly in Render environment variables
- Check MongoDB Atlas Network Access allows Render IPs
- Ensure database user has correct permissions

### App Can't Connect to Backend
- Verify the Render URL is correct in `client/src/utils/api.ts`
- Check Render service is running (not sleeping)
- Free tier services sleep after 15 minutes of inactivity (first request may be slow)

### CORS Errors
- The backend already has CORS enabled (`app.use(cors())`)
- If issues persist, check Render logs

## Render Free Tier Limitations

- **Sleeps after 15 minutes** of inactivity (wakes up on first request, may take 30-60 seconds)
- **512 MB RAM**
- **0.1 CPU share**

For production, consider upgrading to a paid plan for:
- Always-on service (no sleep)
- More resources
- Better performance

## Next Steps

1. ✅ Backend deployed to Render
2. ✅ Frontend updated with Render URL
3. ✅ App rebuilt with new API URL
4. 🎉 Your app should now work from anywhere!

