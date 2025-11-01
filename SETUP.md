# Quick Setup Guide for ProdSync

Follow these steps to get ProdSync running locally on your machine.

## Step 1: Clone or Extract Project

```bash
cd GDG_Hackathon
```

## Step 2: Set Up MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a free cluster
4. Create a database user
5. Whitelist your IP (0.0.0.0/0 for testing)
6. Get your connection string

### Option B: Local MongoDB

1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Your connection string will be: `mongodb://localhost:27017/prodsync`

## Step 3: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
copy env.example .env    # Windows
# OR
cp env.example .env      # Linux/Mac
```

### Configure .env file

Open `backend/.env` and add:

```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_random_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# Optional: For AI Triage feature
OPENAI_API_KEY=your_openai_api_key_here

# Optional: For file uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: For integrations
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SLACK_WEBHOOK_URL=your_slack_webhook_url

PORT=5000
NODE_ENV=development
```

**Important:** Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy this output as your JWT_SECRET.

## Step 4: Start Backend

```bash
# From backend directory
npm run dev

# You should see:
# MongoDB Connected: ...
# Server running on port 5000
```

## Step 5: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Note: No .env needed for basic setup
# API will connect to http://localhost:5000/api by default
```

## Step 6: Start Frontend

```bash
# From frontend directory
npm start

# Browser should open automatically to http://localhost:3000
```

## Step 7: Create Account

1. Go to http://localhost:3000
2. Click "Register here"
3. Fill in your details
4. Click Register
5. You'll be logged in automatically!

## Step 8: Test Features

### Basic Testing

1. **Dashboard** - View stats and recent issues
2. **Create Issue** - Go to Issues page, create test issues
3. **Projects** - Create a project
4. **Analytics** - View charts (works better with data)

### AI Triage Testing

1. Create an issue with a detailed description
2. Click "Analyze Issue" button
3. See AI suggestions

**Note:** Without OpenAI API key, you'll see a mock response.

## Troubleshooting

### Backend Won't Start

**Error: MongoDB connection failed**
- Check MONGODB_URI in .env
- Make sure MongoDB is running
- Verify IP whitelist if using Atlas

**Error: Port 5000 already in use**
- Kill the process using port 5000
- Or change PORT in .env

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Frontend Won't Start

**Error: Port 3000 already in use**
- Use a different port
- Kill the process on port 3000

**Error: Cannot connect to API**
- Make sure backend is running on port 5000
- Check backend console for errors

### Dependencies Installation Failed

**npm install fails**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json
- Try again: `npm install`

**Permission denied errors (Linux/Mac)**
- Use sudo: `sudo npm install`
- Or fix npm permissions: `npm config set prefix ~/.npm-global`

### Database Issues

**Collections not created**
- This is normal! Collections are created automatically when you save first data

**Cannot insert data**
- Check user permissions in MongoDB Atlas
- Verify connection string format

## Development Tips

### Auto-restart Backend

Backend uses `nodemon` - automatically restarts on file changes.

### Hot-reload Frontend

Frontend has hot-reload enabled - changes appear instantly in browser.

### View Database

**MongoDB Atlas:**
- Go to Collections tab in Atlas dashboard

**Local MongoDB:**
- Use MongoDB Compass (GUI)
- Or `mongo` CLI: `mongo prodsync`

### Testing API Directly

Use tools like:
- [Postman](https://www.postman.com)
- [Insomnia](https://insomnia.rest)
- curl

Example:
```bash
# Get issues (requires login token)
curl http://localhost:5000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Debugging

**Backend:**
- Check console logs
- Add `console.log()` statements

**Frontend:**
- Open browser DevTools (F12)
- Check Console and Network tabs

## Next Steps

1. **Read the main README.md** for feature documentation
2. **Check DEPLOYMENT.md** to deploy to production
3. **Explore the code** to understand architecture
4. **Add features** or customize as needed

## Need Help?

- Check main README.md
- Review code comments
- Google error messages
- Check Stack Overflow

## Common Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server

# Frontend
cd frontend
npm install          # Install dependencies
npm start            # Start development server
npm run build        # Build for production

# Database
mongod               # Start local MongoDB (if installed)
mongo                # Open MongoDB shell
```

## What's Next?

Your ProdSync setup is complete! Start building features, testing integrations, and deploying when ready.

**Happy Coding! 🚀**

