import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getIssues } from '../store/slices/issuesSlice';
import { analyticsAPI } from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const dispatch = useDispatch();
  const { issues } = useSelector((state) => state.issues);
  const [velocityData, setVelocityData] = useState([]);
  const [burndownData, setBurndownData] = useState([]);
  const [capacityData, setCapacityData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');

  useEffect(() => {
    dispatch(getIssues());
    fetchAnalytics();
  }, [dispatch, timeFilter]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = timeFilter === 'Last 7 Days' ? 7 : timeFilter === 'Last 90 Days' ? 90 : 30;
      
      // Fetch velocity data
      const velocityResponse = await analyticsAPI.getVelocity({ days });
      if (velocityResponse.data.success) {
        const velocity = velocityResponse.data.data;
        
        // Convert weekly velocity to chart format
        const weeklyData = Object.entries(velocity.weeklyVelocity || {}).map(([week, count]) => ({
          week: week.replace('W', ' Week '),
          velocity: count,
        })).sort((a, b) => {
          // Sort by week number
          const weekA = parseInt(a.week.split(' ')[0]);
          const weekB = parseInt(b.week.split(' ')[0]);
          return weekA - weekB;
        }).slice(-6); // Show last 6 weeks
        setVelocityData(weeklyData);
        
        // Calculate metrics
        const resolvedCount = velocity.totalResolved || 0;
        const avgVelocity = parseFloat(velocity.averageWeekly || 0);
        
        setMetrics({
          issuesCompleted: resolvedCount,
          issuesCompletedChange: '+0%', // Can be calculated with previous period
          currentVelocity: Math.round(avgVelocity),
          velocityChange: '+0%', // Can be calculated with previous period
          projectedCompletion: calculateProjectedCompletion(resolvedCount, avgVelocity, issues),
          completionChange: '+0%',
        });
      }

      // Fetch burndown data
      const burndownResponse = await analyticsAPI.getBurndown({ days });
      if (burndownResponse.data.success) {
        const burndown = burndownResponse.data.data.burndown || {};
        const dates = Object.keys(burndown).sort();
        
        // Calculate ideal burndown (linear decrease)
        const totalAtStart = burndown[dates[0]]?.total || 0;
        const totalDays = dates.length;
        
        const burndownChartData = dates.map((date, index) => {
          const dayData = burndown[date];
          const idealRemaining = totalDays > 0 
            ? Math.max(0, totalAtStart - (totalAtStart / totalDays) * index)
            : totalAtStart;
          
          return {
            day: `Day ${index + 1}`,
            remaining: dayData.remaining || 0,
            ideal: Math.round(idealRemaining),
          };
        });
        setBurndownData(burndownChartData);
      }

      // Fetch capacity data
      const capacityResponse = await analyticsAPI.getCapacity();
      if (capacityResponse.data.success) {
        setCapacityData(capacityResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default empty data on error
      setVelocityData([]);
      setBurndownData([]);
      setMetrics({
        issuesCompleted: 0,
        issuesCompletedChange: '+0%',
        currentVelocity: 0,
        velocityChange: '+0%',
        projectedCompletion: 'N/A',
        completionChange: '+0%',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProjectedCompletion = (resolved, avgVelocity, allIssues) => {
    if (!allIssues || allIssues.length === 0) return 'N/A';
    
    const openIssues = allIssues.filter(i => 
      i.status !== 'Resolved' && i.status !== 'Closed'
    ).length;
    
    if (openIssues === 0) return 'Completed';
    if (avgVelocity === 0) return 'N/A';
    
    const weeksRemaining = Math.ceil(openIssues / avgVelocity);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (weeksRemaining * 7));
    
    return completionDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Process issues data for charts
  const statusData = issues?.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const priorityData = issues?.reduce((acc, issue) => {
    acc[issue.priority] = (acc[issue.priority] || 0) + 1;
    return acc;
  }, {}) || {};

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value,
  }));

  const priorityChartData = Object.entries(priorityData).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate summary stats
  const totalIssues = issues?.length || 0;
  const resolvedIssues = issues?.filter(i => i.status === 'Resolved' || i.status === 'Closed').length || 0;
  const openIssues = issues?.filter(i => i.status === 'Open').length || 0;
  const inProgressIssues = issues?.filter(i => i.status === 'In Progress').length || 0;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Project Analytics & Insights</h1>
          <p className="text-gray-400">A comprehensive overview of your team's performance and predictions.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8">
          {['Last 30 Days', 'Last 7 Days', 'Last 90 Days'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1e293b] border border-[#334155] text-gray-400 hover:bg-[#334155]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total Issues</p>
            <p className="text-4xl font-bold text-white mb-2">{totalIssues}</p>
            <p className="text-sm text-gray-500">All time</p>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Issues Completed</p>
            <p className="text-4xl font-bold text-white mb-2">{metrics?.issuesCompleted || resolvedIssues}</p>
            <p className="text-sm text-green-400">{timeFilter}</p>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Current Velocity</p>
            <p className="text-4xl font-bold text-white mb-2">{metrics?.currentVelocity || 0}</p>
            <p className="text-sm text-gray-500">issues/week</p>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Projected Completion</p>
            <p className="text-2xl font-bold text-white mb-2">{metrics?.projectedCompletion || 'N/A'}</p>
            <p className="text-sm text-gray-500">estimated</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Open Issues</p>
            <p className="text-3xl font-bold text-yellow-400">{openIssues}</p>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">In Progress</p>
            <p className="text-3xl font-bold text-blue-400">{inProgressIssues}</p>
            <p className="text-xs text-gray-500 mt-1">Being worked on</p>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-green-400">
              {totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">{resolvedIssues} of {totalIssues} resolved</p>
          </div>
        </div>

        {/* Team Capacity */}
        {capacityData && capacityData.workload && capacityData.workload.length > 0 && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Team Workload</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Open Issues</p>
                <p className="text-2xl font-bold text-white">{capacityData.totalOpen || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Assigned Issues</p>
                <p className="text-2xl font-bold text-white">
                  {(capacityData.totalOpen || 0) - (capacityData.unassigned || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Unassigned Issues</p>
                <p className="text-2xl font-bold text-yellow-400">{capacityData.unassigned || 0}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-gray-300 font-semibold mb-3">Workload by User</h4>
              <div className="space-y-2">
                {capacityData.workload.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-xs">
                        {item.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{item.user?.email || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Open</p>
                        <p className="text-white font-semibold">{item.openIssues || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">In Progress</p>
                        <p className="text-blue-400 font-semibold">{item.inProgress || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Velocity Chart */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Team Velocity</h3>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : velocityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="velocity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">No velocity data available</div>
            )}
          </div>

          {/* Issues Trend Chart */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Issues Trend</h3>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : burndownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal" />
                  <Line type="monotone" dataKey="remaining" stroke="#3b82f6" strokeWidth={2} name="Remaining Issues" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">No trend data available</div>
            )}
          </div>

          {/* Issues by Status */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Issues by Status</h3>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">No data available</div>
            )}
          </div>

          {/* Issues by Priority */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Issues by Priority</h3>
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
