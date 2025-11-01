# ProdSync - Quick Start Guide

Get ProdSync running in 5 minutes! ⚡

## Prerequisites

- Node.js installed ([download](https://nodejs.org/))
- MongoDB running locally OR MongoDB Atlas account

## Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
copy env.example .env   # Windows
cp env.example .env     # Mac/Linux
```

Edit `.env` and set:
```env
MONGODB_URI=mongodb://localhost:27017/prodsync
JWT_SECRET=your_random_secret_key_32_chars_long
PORT=5000
```

Start backend:
```bash
npm run dev
```

✅ Backend running on http://localhost:5000

### 2. Frontend Setup

Open **new terminal**:
```bash
cd frontend
npm install
npm start
```

✅ Frontend opens at http://localhost:3000

### 3. Create Account

1. Click "Register here"
2. Enter your details
3. Click Register
4. Start using ProdSync!

## Quick Actions

### Create Your First Issue

1. Go to **Issues** page
2. Click **+ Create Issue**
3. Fill in details
4. Click **Create**
5. ✅ Issue created!

### Try AI Triage

1. Open any issue
2. Click **🔮 Analyze Issue**
3. See AI suggestions

### View Analytics

1. Go to **Analytics** page
2. See charts and stats

### Create Project

1. Go to **Projects** page
2. Click **+ Create Project**
3. Add details
4. Start organizing issues

## File Structure

```
backend/
├── models/         # Database schemas
├── controllers/    # Business logic
├── routes/         # API endpoints
└── server.js       # Entry point

frontend/
├── pages/          # UI pages
├── components/     # Reusable components
├── store/          # State management
└── services/       # API calls
```

## Common Commands

```bash
# Backend
cd backend
npm install        # Install dependencies
npm run dev        # Start dev server
npm start          # Start production

# Frontend
cd frontend
npm install        # Install dependencies
npm start          # Start dev server
npm run build      # Build for production
```

## What's Next?

- ✅ Create issues and projects
- ✅ Assign team members
- ✅ Track progress
- ✅ View analytics
- ✅ Use AI triage

## Need Help?

- 📖 Read **SETUP.md** for detailed setup
- 📖 See **README.md** for features
- 📖 Check **FEATURES.md** for full list
- 📖 View **DEPLOYMENT.md** to deploy online

---

**You're all set! Happy tracking! 🎉**

