# How to Use ProdSync - Quick Guide

## 🚀 Getting Started

### 1. Start the Application

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Should see: `Server running on port 5000`

**Frontend** (Terminal 2):
```bash
cd frontend
npm start
```
Browser opens: http://localhost:3000

### 2. Create Account
1. Go to http://localhost:3000
2. Click "Register here"
3. Fill in your details
4. Click "Register"
5. ✅ You're logged in!

## 📦 Project Management

### Import from GitHub (Recommended)

1. Click **Projects** in sidebar
2. Click **+ Create Project**
3. You'll see two tabs:
   - **📦 Import from GitHub** ← Try this first!
   - **✏️ Create Manually**

**To Import:**
- Enter GitHub **Owner**: `facebook`
- Enter **Repo**: `react`
- Click **"Import from GitHub"**
- ✅ Project imported with GitHub data!

**Examples to try:**
```
Owner: facebook      Repo: react
Owner: microsoft     Repo: vscode
Owner: vercel        Repo: next.js
Owner: tailwindlabs  Repo: tailwindcss
```

### Create Manually

1. Click **Create Manually** tab
2. Enter project name
3. Add description (optional)
4. Click **Create Project**
5. ✅ Project created!

## 🐛 Issue Management

### Create an Issue

1. Click **Issues** in sidebar
2. Click **+ Create Issue**
3. Fill in:
   - **Title**: "Fix login bug"
   - **Description**: "Users can't login with Google"
   - **Project**: Select your project
   - **Priority**: Medium/High/Critical
4. Optional: Click **🔮 AI Triage** for suggestions
5. Click **Create Issue**
6. ✅ Issue created!

### View Issues

- All issues listed on Issues page
- Click any issue to view details
- Filter by status or priority
- Search by title/description

## 📊 Analytics Dashboard

Click **Analytics** in sidebar to see:
- Issue status distribution (pie chart)
- Priority breakdown (bar chart)
- Overall statistics
- Project metrics

## 🔮 AI Triage Feature

On any issue detail page:
1. Click **🔮 Analyze Issue** button
2. AI suggests:
   - Category (Bug, Feature, etc.)
   - Priority level
   - Analysis summary
3. Review suggestions

**Note:** Works with OpenAI API key configured

## 💡 Quick Tips

### Navigation
- **Dashboard**: Overview with stats
- **Issues**: All issues list
- **Projects**: All projects list
- **Analytics**: Charts and metrics

### Keyboard Shortcuts
- Browser back button works
- Use sidebar for navigation

### Best Practices
1. Create projects first
2. Then create issues within projects
3. Assign priorities appropriately
4. Use AI triage for categorization
5. Review analytics regularly

## 🔍 Troubleshooting

### "Cannot create project"
✅ Fixed! You can now create projects without errors

### "Cannot create issue"
✅ Fixed! You can now create issues normally

### GitHub import fails
- Check repository exists
- Verify owner/repo spelling
- Try a public repository

### Backend errors
- Check terminal 1 for errors
- Verify MongoDB is connected
- Check .env configuration

### Frontend errors
- Check browser console (F12)
- Clear browser cache
- Restart frontend

## 📝 Common Workflows

### Workflow 1: New Project Setup
1. Import or create project
2. Create issues for project
3. Assign priorities
4. Track progress in Analytics

### Workflow 2: Bug Tracking
1. Create issue
2. Use AI triage to categorize
3. Set high priority
4. Assign to team member
5. Update status as fixed

### Workflow 3: Feature Planning
1. Create project
2. Add issues for features
3. Plan sprints
4. Track velocity in Analytics

## 🎯 Next Steps

After setup:
1. ✅ Create/import projects
2. ✅ Add issues
3. ✅ Try AI triage
4. ✅ View analytics
5. ✅ Invite team members (coming soon)

---

**You're all set! Happy tracking!** 🎉

For more details, see:
- README.md - Full documentation
- SETUP.md - Setup guide
- FEATURES.md - Complete feature list

