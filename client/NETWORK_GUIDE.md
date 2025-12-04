# Network Configuration Guide

## How Different IP Addresses Work

### Scenario 1: Android Emulator (`10.0.2.2:4000`)

```
┌─────────────────────────────────────────┐
│  Your Computer (Host Machine)           │
│  ┌──────────────────────────────────┐  │
│  │  Backend Server                  │  │
│  │  Running on: localhost:4000      │  │
│  │  (127.0.0.1:4000)                │  │
│  └──────────────────────────────────┘  │
│           ↕ Virtual Network Bridge      │
│  ┌──────────────────────────────────┐  │
│  │  Android Emulator                │  │
│  │  Virtual IP: 10.0.2.2            │  │
│  │  (This points to host's localhost)│  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**How it works:**
- Android Emulator runs in a **virtual network**
- `10.0.2.2` is a **special IP** that Android emulators use to access the host machine
- When emulator requests `http://10.0.2.2:4000`, it automatically routes to your computer's `localhost:4000`
- **No WiFi needed** - works offline, emulator and computer are on same machine

**When to use:**
- Testing on Android Studio Emulator
- Set `USE_EMULATOR = true`

---

### Scenario 2: Physical Android Device (`192.168.0.109:4000`)

```
┌─────────────────────────────────────────┐
│  Your Computer                         │
│  IP: 192.168.0.109 (on WiFi network)   │
│  ┌──────────────────────────────────┐  │
│  │  Backend Server                  │  │
│  │  Running on: 0.0.0.0:4000        │  │
│  │  (Listens on all network interfaces)│
│  └──────────────────────────────────┘  │
│           ↕ Same WiFi Network           │
│  ┌──────────────────────────────────┐  │
│  │  Your Phone (Physical Device)     │  │
│  │  IP: 192.168.0.xxx (on same WiFi) │  │
│  │  Connects to: 192.168.0.109:4000  │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**How it works:**
- Your computer and phone are on the **same WiFi network**
- `192.168.0.109` is your computer's **local IP address** on that network
- Phone connects to your computer over WiFi
- **WiFi required** - both devices must be on same network

**When to use:**
- Testing on real Android phone/tablet
- Set `USE_EMULATOR = false`
- Update `LOCAL_IP_ADDRESS` with your computer's current IP

---

### Scenario 3: iOS Simulator (`localhost:4000`)

```
┌─────────────────────────────────────────┐
│  Your Mac (macOS only)                 │
│  ┌──────────────────────────────────┐  │
│  │  Backend Server                  │  │
│  │  localhost:4000                   │  │
│  └──────────────────────────────────┘  │
│           ↕ Direct Access               │
│  ┌──────────────────────────────────┐  │
│  │  iOS Simulator                    │  │
│  │  Uses: localhost (same as host)   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**How it works:**
- iOS Simulator shares the same network stack as your Mac
- `localhost` works directly - no special IP needed
- **No WiFi needed** - simulator runs on same machine

---

## How to Find Your Computer's IP Address

### Windows:
```bash
ipconfig
```
Look for **IPv4 Address** under your WiFi adapter:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.0.109
```

### Mac/Linux:
```bash
ifconfig
```
Look for **inet** under `en0` (Ethernet) or `en1` (WiFi):
```
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	inet 192.168.0.109 netmask 0xffffff00 broadcast 192.168.0.255
```

### Quick Method (Windows PowerShell):
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*"}).IPAddress
```

---

## Current Configuration in Your Code

```typescript
const USE_EMULATOR = false;  // Set to true for emulator, false for physical device
const LOCAL_IP_ADDRESS = '192.168.0.109';  // Your computer's IP on WiFi

// Android Emulator → http://10.0.2.2:4000/api
// Physical Device → http://192.168.0.109:4000/api
// iOS Simulator → http://localhost:4000/api
```

---

## Troubleshooting

### ❌ Physical Device Can't Connect

**Problem:** Phone can't reach `192.168.0.109:4000`

**Solutions:**
1. ✅ Check both devices are on **same WiFi network**
2. ✅ Verify your computer's IP hasn't changed (run `ipconfig` again)
3. ✅ Make sure backend server is running: `npm run dev` in `server` folder
4. ✅ Check Windows Firewall isn't blocking port 4000
5. ✅ Verify server listens on `0.0.0.0` (not just `localhost`) - your `server.js` already does this ✅

### ❌ Emulator Can't Connect

**Problem:** Emulator can't reach `10.0.2.2:4000`

**Solutions:**
1. ✅ Make sure `USE_EMULATOR = true`
2. ✅ Verify backend server is running
3. ✅ Try restarting the emulator
4. ✅ Check if port 4000 is available

### ❌ IP Address Changed

**Problem:** Your computer's IP changed (common with WiFi)

**Solution:**
- Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Update `LOCAL_IP_ADDRESS` in `api.ts` with new IP
- Or use a static IP on your router

---

## Summary Table

| Device Type | IP Address | When to Use | WiFi Needed? |
|------------|------------|-------------|--------------|
| Android Emulator | `10.0.2.2:4000` | Testing on emulator | ❌ No |
| Physical Android | `192.168.0.109:4000` | Testing on real phone | ✅ Yes |
| iOS Simulator | `localhost:4000` | Testing on iOS simulator | ❌ No |
| Production | `https://your-backend.onrender.com/api` | Deployed app | ✅ Yes (internet) |

---

## Quick Reference

**For Emulator Testing:**
```typescript
const USE_EMULATOR = true;
// Uses: http://10.0.2.2:4000/api
```

**For Physical Device Testing:**
```typescript
const USE_EMULATOR = false;
const LOCAL_IP_ADDRESS = '192.168.0.109'; // Update with your IP
// Uses: http://192.168.0.109:4000/api
```

**For Production:**
```typescript
// Uses: https://your-backend-name.onrender.com/api
```

