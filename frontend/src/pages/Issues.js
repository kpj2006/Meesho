import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getIssues } from '../store/slices/issuesSlice';
import { Link, useSearchParams } from 'react-router-dom';

const Issues = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { issues, loading } = useSelector((state) => state.issues);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    // Get search query from URL
    const searchQuery = searchParams.get('search');
    const initialFilter = {};
    
    if (searchQuery) {
      initialFilter.search = searchQuery;
    }
    
    setFilter(initialFilter);
    dispatch(getIssues(initialFilter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchParams]);

  const handleFilterChange = (key, value) => {
    // Preserve search query if it exists
    const searchQuery = searchParams.get('search');
    const newFilter = { ...filter, [key]: value || undefined };
    if (searchQuery) {
      newFilter.search = searchQuery;
    }
    setFilter(newFilter);
    dispatch(getIssues(newFilter));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Issues</h1>
            {searchParams.get('search') && (
              <p className="text-gray-400 mt-2">
                Searching for: <span className="text-blue-400 font-semibold">"{searchParams.get('search')}"</span>
              </p>
            )}
          </div>
          <Link
            to="/issues/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 font-semibold mb-2">Status</label>
            <select
              value={filter.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 font-semibold mb-2">Priority</label>
            <select
              value={filter.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : issues?.length > 0 ? (
        <div className="space-y-4">
          {issues.map((issue) => {
            const isResolved = issue.status === 'Resolved' || issue.status === 'Closed';
            return (
              <div
                key={issue._id}
                className="block bg-[#1e293b] border border-[#334155] rounded-lg p-6 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <Link to={`/issues/${issue._id}`} className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
                      {issue.title}
                    </h3>
                    <p className="text-gray-400 mb-3">
                      {issue.description?.substring(0, 150)}
                      {issue.description?.length > 150 ? '...' : ''}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                      {issue.assignedTo && (
                        <span>Assigned to: {issue.assignedTo.name}</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          issue.status === 'Open'
                            ? 'badge-status-open'
                            : issue.status === 'In Progress'
                            ? 'badge-status-progress'
                            : 'badge-status-resolved'
                        }`}
                      >
                        {issue.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          issue.priority === 'Critical'
                            ? 'badge-priority-critical'
                            : issue.priority === 'High'
                            ? 'badge-priority-high'
                            : issue.priority === 'Medium'
                            ? 'badge-priority-medium'
                            : 'badge-priority-low'
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </div>
                    {!isResolved && (
                      <Link
                        to={`/issues/${issue._id}/resolve`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Resolve</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg">No issues found</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default Issues;

