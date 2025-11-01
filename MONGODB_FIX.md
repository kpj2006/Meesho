# MongoDB Connection Issue - Fix Guide

## 🚨 Error Explained

**Error:** `querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net`

This is a **DNS resolution error**, meaning your computer can't find the MongoDB Atlas cluster.

## 🔍 Common Causes

1. **Cluster is paused** in MongoDB Atlas
2. **Internet connectivity** issue
3. **DNS resolution** problem
4. **Firewall/Network** blocking connection
5. **IP address not whitelisted** in MongoDB Atlas

## ✅ Solutions

### Solution 1: Check MongoDB Atlas Cluster Status

1. **Go to MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com/
   - Login to your account

2. **Check Cluster:**
   - Go to "Clusters" tab
   - Look for `cluster0`
   - **If paused:** Click "Resume" or "Start"
   - Wait for cluster to start (1-2 minutes)

3. **Verify Connection String:**
   - Click "Connect" on cluster
   - Select "Connect your application"
   - Copy the connection string
   - Should look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### Solution 2: Check IP Whitelist

1. **In MongoDB Atlas:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For testing: Add `0.0.0.0/0` (allows all IPs)
   - Or add your specific IP address
   - Click "Confirm"

2. **Wait 1-2 minutes** for changes to apply

### Solution 3: Verify Connection String

**Check your .env file:**

Current format should be:
```
MONGODB_URI=mongodb+srv://ankit_gdg:ankitgiri@cluster0.ju8onzt.mongodb.net/prodsync?appName=Cluster0
```

**Format breakdown:**
- `mongodb+srv://` - Protocol
- `ankit_gdg:ankitgiri@` - Username:Password
- `cluster0.ju8onzt.mongodb.net` - Cluster host
- `/prodsync` - Database name
- `?appName=Cluster0` - App name (optional)

**To fix:**
1. Make sure password is correct (URL encoded if needed)
2. Replace special characters in password:
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`
   - etc.

### Solution 4: Test Connection Locally

**Option A: Use Local MongoDB**

1. **Install MongoDB locally:**
   ```bash
   # Download from: https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB:**
   ```bash
   # Windows: MongoDB service should auto-start
   # Or run: net start MongoDB
   ```

3. **Update .env:**
   ```
   MONGODB_URI=mongodb://localhost:27017/prodsync
   ```

**Option B: Use MongoDB Compass (GUI)**

1. **Download:** https://www.mongodb.com/try/download/compass
2. **Connect** using same connection string
3. **Verify** connection works

## 🔧 Quick Fix Steps

1. ✅ **Check MongoDB Atlas** - Ensure cluster is running
2. ✅ **Check IP Whitelist** - Add 0.0.0.0/0 for testing
3. ✅ **Verify .env file** - Check MONGODB_URI format
4. ✅ **Restart backend** - Changes take effect
5. ✅ **Check internet** - Ensure stable connection

## 📝 Connection String Format

**Atlas (Cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Local:**
```
mongodb://localhost:27017/database
```

**With Authentication:**
```
mongodb://username:password@localhost:27017/database
```

## ✅ After Fixing

**You should see:**
```
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
```

**If still failing:**
- Check error message (now more helpful!)
- Follow suggested steps
- Try local MongoDB as fallback

## 🆘 Still Having Issues?

1. **Check MongoDB Atlas Status Page:**
   - https://status.mongodb.com/
   - See if there are any outages

2. **Test Connection:**
   - Use MongoDB Compass
   - Or MongoDB Shell (mongosh)
   - Verify connection works outside app

3. **Check Firewall:**
   - Allow outbound connections on port 27017
   - Or use MongoDB Atlas (port 443)

4. **DNS Issues:**
   - Try different DNS servers (8.8.8.8, 1.1.1.1)
   - Or use IP address directly (not recommended)

---

**Better error messages will now guide you!** 🎯

