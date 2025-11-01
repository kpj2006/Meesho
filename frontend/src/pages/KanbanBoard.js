import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProject } from '../store/slices/projectsSlice';
import { getIssues } from '../store/slices/issuesSlice';
import { issuesAPI, triageAPI } from '../services/api';

const KanbanBoard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProject } = useSelector((state) => state.projects);
  const { issues } = useSelector((state) => state.issues);
  
  const [projectIssues, setProjectIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTask, setSuggestedTask] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [view, setView] = useState('board'); // board, list, gantt

  useEffect(() => {
    dispatch(getProject(id));
    dispatch(getIssues({ projectId: id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (issues) {
      const filtered = issues.filter(issue => 
        issue.projectId && (issue.projectId._id === id || issue.projectId === id)
      );
      setProjectIssues(filtered);
    }
  }, [issues, id]);

  const handleSuggestNextTask = async () => {
    setLoadingSuggestion(true);
    try {
      const openIssues = projectIssues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed');
      if (openIssues.length === 0) {
        alert('No open issues to suggest');
        setLoadingSuggestion(false);
        return;
      }

      // Use AI to suggest next task
      const response = await triageAPI.smartAutoAssign({
        projectId: id,
        title: 'Next task suggestion',
        description: 'Suggest the next task to work on',
      });

      if (response.data.success && openIssues.length > 0) {
        // Pick a random open issue for now (in production, use AI logic)
        const randomIssue = openIssues[Math.floor(Math.random() * openIssues.length)];
        setSuggestedTask(randomIssue);
      }
    } catch (error) {
      console.error('Error suggesting task:', error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await issuesAPI.updateIssue(issueId, { status: newStatus });
      dispatch(getIssues({ projectId: id }));
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Failed to update issue status');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'Low':
        return (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const columns = [
    { id: 'open', title: 'To Do', status: 'Open' },
    { id: 'in-progress', title: 'In Progress', status: 'In Progress' },
    { id: 'done', title: 'Done', status: 'Resolved' },
  ];

  const filteredIssues = projectIssues.filter(issue =>
    searchQuery === '' || 
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIssuesByStatus = (status) => {
    return filteredIssues.filter(issue => issue.status === status);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">{currentProject?.name || 'Project'}</h1>
          </div>
          <div className="text-sm text-gray-400">
            Projects / {currentProject?.name || 'Project'} / Board
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#334155] transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Assignee
            </button>
            <button className="px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#334155] transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tags
            </button>
            <button
              onClick={handleSuggestNextTask}
              disabled={loadingSuggestion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loadingSuggestion ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              Suggest Next Task
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('board')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'board'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1e293b] border border-[#334155] text-gray-400 hover:bg-[#334155]'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1e293b] border border-[#334155] text-gray-400 hover:bg-[#334155]'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('gantt')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'gantt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1e293b] border border-[#334155] text-gray-400 hover:bg-[#334155]'
              }`}
            >
              Gantt
            </button>
          </div>
        </div>

        {/* Suggested Task Banner */}
        {suggestedTask && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <p className="font-semibold text-white">Suggested Next Task</p>
                <Link to={`/issues/${suggestedTask._id}`} className="text-blue-400 hover:text-blue-300">
                  {suggestedTask.title}
                </Link>
              </div>
            </div>
            <button
              onClick={() => setSuggestedTask(null)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Kanban Board */}
        {view === 'board' && (
          <div className="grid grid-cols-3 gap-4">
            {columns.map((column) => {
              const columnIssues = getIssuesByStatus(column.status);
              return (
                <div key={column.id} className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{column.title}</h3>
                    <span className="px-2 py-1 bg-[#0f172a] rounded text-sm text-gray-400">
                      {columnIssues.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {columnIssues.map((issue) => (
                      <Link
                        key={issue._id}
                        to={`/issues/${issue._id}`}
                        className="block p-4 bg-[#0f172a] border border-[#334155] rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm">{issue.title}</h4>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-mono">
                              {issue.projectId?.name?.substring(0, 3).toUpperCase() || 'PROJ'}-{issue._id.slice(-3)}
                            </span>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(issue.priority)}
                              <span className="text-xs text-gray-400">{issue.priority}</span>
                            </div>
                          </div>
                          {issue.assignedTo && (
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
                              {issue.assignedTo.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                    {columnIssues.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No issues
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Issue Button */}
        <div className="mt-6">
          <Link
            to={`/issues/new?projectId=${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Issue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;

