# ✅ Vercel Deployment Checklist

Use this checklist to ensure everything is properly deployed.

## 📋 Pre-Deployment Checklist

### Code Preparation:
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub repository
- [ ] `backend/vercel.json` exists
- [ ] `backend/api/index.js` exists
- [ ] `frontend/vercel.json` exists

---

## 🔧 Backend Deployment Checklist

### Vercel Project Setup:
- [ ] Created backend project in Vercel
- [ ] Connected GitHub repository
- [ ] Set **Root Directory** to `backend`
- [ ] Set **Framework Preset** to `Other`
- [ ] Set **Build Command** to `npm install`
- [ ] **Output Directory** is empty (not set)

### Environment Variables (Backend):
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Secret key (min 32 characters)
- [ ] `JWT_EXPIRE` - Set to `7d`
- [ ] `GEMINI_API_KEY` - Your Gemini API key
- [ ] `GITHUB_TOKEN` - GitHub token (optional)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `VERCEL` - Set to `1`

### Deployment:
- [ ] Backend deployed successfully
- [ ] Deployment URL saved: `https://________________.vercel.app`
- [ ] Health check works: `/api/health` returns success
- [ ] No errors in deployment logs

---

## 🎨 Frontend Deployment Checklist

### Vercel Project Setup:
- [ ] Created frontend project in Vercel
- [ ] Connected same GitHub repository
- [ ] Set **Root Directory** to `frontend`
- [ ] Set **Framework Preset** to `Create React App`
- [ ] Set **Build Command** to `npm run build`
- [ ] Set **Output Directory** to `build`

### Environment Variables (Frontend):
- [ ] `REACT_APP_API_URL` - Set to `https://your-backend-url.vercel.app/api`
  - ⚠️ **MUST include `/api` at the end!**

### Deployment:
- [ ] Frontend deployed successfully
- [ ] Deployment URL saved: `https://________________.vercel.app`
- [ ] Frontend loads without errors
- [ ] No errors in deployment logs

---

## 🧪 Testing Checklist

### Backend Tests:
- [ ] `GET /api/health` - Returns success
- [ ] `GET /api/` - Returns welcome message
- [ ] `POST /api/auth/register` - Can register users
- [ ] `POST /api/auth/login` - Can login

### Frontend Tests:
- [ ] Frontend homepage loads
- [ ] Login page works
- [ ] Registration works
- [ ] Can create projects
- [ ] Can create issues
- [ ] API calls succeed (check browser Network tab)
- [ ] No CORS errors in console

### Integration Tests:
- [ ] User can register from frontend
- [ ] User can login from frontend
- [ ] User can create a project
- [ ] User can create an issue
- [ ] User can view issues
- [ ] User can resolve issues

---

## 📝 MongoDB Atlas Checklist

### Database Setup:
- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Database user created with password
- [ ] IP whitelist updated (add `0.0.0.0/0` for all IPs)
- [ ] Connection string copied
- [ ] Connection string tested locally
- [ ] `MONGODB_URI` added to Vercel backend environment variables

---

## 🎯 Final Verification

### URLs to Save:
```
Backend URL: https://________________________________.vercel.app
Backend API: https://________________________________.vercel.app/api
Frontend URL: https://________________________________.vercel.app
```

### Quick Tests:
1. [ ] Backend health: `https://your-backend.vercel.app/api/health` ✅
2. [ ] Frontend loads: `https://your-frontend.vercel.app` ✅
3. [ ] Login works ✅
4. [ ] Create project works ✅

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 errors | Check `REACT_APP_API_URL` includes `/api` |
| CORS errors | Backend has CORS enabled, verify backend is running |
| MongoDB errors | Check `MONGODB_URI` and IP whitelist |
| Build fails | Check deployment logs, verify all dependencies |
| Environment vars not working | Redeploy after adding variables |

---

## ✨ You're Ready!

Once all checkboxes are complete, your app should be fully deployed and working on Vercel! 🎉

