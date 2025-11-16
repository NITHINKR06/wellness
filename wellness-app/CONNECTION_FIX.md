# Connection Fix Guide

## Issue: Request Timeout Error

If you're seeing "Request timeout" errors, it means the app can't connect to the backend server.

## Quick Fix

### Step 1: Check Your Setup

1. **Are you using Android Emulator or Physical Device?**
   - **Emulator**: Set `USE_EMULATOR = true` in `src/utils/api.ts`
   - **Physical Device**: Set `USE_EMULATOR = false` and update `LOCAL_IP_ADDRESS`

2. **Is the backend running?**
   ```bash
   cd wellness-backend
   npm run dev
   ```
   You should see: "Server running on port 4000"

3. **Is MongoDB running?**
   - Check backend logs for "Connected to MongoDB"
   - If not, see `wellness-backend/MONGODB_SETUP.md`

### Step 2: Configure API URL

Open `wellness-app/src/utils/api.ts` and update:

**For Android Emulator:**
```typescript
const USE_EMULATOR = true;
```

**For Physical Device:**
```typescript
const USE_EMULATOR = false;
const LOCAL_IP_ADDRESS = '192.168.0.108'; // Your computer's IP
```

### Step 3: Find Your IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under "Wi-Fi" or "Ethernet adapter" (not VirtualBox/VMware)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under "en0" or "wlan0"

### Step 4: Test Connection

1. **Test backend from browser:**
   - Open: `http://localhost:4000/api/health`
   - Should return: `{"ok":true,"ts":"..."}`

2. **Test from device:**
   - If using physical device, try: `http://YOUR_IP:4000/api/health` in device browser
   - Make sure phone and computer are on same WiFi network

3. **Check firewall:**
   - Windows Firewall might block port 4000
   - Allow Node.js through firewall if prompted

### Step 5: Restart App

After changing the IP address:
1. Stop the Expo app (press `q` in terminal)
2. Restart: `npm start`
3. Reload the app on your device

## Current Configuration

Based on your system:
- **WiFi IP**: `192.168.0.108` (already set in code)
- **Backend Port**: `4000`
- **API URL**: `http://192.168.0.108:4000/api` (for physical device)

## Still Not Working?

1. **Check backend is accessible:**
   ```bash
   # From another device on same network
   curl http://192.168.0.108:4000/api/health
   ```

2. **Check firewall settings:**
   - Windows: Windows Defender Firewall → Allow an app → Node.js
   - Make sure port 4000 is not blocked

3. **Try different IP:**
   - If `192.168.0.108` doesn't work, try other IPs from `ipconfig`
   - Make sure it's the WiFi/Ethernet adapter, not VirtualBox

4. **Use Android Emulator instead:**
   - Set `USE_EMULATOR = true`
   - Use `10.0.2.2` (works automatically)

## Note

The app will still work even if backend is unavailable - it just won't save/load from the database. You'll see the timeout error in console, but the app will continue with local state.

