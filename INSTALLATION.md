# ProdSync - Installation & Getting Started

## 🚀 Quick Installation

### Prerequisites
- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- MongoDB (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)

### Step 1: Install Backend

```bash
cd backend
npm install
```

### Step 2: Configure Backend

Create a `.env` file in the `backend` folder:

```bash
# On Windows
copy env.example .env

# On Mac/Linux
cp env.example .env
```

Edit `.env` and add your configuration:

```env
MONGODB_URI=mongodb://localhost:27017/prodsync
JWT_SECRET=your_secret_key_here_min_32_characters_long
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start Backend

```bash
# From backend directory
npm run dev
```

You should see:
```
MongoDB Connected: ...
Server running on port 5000
```

### Step 4: Install Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
```

### Step 5: Start Frontend

```bash
npm start
```

Your browser should automatically open to `http://localhost:3000`

### Step 6: Create Account

1. Click "Register here" on the login page
2. Fill in your details
3. Click Register
4. You'll be automatically logged in!

## ✅ Installation Complete!

### First Steps

1. **Create a Project** - Go to Projects page
2. **Create Issues** - Go to Issues page
3. **View Dashboard** - Check your stats
4. **Explore Analytics** - See visual charts

### Testing AI Features

To enable AI-powered issue triage:

1. Get an OpenAI API key from [OpenAI](https://platform.openai.com/)
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart backend
4. Create an issue and click "Analyze Issue"

**Note:** Without OpenAI key, AI features show mock data.

## 📝 Common Issues

### Backend Issues

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**MongoDB connection failed:**
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- For Atlas: Check IP whitelist

### Frontend Issues

**Port 3000 already in use:**
- Frontend will prompt to use another port
- Click "Yes" to use suggested port

**Cannot connect to API:**
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify no CORS errors

### Dependencies Issues

**npm install fails:**
```bash
# Clear cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Optional Configuration

### MongoDB Atlas (Cloud Database)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Add IP whitelist (0.0.0.0/0 for all)
5. Get connection string
6. Update MONGODB_URI in .env

### Slack Integration

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create new app
3. Enable Incoming Webhooks
4. Add webhook to workspace
5. Copy webhook URL
6. Add to backend .env:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
   ```

### GitHub Integration

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Get Client ID and Secret
4. Add to backend .env:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### Cloudinary (File Uploads)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Add to backend .env:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## 📊 Database Structure

Collections are created automatically when you first use them:
- `users` - User accounts
- `issues` - All issues
- `projects` - Projects
- `sprints` - Sprint data
- `comments` - Issue comments
- `teams` - Team information

## 🎯 Next Steps

1. Read **README.md** for features
2. Check **SETUP.md** for detailed setup
3. See **DEPLOYMENT.md** to deploy online
4. Review **PROJECT_SUMMARY.md** for overview

## 🆘 Need Help?

- Check SETUP.md for troubleshooting
- Review backend/README.md
- Review frontend/README.md
- Check browser console for errors
- Check backend terminal for logs

---

**Ready to start tracking issues! 🎉**

