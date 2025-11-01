import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { tasksAPI } from '../services/api';

const UserTasks = () => {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [filter, user]);

  const fetchTasks = async () => {
    try {
      const params = {
        myTasksOnly: true, // Always fetch only tasks assigned to current user (even for admins)
        ...(filter !== 'all' ? { status: filter === 'completed' ? 'completed' : filter } : {}),
      };
      const response = await tasksAPI.getTasks(params);
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    if (!completionNotes.trim()) {
      alert('Please provide completion notes');
      return;
    }

    setCompleting(true);
    try {
      const response = await tasksAPI.completeTask(taskId, { completionNotes });
      if (response.data.success) {
        setSelectedTask(null);
        setCompletionNotes('');
        fetchTasks();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete task');
    } finally {
      setCompleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'cancelled': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Tasks</h1>
          <p className="text-gray-400">View and complete tasks assigned to you ({user?.name || 'User'})</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pending Tasks</p>
                <p className="text-3xl font-bold text-white">{pendingTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">In Progress</p>
                <p className="text-3xl font-bold text-white">{inProgressTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{completedTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-4 border-b border-[#334155]">
          {['all', 'pending', 'in-progress', 'completed'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`pb-4 px-4 font-semibold transition-colors capitalize ${
                filter === filterOption
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filterOption.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-300 mb-4">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {task.projectId && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {task.projectId.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.assignedBy && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Assigned by: {task.assignedBy.name}
                      </span>
                    )}
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                      {task.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {task.status === 'completed' && task.completionNotes && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                      <p className="text-sm font-semibold text-green-400 mb-1">Completion Notes:</p>
                      <p className="text-sm text-gray-300">{task.completionNotes}</p>
                    </div>
                  )}
                </div>
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="ml-4 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-12 text-center text-gray-400">
              No tasks found. {filter !== 'all' && `No ${filter.replace('-', ' ')} tasks.`}
            </div>
          )}
        </div>
      </div>

      {/* Complete Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Complete Task</h2>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setCompletionNotes('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedTask.title}</h3>
              {selectedTask.description && (
                <p className="text-gray-300 mb-4">{selectedTask.description}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 font-semibold mb-2">
                Completion Notes <span className="text-red-400">*</span>
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Describe what you did to complete this task..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setCompletionNotes('');
                }}
                disabled={completing}
                className="px-6 py-3 bg-[#334155] hover:bg-[#475569] rounded-lg text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleComplete(selectedTask._id)}
                disabled={completing || !completionNotes.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {completing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mark as Completed</span>
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

export default UserTasks;

