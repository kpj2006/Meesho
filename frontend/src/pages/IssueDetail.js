import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getIssue } from '../store/slices/issuesSlice';
import { triageAPI, issuesAPI } from '../services/api';

const IssueDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentIssue, loading } = useSelector((state) => state.issues);
  const { user } = useSelector((state) => state.auth);
  
  const [aiTriage, setAiTriage] = useState(null);
  const [loadingTriage, setLoadingTriage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    labels: [],
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    dispatch(getIssue(id));
    fetchComments();
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      // Refresh the issue to get updated status
      dispatch(getIssue(id));
    }
  }, [dispatch, id, location.state]);

  // Initialize edit form when issue loads
  useEffect(() => {
    if (currentIssue) {
      setEditForm({
        title: currentIssue.title || '',
        description: currentIssue.description || '',
        status: currentIssue.status || 'Open',
        priority: currentIssue.priority || 'Medium',
        labels: currentIssue.labels || [],
      });
    }
  }, [currentIssue]);

  const fetchComments = async () => {
    try {
      const response = await issuesAPI.getComments(id);
      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await issuesAPI.createComment(id, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    }
  };

  const handleAITriage = async () => {
    setLoadingTriage(true);
    try {
      const response = await triageAPI.aiTriage({
        issueDescription: currentIssue?.description,
        issueTitle: currentIssue?.title,
      });
      if (response.data.success) {
        setAiTriage(response.data.data);
      } else {
        alert('AI triage failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI Triage error:', error);
      alert('AI triage failed. Please check your Gemini API key or try again later.');
    }
    setLoadingTriage(false);
  };

  const handleSummarizeComments = async () => {
    if (comments.length === 0) {
      setAiResponse('No comments to summarize.');
      return;
    }
    try {
      // Mock AI summary - in production, call AI API
      const summary = `There are ${comments.length} comments on this issue. Key points discussed include implementation details and next steps.`;
      setAiResponse(summary);
    } catch (error) {
      console.error('Error summarizing comments:', error);
    }
  };

  const handleSuggestNextSteps = async () => {
    try {
      // Mock AI suggestion - in production, call AI API
      const suggestion = `Based on the issue description, consider: 1) Reviewing the codebase for similar issues, 2) Testing in a staging environment, 3) Creating a detailed implementation plan.`;
      setAiResponse(suggestion);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    try {
      // Mock AI response - in production, call AI API
      const response = `AI response to: "${aiQuestion}". Based on the issue details, this is a potential solution approach.`;
      setAiResponse(response);
      setAiQuestion('');
    } catch (error) {
      console.error('Error asking AI:', error);
    }
  };

  const handleEditIssue = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      const response = await issuesAPI.updateIssue(id, editForm);
      if (response.data.success) {
        dispatch(getIssue(id)); // Refresh issue
        setShowEditModal(false);
        setSuccessMessage('Issue updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert('Failed to update issue: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update issue error:', error);
      alert('Failed to update issue. Please try again.');
    }
    setEditing(false);
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await issuesAPI.deleteIssue(id);
      if (response.data.success) {
        navigate('/issues');
      } else {
        alert('Failed to delete issue: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete issue error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete issue. Please try again.';
      alert(errorMessage);
    }
  };

  const handleCloseIssue = async () => {
    if (!window.confirm('Are you sure you want to close this issue? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await issuesAPI.closeIssue(id);
      if (response.data.success) {
        setSuccessMessage('Issue closed successfully');
        dispatch(getIssue(id)); // Refresh issue data
      } else {
        alert('Failed to close issue: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Close issue error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to close issue. Please try again.';
      alert(errorMessage);
    }
  };

  if (loading || !currentIssue) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-400">Loading issue...</p>
        </div>
      </div>
    );
  }

  const isResolved = currentIssue.status === 'Resolved' || currentIssue.status === 'Closed';
  
  // Check if current user is the project creator
  const isProjectCreator = currentIssue?.projectId?.createdBy && (
    currentIssue.projectId.createdBy._id === user?.id || 
    currentIssue.projectId.createdBy === user?.id
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-400 mb-6">
          Projects / {currentIssue.projectId?.name || 'Project'} / {currentIssue._id?.slice(-3) || 'Issue'}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-400 hover:text-green-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{currentIssue.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>
                    Created by <span className="font-semibold text-white">
                      {currentIssue.createdBy?.name || 'Unknown User'}
                    </span>
                  </span>
                </div>
                {currentIssue.createdAt && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(currentIssue.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-3 bg-[#1e293b] border border-[#334155] hover:bg-[#334155] text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
              {!isResolved && (
                <Link
                  to={`/issues/${id}/resolve`}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Resolve Issue</span>
                </Link>
              )}
              {currentIssue.status === 'Resolved' && isProjectCreator && (
                <button
                  onClick={handleCloseIssue}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Close Issue</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={currentIssue.status}
              className="px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{currentIssue.description}</p>
            </div>

            {/* Resolution Info */}
            {isResolved && currentIssue.resolution && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-green-400 mb-2">Resolution</h2>
                    <p className="text-gray-300 whitespace-pre-wrap mb-3">
                      {currentIssue.resolution.notes}
                    </p>
                    <div className="text-sm text-gray-400 pt-3 border-t border-[#334155]">
                      {currentIssue.resolution.resolvedBy && (
                        <p>
                          Resolved by <span className="font-semibold text-white">{currentIssue.resolution.resolvedBy.name || 'User'}</span>
                          {currentIssue.resolution.resolvedAt && (
                            <> on {new Date(currentIssue.resolution.resolvedAt).toLocaleString()}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg">
              <div className="flex items-center border-b border-[#334155]">
                {['comments', 'activity', 'attachments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-semibold transition-colors ${
                      activeTab === tab
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="p-6">
                  {/* Add Comment */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="flex items-center justify-end mt-2">
                        <button
                          onClick={handlePostComment}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                          {comment.createdBy?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{comment.createdBy?.name || 'User'}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="text-gray-400">Activity feed coming soon...</div>
                  </div>
                </div>
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <div className="p-6">
                  <div className="text-gray-400">No attachments yet.</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant Panel */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h3 className="text-lg font-bold text-white">AI Assistant</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleSummarizeComments}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors flex items-center gap-2 justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Summarize Comments
                </button>
                <button
                  onClick={handleSuggestNextSteps}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors flex items-center gap-2 justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Suggest Next Steps
                </button>
                <div className="relative mt-4">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                    placeholder="Ask AI..."
                    className="w-full px-4 py-2 pr-10 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAskAI}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                {aiResponse && (
                  <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/50 rounded-lg">
                    <p className="text-sm text-gray-300">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details Panel */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Assignee</p>
                  {currentIssue.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-xs">
                        {currentIssue.assignedTo.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white">{currentIssue.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Unassigned</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Reporter</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      {currentIssue.createdBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white">{currentIssue.createdBy?.name || 'User'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Priority</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                    currentIssue.priority === 'Critical' || currentIssue.priority === 'High'
                      ? 'bg-red-500/20 text-red-300 border-red-500/50'
                      : currentIssue.priority === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                      : 'bg-green-500/20 text-green-300 border-green-500/50'
                  }`}>
                    {currentIssue.priority === 'High' && '↑'}
                    {currentIssue.priority === 'Low' && '↓'}
                    {currentIssue.priority}
                  </span>
                </div>
                {currentIssue.labels && currentIssue.labels.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Labels</p>
                    <div className="flex flex-wrap gap-2">
                      {currentIssue.labels.map((label, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/50"
                        >
                          {label}
                        </span>
                      ))}
                      <button className="text-xs text-gray-400 hover:text-white">
                        + Add label
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Created</p>
                  <p className="text-sm text-gray-300">
                    {new Date(currentIssue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Updated</p>
                  <p className="text-sm text-gray-300">
                    {new Date(currentIssue.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isResolved && (
                <Link
                  to={`/issues/${id}/resolve`}
                  className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold text-center transition-colors"
                >
                  Resolve Issue
                </Link>
              )}
              {currentIssue.status === 'Resolved' && isProjectCreator && (
                <button
                  onClick={handleCloseIssue}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-white font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close Issue
                </button>
              )}
              <button 
                onClick={handleDeleteIssue}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Issue Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Issue</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditIssue} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Priority <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={editing}
                  className="px-6 py-3 bg-[#334155] hover:bg-[#475569] rounded-lg text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueDetail;
