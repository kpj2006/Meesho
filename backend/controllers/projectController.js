const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Issue = require('../models/Issue');
const { createActivity } = require('./activityController');
const axios = require('axios');
const { callGemini } = require('../utils/geminiHelper');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('teamId', 'name')
      .populate('createdBy', 'name email')
      .populate('sprints')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamId', 'name')
      .populate('createdBy', 'name email')
      .populate('sprints')
      .populate('roadmap');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    // Remove empty string fields
    if (req.body.teamId === '' || !req.body.teamId) {
      delete req.body.teamId;
    }

    const project = await Project.create(req.body);

    const populatedProject = await Project.findById(project._id)
      .populate('teamId', 'name')
      .populate('createdBy', 'name email');

    // Create activity
    await createActivity({
      type: 'project_created',
      description: `Created project "${project.name}"`,
      user: req.user.id,
      project: project._id,
    });

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('teamId', 'name')
      .populate('createdBy', 'name email')
      .populate('sprints');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is the creator of the project
    if (project.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete projects that you created',
      });
    }

    // Delete all sprints in this project
    await Sprint.deleteMany({ projectId: project._id });

    // Delete all issues in this project
    await Issue.deleteMany({ projectId: project._id });

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project analytics
// @route   GET /api/projects/:id/analytics
// @access  Private
exports.getProjectAnalytics = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Get all issues for this project
    const issues = await Issue.find({ projectId });
    const sprints = await Sprint.find({ projectId });

    // Calculate analytics
    const totalIssues = issues.length;
    const issuesByStatus = {
      Open: issues.filter((i) => i.status === 'Open').length,
      'In Progress': issues.filter((i) => i.status === 'In Progress').length,
      Resolved: issues.filter((i) => i.status === 'Resolved').length,
      Closed: issues.filter((i) => i.status === 'Closed').length,
    };

    const issuesByPriority = {
      Low: issues.filter((i) => i.priority === 'Low').length,
      Medium: issues.filter((i) => i.priority === 'Medium').length,
      High: issues.filter((i) => i.priority === 'High').length,
      Critical: issues.filter((i) => i.priority === 'Critical').length,
    };

    const activeSprints = sprints.filter((s) => s.status === 'active').length;
    const completedSprints = sprints.filter((s) => s.status === 'completed').length;

    // Calculate velocity (resolved issues per sprint)
    const velocity =
      completedSprints > 0 ? issuesByStatus.Resolved / completedSprints : 0;

    res.status(200).json({
      success: true,
      data: {
        totalIssues,
        issuesByStatus,
        issuesByPriority,
        sprints: {
          total: sprints.length,
          active: activeSprints,
          completed: completedSprints,
        },
        velocity: velocity.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import project from GitHub
// @route   POST /api/projects/import-github
// @access  Private
exports.importFromGitHub = async (req, res, next) => {
  try {
    const { owner, repo, importIssues = true } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        message: 'GitHub owner and repository name required',
      });
    }

    // Prepare GitHub API headers
    const headers = {
      Accept: 'application/vnd.github.v3+json',
    };

    // Add GitHub token if available (for authenticated requests)
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch repository info from GitHub
    let githubData;
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers,
      });
      githubData = response.data;
    } catch (error) {
      console.error('GitHub API error:', error.message);
      return res.status(404).json({
        success: false,
        message: 'GitHub repository not found or not accessible',
      });
    }

    // Create project from GitHub data
    const projectData = {
      name: githubData.name || `${owner}/${repo}`,
      description: githubData.description || '',
      createdBy: req.user.id,
      githubRepo: {
        owner,
        repo,
        url: githubData.html_url,
        stars: githubData.stargazers_count,
        forks: githubData.forks_count,
        language: githubData.language,
        openIssues: githubData.open_issues_count,
      },
    };

    // Check if project already exists
    const existingProject = await Project.findOne({ 
      name: projectData.name,
      createdBy: req.user.id 
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'A project with this name already exists',
        data: existingProject,
      });
    }

    const project = await Project.create(projectData);

    // Check if AI is enabled (needed for response message)
    const aiEnabled = !!process.env.GEMINI_API_KEY;

    // Import GitHub issues if requested
    let importedIssues = [];
    let issuesCount = 0;
    let analyzedIssues = [];
    
    if (importIssues) {
      try {
        // Fetch all open issues from GitHub
        const issuesResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/issues`,
          {
            headers,
            params: {
              state: 'all', // Get both open and closed issues
              per_page: 100, // Maximum per page
              sort: 'created',
              direction: 'desc',
            },
          }
        );

        const githubIssues = issuesResponse.data.filter(issue => !issue.pull_request); // Exclude PRs

        // Analyze issues with AI if Gemini is available
        analyzedIssues = [];

        for (const githubIssue of githubIssues) {
          let priority = 'Medium';
          let suggestedCategory = 'Bug';
          let aiAnalysis = null;

          // AI Analysis for each issue (Method 1)
          if (aiEnabled) {
            try {
              const aiPrompt = `You are an expert product manager. Based on the following GitHub issue, analyze it and return a JSON object with:
1. suggestedType: ('Bug', 'Feature', 'Documentation', 'Refactor', 'Enhancement', 'Question')
2. suggestedPriority: ('Low', 'Medium', 'High', 'Critical')
3. summary: A one-sentence summary of the problem or request
4. confidence: A confidence score between 0.0 and 1.0

Title: ${githubIssue.title}
Body: ${githubIssue.body || 'No description provided'}

Respond in JSON format only:
{
  "suggestedType": "type_here",
  "suggestedPriority": "Low|Medium|High|Critical",
  "summary": "summary_here",
  "confidence": 0.0-1.0
}`;

              const systemInstruction = 'You are a software development triage assistant. Analyze issues and provide actionable insights. Always respond with valid JSON only, no markdown formatting.';
              
              const aiContent = await callGemini(aiPrompt, systemInstruction, {
                temperature: 0.3,
                maxTokens: 200,
              });

              const cleanContent = aiContent.replace(/```json\n?|\n?```/g, '');
              
              try {
                const parsedAI = JSON.parse(cleanContent);
                priority = parsedAI.suggestedPriority || priority;
                suggestedCategory = parsedAI.suggestedType || suggestedCategory;
                aiAnalysis = {
                  suggestedCategory: parsedAI.suggestedType,
                  priority: parsedAI.suggestedPriority,
                  summary: parsedAI.summary,
                  confidence: parsedAI.confidence || 0.7,
                };
              } catch (e) {
                console.log('AI response parsing failed, using fallback');
              }
            } catch (error) {
              console.log('AI analysis failed, using label-based fallback:', error.message);
            }
          }

          // Fallback to label-based priority if AI not available or failed
          if (!aiAnalysis) {
            const labelNames = githubIssue.labels.map(l => l.name.toLowerCase());
            if (labelNames.includes('critical')) {
              priority = 'Critical';
            } else if (labelNames.includes('high')) {
              priority = 'High';
            } else if (labelNames.includes('low')) {
              priority = 'Low';
            }

            // Determine category from labels
            if (labelNames.some(l => ['feature', 'enhancement'].includes(l))) {
              suggestedCategory = 'Feature';
            } else if (labelNames.some(l => ['bug', 'bugfix'].includes(l))) {
              suggestedCategory = 'Bug';
            } else if (labelNames.some(l => ['documentation', 'docs'].includes(l))) {
              suggestedCategory = 'Documentation';
            }
          } else {
            priority = aiAnalysis.priority;
            suggestedCategory = aiAnalysis.suggestedCategory;
          }

          // Map GitHub state to our status
          let status = 'Open';
          if (githubIssue.state === 'closed') {
            status = 'Closed';
          } else if (githubIssue.state === 'open') {
            status = 'Open';
          }

          const issueData = {
            title: githubIssue.title,
            description: githubIssue.body || `Imported from GitHub issue #${githubIssue.number}`,
            status: status,
            priority: priority,
            labels: [...githubIssue.labels.map(l => l.name), suggestedCategory].filter((v, i, a) => a.indexOf(v) === i), // Add AI category to labels
            projectId: project._id,
            createdBy: req.user.id,
            aiTriage: aiAnalysis || null,
            githubIssue: {
              number: githubIssue.number,
              url: githubIssue.html_url,
              state: githubIssue.state,
              created_at: githubIssue.created_at,
              updated_at: githubIssue.updated_at,
            },
          };

          const issue = await Issue.create(issueData);
          analyzedIssues.push({
            issue,
            aiAnalysis: aiAnalysis ? {
              summary: aiAnalysis.summary,
              confidence: aiAnalysis.confidence,
            } : null,
          });
          importedIssues.push(issue);
          issuesCount++;
        }
      } catch (error) {
        console.error('Error importing GitHub issues:', error.message);
        // Continue even if issues import fails
      }
    }

    // Also fetch repository collaborators and stats
    let collaborators = [];
    let languages = {};
    
    try {
      // Fetch collaborators (if token available)
      if (process.env.GITHUB_TOKEN) {
        const collabResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/collaborators`,
          { headers }
        );
        collaborators = collabResponse.data.map(c => ({
          login: c.login,
          avatar_url: c.avatar_url,
          permissions: c.permissions,
        }));
      }

      // Fetch repository languages
      const langResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
        { headers }
      );
      languages = langResponse.data;
    } catch (error) {
      console.error('Error fetching additional GitHub data:', error.message);
      // Continue without this data
    }

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Project imported successfully from GitHub. ${issuesCount} issue(s) imported${aiEnabled ? ' with AI analysis' : ''}.`,
      data: populatedProject, // Return the project directly for easier frontend access
      metadata: {
        importedIssues: issuesCount,
        issues: importedIssues.slice(0, 10), // Return first 10 issues
        analyzedIssues: analyzedIssues.slice(0, 10), // Return first 10 with AI analysis
        totalIssues: issuesCount,
        collaborators: collaborators.length,
        languages: Object.keys(languages),
        aiEnabled,
        githubData: {
          stars: githubData.stargazers_count,
          forks: githubData.forks_count,
          watchers: githubData.watchers_count,
          openIssues: githubData.open_issues_count,
          url: githubData.html_url,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Analysis of entire project
// @route   POST /api/projects/:id/analyze
// @access  Private
exports.analyzeProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Get all issues for this project
    const issues = await Issue.find({ projectId })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    if (issues.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: 'No issues found in this project.',
          resolutionOrder: [],
          priorityBreakdown: {},
          recommendations: [],
        },
      });
    }

    // Build project analysis data
    const issuesData = issues.map(issue => ({
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      status: issue.status,
      id: issue._id.toString(),
    }));

    // If no Gemini API key, provide basic analysis
    if (!process.env.GEMINI_API_KEY) {
      // Basic priority-based ordering
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const sortedIssues = [...issues].sort((a, b) => {
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      return res.status(200).json({
        success: true,
        data: {
          summary: `Project "${project.name}" has ${issues.length} issues. ${issues.filter(i => i.status === 'Open').length} are open.`,
          resolutionOrder: sortedIssues.map(issue => ({
            issueId: issue._id.toString(),
            title: issue.title,
            priority: issue.priority,
            reason: `Priority: ${issue.priority}`,
          })),
          priorityBreakdown: {
            Critical: issues.filter(i => i.priority === 'Critical').length,
            High: issues.filter(i => i.priority === 'High').length,
            Medium: issues.filter(i => i.priority === 'Medium').length,
            Low: issues.filter(i => i.priority === 'Low').length,
          },
          recommendations: [
            'Focus on Critical and High priority issues first',
            'Consider grouping related issues together',
            'Update issue status as you resolve them',
          ],
        },
      });
    }

    // Use Gemini for advanced analysis
    const prompt = `Analyze this software project and its issues. Provide:
1. A brief summary of the project health
2. Recommended resolution order (which issues to fix first, numbered 1-${issues.length})
3. Priority breakdown
4. Actionable recommendations

Project: ${project.name}
Description: ${project.description || 'N/A'}
Total Issues: ${issues.length}

Issues:
${issuesData.map((issue, idx) => `
${idx + 1}. [${issue.priority}] ${issue.title}
   Status: ${issue.status}
   Description: ${issue.description.substring(0, 200)}${issue.description.length > 200 ? '...' : ''}
`).join('')}

Respond in JSON format only:
{
  "summary": "project_health_summary",
  "resolutionOrder": [
    {"issueNumber": 1, "title": "issue_title", "priority": "priority", "reason": "why_first"},
    {"issueNumber": 2, "title": "issue_title", "priority": "priority", "reason": "why_second"}
  ],
  "priorityBreakdown": {"Critical": count, "High": count, "Medium": count, "Low": count},
  "recommendations": ["recommendation1", "recommendation2"]
}`;

    try {
      const systemInstruction = 'You are a software project management assistant. Analyze projects and provide actionable insights. Always respond with valid JSON only, no markdown formatting.';
      
      const aiAnalysis = await callGemini(prompt, systemInstruction, {
        temperature: 0.3,
        maxTokens: 1500,
      });
      
      // Remove markdown code blocks if present
      const cleanAnalysis = aiAnalysis.replace(/```json\n?|\n?```/g, '');
      
      // Parse JSON response
      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(cleanAnalysis);
      } catch (parseError) {
        throw new Error('Failed to parse AI response');
      }

      // Map AI issue numbers to actual issue IDs
      if (parsedAnalysis.resolutionOrder && Array.isArray(parsedAnalysis.resolutionOrder)) {
        parsedAnalysis.resolutionOrder = parsedAnalysis.resolutionOrder.map((item) => {
          const issueNumber = item.issueNumber || 1;
          const issue = issues[issueNumber - 1] || issues.find(i => i.title === item.title) || issues[0];
          
          return {
            issueId: issue._id.toString(),
            title: issue.title,
            priority: issue.priority,
            reason: item.reason || `Priority: ${issue.priority}`,
          };
        });
      }

      res.status(200).json({
        success: true,
        data: parsedAnalysis,
      });
    } catch (geminiError) {
      // Check for quota errors
      const errorCode = geminiError.response?.data?.error?.code;
      const errorMessage = geminiError.response?.data?.error?.message || geminiError.message || '';
      
      if (errorCode === 'RESOURCE_EXHAUSTED' || errorMessage.includes('quota')) {
        console.log('Gemini quota exceeded - using fallback priority-based analysis');
      } else {
        console.error('Gemini API Error:', geminiError.response?.data || geminiError.message);
      }
      
      // Fallback to intelligent priority-based analysis
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const sortedIssues = [...issues].sort((a, b) => {
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      const openCount = issues.filter(i => i.status === 'Open').length;
      const criticalCount = issues.filter(i => i.priority === 'Critical').length;
      const highCount = issues.filter(i => i.priority === 'High').length;

      let summary = `Project "${project.name}" has ${issues.length} issues. ${openCount} are currently open.`;
      let recommendations = [];
      
      if (criticalCount > 0) {
        summary += ` ⚠️ ${criticalCount} Critical issue(s) need immediate attention.`;
        recommendations.push(`Focus on ${criticalCount} Critical issue(s) first`);
      }
      if (highCount > 0) {
        recommendations.push(`Next, address ${highCount} High priority issue(s)`);
      }
      if (recommendations.length === 0) {
        recommendations.push('Focus on Critical and High priority issues first');
        recommendations.push('Update issue status as you resolve them');
      }

      res.status(200).json({
        success: true,
        data: {
          summary: summary,
          resolutionOrder: sortedIssues.map(issue => ({
            issueId: issue._id.toString(),
            title: issue.title,
            priority: issue.priority,
            reason: errorCode === 'RESOURCE_EXHAUSTED' 
              ? `Priority: ${issue.priority} (Gemini quota exceeded - using fallback analysis)`
              : `Priority: ${issue.priority}`,
          })),
          priorityBreakdown: {
            Critical: issues.filter(i => i.priority === 'Critical').length,
            High: issues.filter(i => i.priority === 'High').length,
            Medium: issues.filter(i => i.priority === 'Medium').length,
            Low: issues.filter(i => i.priority === 'Low').length,
          },
          recommendations: recommendations,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze source code from GitHub to find issues (Method 2)
// @route   POST /api/projects/:id/analyze-code
// @access  Private
exports.analyzeSourceCode = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { owner, repo, branch = 'main', maxFiles = 50 } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Get GitHub repo info from project or params
    const repoOwner = owner || project.githubRepo?.owner;
    const repoName = repo || project.githubRepo?.repo;

    if (!repoOwner || !repoName) {
      return res.status(400).json({
        success: false,
        message: 'GitHub repository information required',
      });
    }

    // Prepare GitHub API headers
    const headers = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch file tree
    let treeSha;
    try {
      const branchResponse = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/branches/${branch}`,
        { headers }
      );
      treeSha = branchResponse.data.commit.sha;
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: `Branch '${branch}' not found`,
      });
    }

    // Get recursive file tree
    const treeResponse = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${treeSha}?recursive=1`,
      { headers }
    );

    // Filter relevant code files
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt'];
    const ignorePatterns = ['node_modules', '.git', 'dist', 'build', 'vendor', '.next', '.venv', '__pycache__', 'package-lock.json', 'yarn.lock'];

    const codeFiles = treeResponse.data.tree
      .filter(file => 
        file.type === 'blob' &&
        codeExtensions.some(ext => file.path.endsWith(ext)) &&
        !ignorePatterns.some(pattern => file.path.includes(pattern))
      )
      .slice(0, maxFiles);

    const foundIssues = [];
    const aiEnabled = !!process.env.GEMINI_API_KEY;

    // Method 2A: Simple RegEx analysis for TODO/FIXME/HACK
    for (const file of codeFiles) {
      try {
        // Get file content
        const fileResponse = await axios.get(file.url, { headers });
        const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
        const lines = content.split('\n');

        // Find TODO/FIXME/HACK comments
        lines.forEach((line, index) => {
          const todoMatch = line.match(/(?:TODO|FIXME|HACK|XXX|BUG|NOTE):\s*(.+)/i);
          if (todoMatch) {
            foundIssues.push({
              type: 'TodoComment',
              title: `TODO/FIXME found in ${file.path.split('/').pop()}`,
              body: todoMatch[1].trim() || 'No description',
              lineNumber: index + 1,
              filePath: file.path,
              priority: 'Low',
              category: 'TechDebt',
              method: 'regex',
            });
          }
        });

        // Method 2B: AI Analysis (if enabled)
        if (aiEnabled && content.length < 50000) {
          try {
            const aiPrompt = `You are an expert senior developer. Analyze this code file for potential issues. Identify and return a JSON list of issues. For each issue, provide:

1. issueTitle: A clear, concise title for the issue
2. issueBody: A description of the problem and suggestion for fixing it
3. lineNumber: The approximate line number where the issue is (or null if not specific)
4. type: One of ('Bug', 'Performance', 'TechDebt', 'Documentation', 'Security', 'CodeQuality')
5. priority: One of ('Low', 'Medium', 'High', 'Critical')

Look for:
- Hardcoded secrets or API keys
- Empty catch blocks
- Potential null reference errors
- Inefficient loops or queries
- Security vulnerabilities
- Code smells or anti-patterns
- Missing error handling
- Performance issues

File: ${file.path}
Code:
\`\`\`
${content.substring(0, 8000)}${content.length > 8000 ? '\n... (truncated)' : ''}
\`\`\`

Respond in JSON format only:
{
  "issues": [
    {
      "issueTitle": "title",
      "issueBody": "description",
      "lineNumber": 123,
      "type": "Bug|Performance|TechDebt|Documentation|Security|CodeQuality",
      "priority": "Low|Medium|High|Critical"
    }
  ]
}`;

            const systemInstruction = 'You are a senior software engineer analyzing code for issues. Return valid JSON only, no markdown formatting.';
            
            const aiContent = await callGemini(aiPrompt, systemInstruction, {
              temperature: 0.2,
              maxTokens: 1000,
            });

            const cleanContent = aiContent.replace(/```json\n?|\n?```/g, '');
            
            try {
              const parsedAI = JSON.parse(cleanContent);
              if (parsedAI.issues && Array.isArray(parsedAI.issues)) {
                parsedAI.issues.forEach(aiIssue => {
                  foundIssues.push({
                    type: aiIssue.type || 'CodeQuality',
                    title: aiIssue.issueTitle || 'Potential issue',
                    body: aiIssue.issueBody || 'Found by AI analysis',
                    lineNumber: aiIssue.lineNumber || null,
                    filePath: file.path,
                    priority: aiIssue.priority || 'Medium',
                    category: aiIssue.type || 'CodeQuality',
                    method: 'ai',
                    confidence: 0.8,
                  });
                });
              }
            } catch (e) {
              console.log(`Failed to parse AI response for ${file.path}`);
            }
          } catch (error) {
            console.log(`AI analysis failed for ${file.path}:`, error.message);
          }
        }
      } catch (error) {
        console.log(`Error analyzing file ${file.path}:`, error.message);
        continue;
      }
    }

    // Deduplicate similar issues
    const uniqueIssues = foundIssues.filter((issue, index, self) =>
      index === self.findIndex(i => 
        i.title === issue.title && 
        i.filePath === issue.filePath &&
        Math.abs((i.lineNumber || 0) - (issue.lineNumber || 0)) < 5
      )
    );

    // Create issues in database
    const createdIssues = [];
    const skippedIssues = [];

    for (const foundIssue of uniqueIssues) {
      try {
        // Check if similar issue already exists (avoid duplicates)
        const existingIssue = await Issue.findOne({
          projectId: project._id,
          title: { $regex: new RegExp(foundIssue.title.substring(0, 20), 'i') },
          description: { $regex: new RegExp(foundIssue.body.substring(0, 30), 'i') },
        });

        if (existingIssue) {
          skippedIssues.push({
            issue: foundIssue,
            reason: 'Similar issue already exists',
            existingIssueId: existingIssue._id,
          });
          continue;
        }

        // Create issue from code analysis
        const issueData = {
          title: foundIssue.title || `Code issue in ${foundIssue.filePath.split('/').pop()}`,
          description: `${foundIssue.body || 'Issue found during code analysis'}

**Location:** \`${foundIssue.filePath}\`
${foundIssue.lineNumber ? `**Line:** ${foundIssue.lineNumber}` : ''}
**Method:** ${foundIssue.method === 'ai' ? 'AI Analysis' : 'Regex Pattern Matching'}
**Type:** ${foundIssue.type || foundIssue.category}

This issue was automatically detected by code analysis.`,
          status: 'Open',
          priority: foundIssue.priority || 'Medium',
          labels: [
            foundIssue.category || foundIssue.type || 'CodeQuality',
            'AI-Generated',
            foundIssue.method === 'ai' ? 'AI-Detected' : 'Pattern-Matched',
          ],
          projectId: project._id,
          createdBy: req.user.id,
          aiTriage: foundIssue.method === 'ai' ? {
            suggestedCategory: foundIssue.category || foundIssue.type || 'CodeQuality',
            confidence: foundIssue.confidence || 0.8,
            duplicateCheck: false,
            analysis: `Automatically detected in code file ${foundIssue.filePath}`,
          } : null,
          codeLocation: {
            filePath: foundIssue.filePath,
            lineNumber: foundIssue.lineNumber,
            branch: branch,
            repository: `${repoOwner}/${repoName}`,
          },
        };

        const newIssue = await Issue.create(issueData);
        
        // Populate for response
        const populatedIssue = await Issue.findById(newIssue._id)
          .populate('createdBy', 'name email')
          .populate('projectId', 'name');

        createdIssues.push(populatedIssue);
      } catch (error) {
        console.error(`Error creating issue for: ${foundIssue.title}`, error.message);
        skippedIssues.push({
          issue: foundIssue,
          reason: 'Database error',
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Found ${uniqueIssues.length} potential issues. Created ${createdIssues.length} new issues in database.`,
      data: {
        totalFound: uniqueIssues.length,
        created: createdIssues.length,
        skipped: skippedIssues.length,
        createdIssues: createdIssues.slice(0, 20), // Return first 20 created issues
        skippedIssues: skippedIssues.slice(0, 10), // Return first 10 skipped with reasons
        filesAnalyzed: codeFiles.length,
        aiEnabled,
        summary: {
          byType: uniqueIssues.reduce((acc, issue) => {
            acc[issue.type] = (acc[issue.type] || 0) + 1;
            return acc;
          }, {}),
          byPriority: uniqueIssues.reduce((acc, issue) => {
            acc[issue.priority] = (acc[issue.priority] || 0) + 1;
            return acc;
          }, {}),
          byMethod: uniqueIssues.reduce((acc, issue) => {
            acc[issue.method] = (acc[issue.method] || 0) + 1;
            return acc;
          }, {}),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

