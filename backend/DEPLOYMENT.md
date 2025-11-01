# Deployment Guide

## Prerequisites

- MongoDB Atlas account (free tier available)
- OpenAI API key (for AI features)
- Cloudinary account (for file uploads)
- GitHub account
- Vercel account (for frontend)
- Render/Railway account (for backend)

## Backend Deployment (Render/Railway)

### Render Setup

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Name:** prodsync-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Port:** 5000

5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prodsync
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   OPENAI_API_KEY=your_openai_key
   NODE_ENV=production
   PORT=5000
   ```

6. Deploy!

### Railway Setup

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select repository and backend folder
4. Add environment variables (same as above)
5. Deploy

## Frontend Deployment (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd frontend
   vercel
   ```

4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

5. Redeploy:
   ```bash
   vercel --prod
   ```

## MongoDB Atlas Setup

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Add IP address (0.0.0.0/0 for all)
4. Get connection string
5. Replace `<password>` with your actual password

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Add to backend environment variables

## Slack Integration

1. Create Slack App at [api.slack.com](https://api.slack.com)
2. Go to Incoming Webhooks
3. Enable and create webhook
4. Copy webhook URL
5. Add to backend environment variables

## Domain Configuration (Optional)

### Backend
- Use custom domain on Render
- Point DNS A record to Render IP

### Frontend
- Add custom domain in Vercel
- Update API_URL environment variable

## SSL/HTTPS

- Both Vercel and Render provide HTTPS by default
- No additional configuration needed

## Monitoring

### Backend Health Check
```
GET https://your-backend-url.onrender.com/api/health
```

### Logs
- Render: Dashboard → Logs
- Railway: Deployments → View Logs
- Vercel: Dashboard → Deployment → View Logs

## Troubleshooting

### Backend Issues

**Database Connection Failed:**
- Check MONGODB_URI format
- Verify IP whitelist in MongoDB Atlas
- Check database user permissions

**Port Already in Use:**
- Remove PORT from environment variables (Render auto-assigns)
- Or use PORT=10000

### Frontend Issues

**API Connection Failed:**
- Check REACT_APP_API_URL
- Verify CORS settings in backend
- Check backend is running

**Build Failed:**
- Check all dependencies in package.json
- Review build logs for errors

## Scaling

### Backend
- Upgrade Render plan for more resources
- Use Railway Pro for better performance
- Add Redis for caching

### Frontend
- Vercel automatically scales
- CDN is included by default

## Backup

### Database
- MongoDB Atlas has automated backups
- Configure retention period in Atlas

### Code
- GitHub provides version control
- Tag releases for easy rollback

## Cost Estimation

**Free Tier:**
- MongoDB Atlas: Free (512MB)
- Render: Free (750 hours/month)
- Vercel: Free (100GB bandwidth)
- Cloudinary: Free (25GB/month)

**Production:**
- MongoDB Atlas: ~$9/month
- Render: ~$7-15/month
- Vercel: Free (Hobby plan sufficient)
- Cloudinary: ~$99/month for more storage

## Support

For issues:
- Check deployment logs
- Review environment variables
- Test locally first
- Contact support for hosting platforms

