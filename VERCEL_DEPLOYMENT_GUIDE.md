# 🚀 Complete Vercel Deployment Guide

## ✅ What Has Been Done (Automatic Changes)

The following files have been automatically configured for Vercel:

### Backend Files:
- ✅ `backend/vercel.json` - Vercel serverless configuration
- ✅ `backend/api/index.js` - Serverless function entry point
- ✅ `backend/server.js` - Updated to export app for Vercel
- ✅ `backend/config/database.js` - Optimized for serverless (connection caching)

### Frontend Files:
- ✅ `frontend/vercel.json` - Vercel build configuration

---

## 📋 STEP-BY-STEP DEPLOYMENT INSTRUCTIONS

### 🎯 STEP 1: Push Code to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

---

### 🎯 STEP 2: Deploy Backend to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Create New Project (Backend)**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Project Name:** `prodsync-backend` (or any name)

3. **Configure Project Settings:**
   ```
   Framework Preset: Other
   Root Directory: backend
   Build Command: npm install
   Output Directory: (leave empty)
   Install Command: npm install
   ```

4. **Add Environment Variables:**
   
   Go to **Settings → Environment Variables** and add:
   
   | Variable Name | Value | Notes |
   |-------------|-------|-------|
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `your-secret-key-min-32-chars` | Generate a random secret (minimum 32 characters) |
   | `JWT_EXPIRE` | `7d` | Token expiration (7 days) |
   | `GEMINI_API_KEY` | `your-gemini-api-key` | Your Google Gemini API key |
   | `GITHUB_TOKEN` | `your-github-token` | Optional - for GitHub integration |
   | `NODE_ENV` | `production` | Set to production |
   | `VERCEL` | `1` | Tells the app it's running on Vercel |

5. **Deploy!**
   - Click "Deploy"
   - Wait for deployment to complete
   - **Copy the deployment URL** (e.g., `https://prodsync-backend.vercel.app`)

6. **Test Backend:**
   - Visit: `https://your-backend-url.vercel.app/api/health`
   - Should return: `{"success":true,"message":"ProdSync API is running"}`

---

### 🎯 STEP 3: Deploy Frontend to Vercel

1. **Create New Project (Frontend)**
   - Click "Add New..." → "Project"
   - Import the **same** GitHub repository
   - **Project Name:** `prodsync-frontend` (or any name)

2. **Configure Project Settings:**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Add Environment Variables:**
   
   Go to **Settings → Environment Variables** and add:
   
   | Variable Name | Value | Notes |
   |-------------|-------|-------|
   | `REACT_APP_API_URL` | `https://your-backend-url.vercel.app/api` | ⚠️ **MUST include `/api` at the end!** |
   
   **Example:**
   ```
   REACT_APP_API_URL=https://prodsync-backend.vercel.app/api
   ```

4. **Deploy!**
   - Click "Deploy"
   - Wait for deployment to complete
   - **Copy the deployment URL** (e.g., `https://prodsync-frontend.vercel.app`)

---

### 🎯 STEP 4: Verify Deployment

#### Test Backend:
```bash
# Health Check
curl https://your-backend-url.vercel.app/api/health

# Should return:
# {"success":true,"message":"ProdSync API is running"}
```

#### Test Frontend:
1. Visit your frontend URL
2. Try to login/register
3. Check browser console for any errors
4. Verify API calls are going to the correct backend URL

---

## 🔧 TROUBLESHOOTING

### ❌ Backend Returns 404

**Problem:** Routes not found

**Solution:**
1. Check `backend/vercel.json` exists
2. Verify Root Directory is set to `backend` in Vercel
3. Check deployment logs for errors
4. Verify `backend/api/index.js` exists

### ❌ Frontend Can't Connect to Backend

**Problem:** CORS or connection errors

**Solution:**
1. Verify `REACT_APP_API_URL` includes `/api` at the end
2. Check backend URL is correct (no typos)
3. Verify backend is deployed and running
4. Check CORS is enabled in backend (already done)

### ❌ MongoDB Connection Fails

**Problem:** Database connection errors

**Solution:**
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for all IPs)
3. Verify database user has correct permissions
4. Check MongoDB Atlas cluster is running

### ❌ Environment Variables Not Working

**Problem:** Variables not accessible

**Solution:**
1. Re-add environment variables in Vercel
2. **Redeploy** after adding variables
3. Verify variable names match exactly (case-sensitive)
4. Check deployment logs for variable errors

---

## 📝 ENVIRONMENT VARIABLES CHECKLIST

### Backend (in Vercel Dashboard):
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Random secret (min 32 chars)
- [ ] `JWT_EXPIRE` - `7d`
- [ ] `GEMINI_API_KEY` - Your Gemini API key
- [ ] `GITHUB_TOKEN` - GitHub token (optional)
- [ ] `NODE_ENV` - `production`
- [ ] `VERCEL` - `1`

### Frontend (in Vercel Dashboard):
- [ ] `REACT_APP_API_URL` - `https://your-backend.vercel.app/api`

---

## 🔗 IMPORTANT URLS TO REMEMBER

After deployment, save these URLs:

**Backend URL:** `https://your-backend-name.vercel.app`
**Backend API Base:** `https://your-backend-name.vercel.app/api`
**Frontend URL:** `https://your-frontend-name.vercel.app`

---

## 🎉 POST-DEPLOYMENT CHECKLIST

- [ ] Backend health check works (`/api/health`)
- [ ] Frontend loads without errors
- [ ] Can register new users
- [ ] Can login
- [ ] Can create projects
- [ ] Can create issues
- [ ] API calls work in browser console

---

## 💡 TIPS

1. **Always redeploy after changing environment variables**
2. **Check Vercel deployment logs** for detailed error messages
3. **Test locally first** before deploying
4. **Use different project names** for backend and frontend
5. **Enable Vercel analytics** to monitor performance

---

## 📞 Need Help?

If something doesn't work:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test backend health endpoint
5. Verify MongoDB connection

---

## ✨ Quick Reference

**Backend Deployment:**
- Root Directory: `backend`
- Framework: Other
- Build Command: `npm install`

**Frontend Deployment:**
- Root Directory: `frontend`
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

**Critical Environment Variable:**
- Frontend `REACT_APP_API_URL` must end with `/api`!

---

Good luck with your deployment! 🚀

