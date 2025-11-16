# MongoDB Setup Guide

## Current Issue
MongoDB is installed but not running. The backend needs MongoDB to store questionnaire responses.

## Solution Options

### Option 1: Start MongoDB Service (Recommended)

#### Windows Service Method:
1. Open **Services** (Press `Win + R`, type `services.msc`, press Enter)
2. Find **MongoDB** service
3. Right-click → **Start**
4. Set it to **Automatic** startup (Right-click → Properties → Startup type: Automatic)

#### Command Line Method:
```powershell
# Run as Administrator
Start-Service MongoDB
```

#### Manual Start Method:
If MongoDB is installed but not as a service:
```powershell
# Navigate to MongoDB bin directory (usually)
cd "C:\Program Files\MongoDB\Server\<version>\bin"

# Start MongoDB
.\mongod.exe --dbpath "C:\data\db"
```

**Note**: Make sure the data directory exists: `C:\data\db`

### Option 2: Use MongoDB Atlas (Cloud - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a free cluster
4. Get your connection string
5. Update `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/wellness_db?retryWrites=true&w=majority
   ```

### Option 3: Install MongoDB (If Not Installed)

1. Download MongoDB Community Server from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. MongoDB Compass (GUI) is optional but helpful

### Verify MongoDB is Running

After starting MongoDB, verify it's running:

```powershell
# Check if port 27017 is listening
netstat -an | findstr 27017

# Or test connection
Test-NetConnection -ComputerName localhost -Port 27017
```

### Restart Backend

Once MongoDB is running, restart your backend server:
```bash
# In wellness-backend directory
npm run dev
```

You should see: `Connected to MongoDB` and `Server running on port 4000`

## Troubleshooting

### "Port 27017 already in use"
- Another MongoDB instance might be running
- Check Task Manager for `mongod.exe` processes
- Or change MongoDB port in MongoDB config

### "Cannot create data directory"
- Create the directory manually: `C:\data\db`
- Or specify a different path: `mongod --dbpath "E:\mongodb-data"`

### Still having issues?
- Check MongoDB logs (usually in `C:\Program Files\MongoDB\Server\<version>\log\`)
- Verify MongoDB installation path
- Try MongoDB Atlas (cloud) as an alternative

