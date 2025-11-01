const axios = require('axios');
const Issue = require('../models/Issue');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { callGemini } = require('../utils/geminiHelper');

// @desc    AI Triage suggestion for an issue
// @route   POST /api/triage/ai
// @access  Private
exports.aiTriage = async (req, res, next) => {
  try {
    const { issueDescription, issueTitle } = req.body;

    if (!issueDescription && !issueTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide issue description or title',
      });
    }

    // If no Gemini API key, return mock response
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: true,
        data: {
          suggestedCategory: 'Bug',
          priority: 'Medium',
          confidence: 0.7,
          duplicateCheck: false,
          analysis: 'Mock AI triage response - Configure GEMINI_API_KEY for real AI analysis',
        },
      });
    }

    // Call Gemini API
    const prompt = `Analyze this software development issue and provide:

1. Suggested category (Bug, Feature, Enhancement, Documentation, etc.)
2. Recommended priority (Low, Medium, High, Critical)
3. A brief analysis of the issue

Issue Title: ${issueTitle || 'N/A'}
Issue Description: ${issueDescription || 'N/A'}

Respond in JSON format only with this structure:
{
  "category": "suggested_category",
  "priority": "Low|Medium|High|Critical",
  "analysis": "brief_analysis_here",
  "confidence": 0.0-1.0
}`;

    const systemInstruction = 'You are a software development triage assistant. Analyze issues and provide actionable insights. Always respond with valid JSON only, no markdown formatting.';

    try {
      const aiAnalysis = await callGemini(prompt, systemInstruction, {
        temperature: 0.3,
        maxTokens: 300,
      });

      // Parse JSON response
      let parsedAnalysis;
      try {
        // Remove markdown code blocks if present
        const cleanAnalysis = aiAnalysis.replace(/```json\n?|\n?```/g, '');
        parsedAnalysis = JSON.parse(cleanAnalysis);
      } catch (parseError) {
        // If JSON parsing fails, extract manually
        parsedAnalysis = {
          category: 'Unknown',
          priority: 'Medium',
          analysis: aiAnalysis,
          confidence: 0.5,
        };
      }

      return res.status(200).json({
        success: true,
        data: {
          suggestedCategory: parsedAnalysis.category || 'Unknown',
          priority: parsedAnalysis.priority || 'Medium',
          confidence: parsedAnalysis.confidence || 0.7,
          duplicateCheck: false,
          analysis: parsedAnalysis.analysis || 'AI analysis completed',
        },
      });
    } catch (geminiError) {
      // Check for quota errors or other Gemini errors
      const errorCode = geminiError.response?.data?.error?.code;
      const errorMessage = geminiError.response?.data?.error?.message || geminiError.message || '';

      if (errorCode === 'RESOURCE_EXHAUSTED' || errorMessage.includes('quota') || errorMessage.includes('quota')) {
        console.log('Gemini quota exceeded - using fallback analysis');
        
        // Provide intelligent fallback based on issue content
        const issueText = `${issueTitle || ''} ${issueDescription || ''}`.toLowerCase();
        let suggestedCategory = 'Bug';
        let priority = 'Medium';
        
        // Simple heuristics for fallback
        if (issueText.includes('critical') || issueText.includes('urgent') || issueText.includes('broken')) {
          priority = 'High';
        } else if (issueText.includes('feature') || issueText.includes('add') || issueText.includes('implement')) {
          suggestedCategory = 'Feature';
          priority = 'Low';
        } else if (issueText.includes('enhance') || issueText.includes('improve')) {
          suggestedCategory = 'Enhancement';
          priority = 'Medium';
        }
        
        return res.status(200).json({
          success: true,
          data: {
            suggestedCategory: suggestedCategory,
            priority: priority,
            confidence: 0.6,
            duplicateCheck: false,
            analysis: `AI quota exceeded. Using fallback analysis based on issue content. Suggested: ${suggestedCategory} with ${priority} priority. Please check your Gemini API quota to enable full AI features.`,
          },
        });
      }

      // For other Gemini errors, return fallback
      console.error('Gemini API Error:', geminiError.response?.data || geminiError.message);
      
      return res.status(200).json({
        success: true,
        data: {
          suggestedCategory: 'Bug',
          priority: 'Medium',
          confidence: 0.5,
          duplicateCheck: false,
          analysis: 'AI service temporarily unavailable. Using default analysis. Please try again later or check your Gemini API configuration.',
        },
      });
    }
  } catch (error) {
    console.error('Unexpected error in AI triage:', error);
    return res.status(200).json({
      success: true,
      data: {
        suggestedCategory: 'Bug',
        priority: 'Medium',
        confidence: 0.5,
        duplicateCheck: false,
        analysis: 'Unable to analyze issue. Using default categorization.',
      },
    });
  }
};

// @desc    Check for duplicate issues
// @route   POST /api/triage/duplicates
// @access  Private
exports.checkDuplicates = async (req, res, next) => {
  try {
    const { issueDescription, projectId } = req.body;

    // Simple duplicate detection based on similar titles/descriptions
    const issues = await Issue.find({ projectId }).select('title description status');

    const duplicates = [];

    // Simple keyword matching (can be enhanced with AI/NLP)
    const keywords = issueDescription.toLowerCase().split(' ').filter((w) => w.length > 3);

    issues.forEach((issue) => {
      const issueText = `${issue.title} ${issue.description}`.toLowerCase();
      let matchCount = 0;

      keywords.forEach((keyword) => {
        if (issueText.includes(keyword)) {
          matchCount++;
        }
      });

      // If more than 30% keywords match, consider it a potential duplicate
      const similarity = matchCount / keywords.length;
      if (similarity > 0.3 && issue.status !== 'Closed') {
        duplicates.push({
          issue,
          similarity: (similarity * 100).toFixed(1) + '%',
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        isDuplicate: duplicates.length > 0,
        potentialDuplicates: duplicates,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply AI triage suggestions to an issue
// @route   POST /api/issues/:id/apply-triage
// @access  Private
exports.applyTriage = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Get AI triage suggestions
    const triageResponse = await this.aiTriage(
      { body: { issueDescription: issue.description, issueTitle: issue.title } },
      res,
      next
    );

    // Apply suggestions to issue
    issue.priority = triageResponse.data.priority;
    issue.labels = [triageResponse.data.suggestedCategory, ...(issue.labels || [])];
    issue.aiTriage = {
      suggestedCategory: triageResponse.data.suggestedCategory,
      confidence: triageResponse.data.confidence,
      duplicateCheck: false,
      analysis: triageResponse.data.analysis,
    };

    await issue.save();

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Smart auto-assignment
// @route   POST /api/triage/auto-assign
// @access  Private
exports.smartAutoAssign = async (req, res, next) => {
  try {
    const { issueId, projectId, title, description, labels } = req.body;

    // Get all users in the project
    const Project = require('../models/Project');
    const project = await Project.findById(projectId).populate('teamId');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Get all issues to find user workload
    const issues = await Issue.find({ projectId }).populate('assignedTo', 'name email');

    // Calculate workload per user
    const workload = {};
    issues.forEach((issue) => {
      if (issue.assignedTo) {
        const userId = issue.assignedTo._id.toString();
        workload[userId] = (workload[userId] || 0) + 1;
      }
    });

    // Simple assignment logic: assign to user with least workload
    // In production, this could use AI to match skills
    let suggestedUser = null;
    let minWorkload = Infinity;

    // Get all users (simplified - in production, get team members)
    const users = await User.find({});
    
    users.forEach((user) => {
      const userId = user._id.toString();
      const userWorkload = workload[userId] || 0;
      if (userWorkload < minWorkload) {
        minWorkload = userWorkload;
        suggestedUser = user;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        suggestedUser: suggestedUser ? {
          _id: suggestedUser._id,
          name: suggestedUser.name,
          email: suggestedUser.email,
        } : null,
        reason: suggestedUser 
          ? `Lowest current workload (${minWorkload} issues assigned)`
          : 'No users available',
        confidence: 0.7,
      },
    });
  } catch (error) {
    next(error);
  }
};

