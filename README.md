# ProdSync 🚀

A Modern Product Development & Issue Tracking Platform

## 📋 Overview

ProdSync is a comprehensive issue tracking and project management platform built for teams who need to track bugs, plan sprints, manage roadmaps, and collaborate efficiently. With AI-assisted triage and real-time features, ProdSync helps teams ship faster.

## ✨ Features

- 🔐 **Authentication & Teams** - User registration, role-based access, organization management
- 🐛 **Issue Management** - Create, edit, assign issues with priorities and labels
- 🤖 **AI-Assisted Triage** - Automatic categorization and duplicate detection using OpenAI
- 📅 **Sprint Planning** - Plan and track sprints with Kanban boards
- 🗺️ **Roadmap Management** - Visualize and manage project milestones
- 📊 **Analytics Dashboard** - Track velocity, workload, and completion trends
- 🔗 **Integrations** - Connect with GitHub, Slack, and Figma (coming soon)
- 💬 **Real-time Collaboration** - Comments and notifications
- 📁 **Project Management** - Organize work by projects and teams

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time features

### AI & Integrations
- **OpenAI API** - AI triage
- **Cloudinary** - File storage
- **GitHub API** - Code integration
- **Slack API** - Notifications

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp env.example .env

# Edit .env with your configuration
MONGODB_URI=mongodb://localhost:27017/prodsync
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=your_openai_key_here
PORT=5000

# Run development server
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm start
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
GDG_Hackathon/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── services/    # API services
│       ├── store/       # Redux store
│       └── utils/       # Utilities
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Issues
- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `GET /api/issues/:id/comments` - Get comments
- `POST /api/issues/:id/comments` - Add comment

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/analytics` - Get analytics

### Sprints
- `GET /api/sprints` - Get all sprints
- `GET /api/sprints/:id` - Get sprint
- `POST /api/sprints` - Create sprint
- `PUT /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint
- `GET /api/sprints/:id/analytics` - Get analytics

### AI Triage
- `POST /api/triage/ai` - Get AI triage suggestions
- `POST /api/triage/duplicates` - Check for duplicates

## 🧪 Usage Example

### Create an Issue

```javascript
const issue = {
  title: "Fix login bug",
  description: "Users unable to login with Google",
  priority: "High",
  status: "Open",
  projectId: "project_id_here"
};

await issuesAPI.createIssue(issue);
```

### AI Triage Analysis

```javascript
const triage = await triageAPI.aiTriage({
  issueTitle: "Fix login bug",
  issueDescription: "Users unable to login with Google"
});

console.log(triage.suggestedCategory); // "Bug"
console.log(triage.priority); // "High"
```

## 🌐 Deployment

### Backend (Render/Railway)

1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in frontend directory
3. Configure environment variables

### Database (MongoDB Atlas)

1. Create free cluster
2. Get connection string
3. Add to environment variables

## 📝 Environment Variables

See `backend/env.example` and `frontend/.env.example` for all required variables.

## 🎯 Future Enhancements

- [ ] Slack bot integration
- [ ] GitHub webhooks
- [ ] Chrome extension
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Custom workflows
- [ ] Time tracking

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 📄 License

MIT License

## 👤 Author

Built for GDG Hackathon 2025

---

**Happy Hacking! 🎉**

