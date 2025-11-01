import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getIssues } from '../store/slices/issuesSlice';
import { getProjects } from '../store/slices/projectsSlice';
import { Link, useNavigate } from 'react-router-dom';
import { activitiesAPI, tasksAPI, notificationsAPI } from '../services/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { issues, loading: issuesLoading } = useSelector((state) => state.issues);
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  
  const [activities, setActivities] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    dispatch(getIssues());
    dispatch(getProjects());
    fetchActivities();
    fetchMyTasks();
    fetchNotifications();
  }, [dispatch, user]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-trigger')) {
        setShowNewMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activitiesAPI.getActivities({ limit: 10 });
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchMyTasks = async () => {
    try {
      // Fetch only tasks assigned to current user (even for admins)
      const response = await tasksAPI.getTasks({ myTasksOnly: true });
      if (response.data.success) {
        setMyTasks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications({ limit: 10, unreadOnly: false });
      if (response.data.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.data?.filter(n => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to issues page with search query
    navigate(`/issues?search=${encodeURIComponent(searchQuery)}`);
  };

  const stats = [
    {
      name: 'My Open Tasks',
      value: myTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length,
      change: myTasks.filter(t => t.status === 'pending').length > 0 ? `${myTasks.filter(t => t.status === 'pending').length} pending` : 'All clear',
      changeType: myTasks.filter(t => t.status === 'pending').length > 0 ? 'positive' : 'neutral',
      indicator: '',
    },
    {
      name: 'In Progress',
      value: myTasks.filter(t => t.status === 'in-progress').length,
      change: 'Active tasks',
      changeType: 'neutral',
    },
    {
      name: 'Completed',
      value: myTasks.filter(t => t.status === 'completed').length,
      change: 'Tasks done',
      changeType: 'positive',
    },
    {
      name: 'Upcoming Deadlines',
      value: myTasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return dueDate <= nextWeek && t.status !== 'completed';
      }).length,
      change: 'In the next 7 days',
      changeType: 'neutral',
    },
  ];

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return past.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'Low':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-400">Here's a summary of your projects and tasks.</p>
        </div>

        {/* Top Search Bar */}
        <div className="mb-8 flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, projects, issues..."
              className="w-full px-4 py-3 pl-12 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
          
          {/* New Button with Dropdown */}
          <div className="relative dropdown-trigger">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showNewMenu && (
              <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl z-50">
                <Link
                  to="/issues/new"
                  onClick={() => setShowNewMenu(false)}
                  className="block px-4 py-3 text-white hover:bg-[#334155] transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Issue
                </Link>
                <Link
                  to="/projects/new"
                  onClick={() => setShowNewMenu(false)}
                  className="block px-4 py-3 text-white hover:bg-[#334155] transition-colors flex items-center gap-2 border-t border-[#334155]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  New Project
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/tasks"
                    onClick={() => setShowNewMenu(false)}
                    className="block px-4 py-3 text-white hover:bg-[#334155] transition-colors flex items-center gap-2 border-t border-[#334155]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Assign Task
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Notifications Button with Dropdown */}
          <div className="relative dropdown-trigger">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-3 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#334155] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="dropdown-menu absolute right-0 mt-2 w-80 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-[#334155] flex items-center justify-between">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-80">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        onClick={() => handleMarkAsRead(notification._id)}
                        className={`px-4 py-3 hover:bg-[#334155] transition-colors cursor-pointer border-b border-[#334155] ${
                          !notification.read ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <p className="text-sm text-white">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400">
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold cursor-pointer hover:ring-2 ring-blue-400 transition-all">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">{stat.name}</p>
              <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
              <p className={`text-sm ${
                stat.changeType === 'positive' ? 'text-green-400' :
                stat.changeType === 'negative' ? 'text-red-400' :
                'text-orange-400'
              }`}>
                {stat.change} {stat.indicator || ''}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Tasks Section */}
          <div className="lg:col-span-2 bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">My Tasks</h2>
              <Link to="/tasks" className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1">
                View All Tasks
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myTasks.length > 0 ? (
              <div className="space-y-4">
                <div className="hidden lg:grid grid-cols-12 gap-4 text-xs text-gray-400 mb-2 pb-2 border-b border-[#334155]">
                  <div className="col-span-5">Task</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-3">Due Date</div>
                </div>
                {myTasks.slice(0, 5).map((task) => (
                  <Link
                    key={task._id}
                    to="/tasks"
                    className="block p-4 bg-[#0f172a] border border-[#334155] rounded-lg hover:bg-[#1e293b] transition-colors cursor-pointer"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 lg:col-span-5">
                        <p className="font-semibold text-white">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                      <div className="col-span-6 lg:col-span-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          task.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                          task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' :
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="col-span-6 lg:col-span-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="col-span-12 lg:col-span-3 text-sm text-gray-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No tasks assigned to you yet.</p>
                <Link to="/tasks" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm">
                  Go to Tasks →
                </Link>
              </div>
            )}
          </div>

          {/* Team Activity Section */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Team Activity</h2>

            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 10).map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0">
                      {activity.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-white">{activity.user?.name || 'User'}</span>
                        {' '}
                        {(activity.type === 'issue_created' || activity.type === 'task_created') && 'created'}
                        {(activity.type === 'issue_updated' || activity.type === 'task_updated') && 'updated'}
                        {(activity.type === 'issue_comment_added' || activity.type === 'comment_added') && 'commented on'}
                        {(activity.type === 'issue_resolved' || activity.type === 'task_completed') && 'completed'}
                        {(activity.type === 'task_assigned' || activity.type === 'issue_assigned') && 'assigned'}
                        {' '}
                        {activity.task && (
                          <>
                            <span className="font-medium text-blue-400">task "{activity.task.title}"</span>
                            {activity.project && (
                              <span className="text-gray-500"> in {activity.project.name}</span>
                            )}
                          </>
                        )}
                        {activity.issue && !activity.task && (
                          <>
                            <span className="font-medium text-blue-400">issue "{activity.issue.title}"</span>
                            {activity.project && (
                              <span className="text-gray-500"> in {activity.project.name}</span>
                            )}
                          </>
                        )}
                        {activity.project && !activity.issue && !activity.task && (
                          <span className="font-medium text-blue-400">project "{activity.project.name}"</span>
                        )}
                        {!activity.issue && !activity.task && !activity.project && activity.description && (
                          <span className="text-gray-400">{activity.description}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No recent activity</p>
                <p className="text-xs mt-2">Activity will appear here as team members create issues, complete tasks, and make updates</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
