import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getIssue } from '../store/slices/issuesSlice';
import { issuesAPI } from '../services/api';

const IssueResolution = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentIssue, loading } = useSelector((state) => state.issues);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(getIssue(id));
  }, [dispatch, id]);

  const handleResolve = async (e) => {
    e.preventDefault();
    
    if (!resolutionNotes.trim()) {
      setError('Please provide resolution notes explaining how the issue was resolved.');
      return;
    }

    setResolving(true);
    setError('');

    try {
      const response = await issuesAPI.resolveIssue(id, { resolutionNotes });
      console.log('Resolve response:', response);
      
      if (response?.data?.success) {
        // Redirect to issue detail page
        navigate(`/issues/${id}`, { 
          replace: true,
          state: { message: 'Issue resolved successfully!' } 
        });
      } else {
        setError(response?.data?.message || 'Failed to resolve issue');
      }
    } catch (err) {
      console.error('Resolve error:', err);
      const errorMessage = err.response?.data?.message || 
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to resolve issue. Please try again.';
      setError(errorMessage);
    } finally {
      setResolving(false);
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

  // Check if already resolved
  if (currentIssue.status === 'Resolved' || currentIssue.status === 'Closed') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                  Issue Already Resolved
                </h3>
                <p className="text-gray-300">
                  This issue has already been marked as <strong className="text-white">{currentIssue.status}</strong>.
                </p>
                {currentIssue.resolution && (
                  <div className="mt-4 pt-4 border-t border-[#334155]">
                    <p className="text-sm font-medium text-yellow-400 mb-1">Resolution Notes:</p>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{currentIssue.resolution.notes}</p>
                    {currentIssue.resolution.resolvedBy && (
                      <p className="text-xs text-gray-400 mt-2">
                        Resolved by <span className="text-white font-semibold">{currentIssue.resolution.resolvedBy.name || 'User'}</span> on{' '}
                        {new Date(currentIssue.resolution.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/issues/${id}`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Issue</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/issues/${id}`)}
            className="text-gray-400 hover:text-white mb-4 flex items-center transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Issue
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Resolve Issue</h1>
              <p className="text-gray-400 mt-1">Mark this issue as resolved and document the solution</p>
            </div>
          </div>
        </div>

        {/* Issue Summary Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 border border-blue-500/50 rounded-lg">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Issue Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{currentIssue.title}</h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap bg-[#0f172a] p-4 rounded-lg border border-[#334155]">
                {currentIssue.description}
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-3 pt-3 border-t border-[#334155]">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentIssue.status === 'Open'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                  : currentIssue.status === 'In Progress'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'bg-green-500/20 text-green-300 border border-green-500/50'
              }`}>
                {currentIssue.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                currentIssue.priority === 'Critical'
                  ? 'bg-red-500/20 text-red-300 border-red-500/50'
                  : currentIssue.priority === 'High'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                  : currentIssue.priority === 'Medium'
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                  : 'bg-green-500/20 text-green-300 border-green-500/50'
              }`}>
                {currentIssue.priority}
              </span>
              {currentIssue.projectId && (
                <span className="text-sm text-gray-300 bg-[#0f172a] px-3 py-1 rounded-full border border-[#334155]">
                  <span className="font-medium">{currentIssue.projectId.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Form */}
        <form onSubmit={handleResolve} className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 border border-green-500/50 rounded-lg">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Resolution Information</h2>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-white font-semibold mb-2 text-lg">
              Resolution Notes <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-gray-400 mb-3">
              Describe how this issue was resolved. Include any steps taken, fixes applied, or workarounds implemented.
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => {
                setResolutionNotes(e.target.value);
                setError('');
              }}
              rows={10}
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
              placeholder="Example: Fixed the authentication bug by updating the JWT token validation logic. Added proper error handling for expired tokens..."
              required
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
              <span>{resolutionNotes.length} characters</span>
              {resolutionNotes.trim().length > 0 && (
                <span className="text-green-400">✓ Ready to submit</span>
              )}
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1 text-blue-400">What happens when you resolve an issue?</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>The issue status will be changed to "Resolved"</li>
                  <li>Your resolution notes will be saved for future reference</li>
                  <li>The issue will show who resolved it and when</li>
                  <li>Any user on the platform can resolve issues</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[#334155]">
            <button
              type="button"
              onClick={() => navigate(`/issues/${id}`)}
              className="px-6 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resolving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving || !resolutionNotes.trim()}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {resolving ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  <span>Resolving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Mark as Resolved</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueResolution;

