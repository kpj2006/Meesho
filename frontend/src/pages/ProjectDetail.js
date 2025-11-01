import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProject } from '../store/slices/projectsSlice';
import { getIssues } from '../store/slices/issuesSlice';
import { projectsAPI } from '../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, loading } = useSelector((state) => state.projects);
  const { issues } = useSelector((state) => state.issues);
  const { user } = useSelector((state) => state.auth);
  
  const [projectIssues, setProjectIssues] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [showOrderedView, setShowOrderedView] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(getProject(id));
    dispatch(getIssues({ projectId: id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (issues && issues.length > 0) {
      const filtered = issues.filter(issue => 
        issue.projectId && (issue.projectId._id === id || issue.projectId === id)
      );
      setProjectIssues(filtered);
    }
  }, [issues, id]);

  const handleAnalyzeProject = async () => {
    setLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const response = await projectsAPI.analyzeProject(id);
      if (response.data.success) {
        setAnalysis(response.data.data);
        setShowOrderedView(true);
      } else {
        alert('Analysis failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Project analysis error:', error);
      alert('Analysis failed. Please check your Gemini API key or try again later.');
    }
    setLoadingAnalysis(false);
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      const response = await projectsAPI.deleteProject(id);
      if (response.data.success) {
        navigate('/projects');
      } else {
        alert('Failed to delete project: ' + (response.data.message || 'Unknown error'));
        setDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Delete project error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete project. Please try again.';
      alert(errorMessage);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Check if current user is the creator
  const isCreator = currentProject?.createdBy && user?.id && (
    (typeof currentProject.createdBy === 'object' && currentProject.createdBy._id === user.id) ||
    (typeof currentProject.createdBy === 'string' && currentProject.createdBy === user.id) ||
    currentProject.createdBy === user.id
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get ordered issues based on analysis or priority
  const getOrderedIssues = () => {
    if (analysis && analysis.resolutionOrder && showOrderedView) {
      // Create a map of issueId to order
      const orderMap = {};
      analysis.resolutionOrder.forEach((item, idx) => {
        orderMap[item.issueId] = idx + 1;
      });
      
      // Sort issues by analysis order
      return [...projectIssues].sort((a, b) => {
        const orderA = orderMap[a._id] || 999;
        const orderB = orderMap[b._id] || 999;
        return orderA - orderB;
      });
    }
    
    // Default priority-based order
    const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return [...projectIssues].sort((a, b) => {
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  };

  if (loading || !currentProject) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  const orderedIssues = getOrderedIssues();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{currentProject.name}</h1>
              <p className="text-gray-400 mb-2">{currentProject.description || 'No description'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>
                  Created by <span className="font-semibold text-white">
                    {currentProject.createdBy?.name || 'Unknown User'}
                  </span>
                  {currentProject.createdAt && (
                    <> on {new Date(currentProject.createdAt).toLocaleDateString()}</>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentProject?.githubRepo?.url && (
                <a
                  href={currentProject.githubRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </a>
              )}
              <Link
                to={`/projects/${id}/board`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Board View
              </Link>
              {isCreator && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Project
                </button>
              )}
              <Link
                to="/projects"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Projects
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Issues</p>
              <p className="text-2xl font-bold text-white">{projectIssues.length}</p>
            </div>
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Open</p>
              <p className="text-2xl font-bold text-yellow-400">
                {projectIssues.filter(i => i.status === 'Open').length}
              </p>
            </div>
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">
                {projectIssues.filter(i => i.status === 'In Progress').length}
              </p>
            </div>
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-400">
                {projectIssues.filter(i => i.status === 'Resolved').length}
              </p>
            </div>
          </div>

        {/* AI Analysis Button */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">🤖 AI Project Analysis</h2>
              <p className="text-gray-400">
                Get intelligent insights and optimal resolution order for all project issues
              </p>
            </div>
            <button
              onClick={handleAnalyzeProject}
              disabled={loadingAnalysis || projectIssues.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loadingAnalysis ? '⚡ Analyzing...' : '🔮 Analyze Project'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Results */}
      {analysis && (
        <div className="bg-purple-500/10 border-2 border-purple-500/50 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">📊 AI Analysis Results</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold text-gray-300 mb-2">Summary</h3>
            <p className="text-gray-300 bg-[#1e293b] border border-[#334155] rounded p-4">{analysis.summary}</p>
          </div>

          {analysis.priorityBreakdown && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-300 mb-2">Priority Breakdown</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(analysis.priorityBreakdown).map(([priority, count]) => (
                  <div key={priority} className={`${getPriorityColor(priority)} rounded-lg p-3 text-center border`}>
                    <p className="text-sm font-semibold">{priority}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-300 mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 bg-[#1e293b] border border-[#334155] rounded p-4">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-gray-300">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-4">
            <button
              onClick={() => setShowOrderedView(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              ✓ Show Resolution Order
            </button>
            <button
              onClick={() => setShowOrderedView(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              View All Issues
            </button>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {showOrderedView && analysis ? '📋 Recommended Resolution Order' : 'All Issues'}
          </h2>
          <Link
            to={{
              pathname: '/issues/new',
              search: `?projectId=${id}`
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Issue
          </Link>
        </div>

        {projectIssues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No issues found in this project</p>
            <Link
              to={{
                pathname: '/issues/new',
                search: `?projectId=${id}`
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Create your first issue →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderedIssues.map((issue, idx) => {
              const orderInfo = analysis?.resolutionOrder?.find(item => item.issueId === issue._id);
              
              return (
                <Link
                  key={issue._id}
                  to={`/issues/${issue._id}`}
                  className="block border border-[#334155] rounded-lg p-6 hover:border-blue-500/50 bg-[#0f172a] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {showOrderedView && analysis && orderInfo && (
                          <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            #{idx + 1}
                          </div>
                        )}
                        <h3 className="text-xl font-semibold text-white">{issue.title}</h3>
                      </div>
                      
                      {showOrderedView && analysis && orderInfo && orderInfo.reason && (
                        <div className="mb-2">
                          <p className="text-sm text-purple-300 bg-purple-500/20 border border-purple-500/50 rounded px-3 py-1 inline-block">
                            💡 {orderInfo.reason}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-gray-400 mb-3">
                        {issue.description?.substring(0, 150)}
                        {issue.description?.length > 150 ? '...' : ''}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                        {issue.assignedTo && (
                          <span>Assigned: {issue.assignedTo.name}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        issue.status === 'Open' ? 'badge-status-open' :
                        issue.status === 'In Progress' ? 'badge-status-progress' :
                        'badge-status-resolved'
                      }`}>
                        {issue.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(issue.priority)} border`}>
                        {issue.priority}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border-2 border-red-500/50 rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Delete Project</h2>
            </div>
            <p className="text-gray-300 mb-2">
              Are you sure you want to delete <strong className="text-white">{currentProject?.name}</strong>?
            </p>
            <p className="text-sm text-red-400 mb-6">
              ⚠️ This will permanently delete the project and all associated issues. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleting(false);
                }}
                disabled={deleting}
                className="px-6 py-2.5 bg-[#334155] hover:bg-[#475569] rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
