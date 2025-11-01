# Vercel Deployment Fix Guide

## Problem
The backend is returning 404 errors because:
1. The frontend is trying to call `/auth/login` but the route is `/api/auth/login`
2. Vercel needs specific configuration for Express.js serverless functions

## Solution

### Step 1: Update Frontend Environment Variable

In your Vercel frontend project, add/update the environment variable:

**Environment Variable:**
- Name: `REACT_APP_API_URL`
- Value: `https://meeshobackend.vercel.app/api` (or your actual backend Vercel URL)

### Step 2: Backend Vercel Configuration

The backend now has:
- `backend/vercel.json` - Vercel configuration file
- `backend/api/index.js` - Serverless function entry point
- Updated `backend/server.js` - Exports app for Vercel

### Step 3: Deploy Backend to Vercel

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment"
   git push
   ```

2. **Deploy backend to Vercel:**
   - Go to Vercel Dashboard
   - Import your GitHub repository
   - **Root Directory:** Set to `backend`
   - **Framework Preset:** Other
   - **Build Command:** `npm install`
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

3. **Add Environment Variables in Vercel:**
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret
   - `JWT_EXPIRE` - `7d`
   - `GEMINI_API_KEY` - Your Gemini API key
   - `GITHUB_TOKEN` - Your GitHub token (if using)
   - `NODE_ENV` - `production`

4. **Deploy!**

### Step 4: Update Frontend API URL

After backend is deployed, update frontend environment variable:

1. Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables
2. Add/Update:
   - `REACT_APP_API_URL` = `https://your-backend-vercel-url.vercel.app/api`
3. Redeploy frontend

## Important Notes

1. **All routes must include `/api` prefix** - The backend routes are under `/api/*`
2. **Backend URL format:** `https://your-backend.vercel.app/api`
3. **Frontend will call:** `https://your-backend.vercel.app/api/auth/login` ✅

## Testing

After deployment, test:
1. Backend health: `https://your-backend.vercel.app/api/health`
2. Frontend should call: `https://your-backend.vercel.app/api/auth/login`

## Alternative: If Backend is on Different Platform

If your backend is deployed elsewhere (Render, Railway, etc.):

1. Update frontend `REACT_APP_API_URL` to point to that URL
2. Example: `REACT_APP_API_URL=https://prodsync-backend.onrender.com/api`

## Common Issues

### 404 Errors
- Check that backend URL includes `/api` at the end
- Verify `vercel.json` is in the backend root
- Check Vercel deployment logs

### CORS Errors
- Backend already has `cors()` middleware configured
- Verify backend is deployed and running

### Environment Variables
- Make sure all required env vars are set in Vercel
- Check that MongoDB URI is correct
- Verify JWT_SECRET is set

