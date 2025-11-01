import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createIssue, getIssues } from '../store/slices/issuesSlice';
import { getProjects } from '../store/slices/projectsSlice';
import { triageAPI } from '../services/api';

const CreateIssue = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const projectIdFromUrl = searchParams.get('projectId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    projectId: projectIdFromUrl || '',
    labels: [],
  });

  useEffect(() => {
    dispatch(getProjects());
    if (projectIdFromUrl) {
      setFormData(prev => ({ ...prev, projectId: projectIdFromUrl }));
    }
  }, [dispatch, projectIdFromUrl]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAITriage = async () => {
    if (!formData.title && !formData.description) {
      alert('Please enter title or description first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await triageAPI.aiTriage({
        issueTitle: formData.title,
        issueDescription: formData.description,
      });
      
      if (response.data.success) {
        const suggestions = response.data.data;
        setFormData({
          ...formData,
          priority: suggestions.priority || formData.priority,
          labels: suggestions.suggestedCategory ? [suggestions.suggestedCategory] : formData.labels,
        });
        alert(`AI suggested: Priority = ${suggestions.priority}, Category = ${suggestions.suggestedCategory}`);
      }
    } catch (error) {
      console.error('AI Triage error:', error);
      alert('AI triage failed. You can still proceed manually.');
    }
    setAiLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.projectId) {
      alert('Please select a project');
      return;
    }

    setLoading(true);
    try {
      await dispatch(createIssue(formData)).unwrap();
      dispatch(getIssues());
      navigate('/issues');
    } catch (error) {
      console.error('Create issue error:', error);
      alert('Failed to create issue. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Create New Issue</h1>
          <button
            onClick={() => navigate('/issues')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Issues
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-lg p-8">
        {/* AI Triage Button */}
        <div className="mb-6 text-right">
          <button
            type="button"
            onClick={handleAITriage}
            disabled={aiLoading || loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {aiLoading ? '⚡ Analyzing...' : '🔮 AI Triage'}
          </button>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label             className="block text-gray-300 font-semibold mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="Enter issue title"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label             className="block text-gray-300 font-semibold mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Enter issue description"
          />
        </div>

        {/* Project Selection */}
        <div className="mb-6">
          <label             className="block text-gray-300 font-semibold mb-2">
            Project <span className="text-red-400">*</span>
          </label>
          {projectsLoading ? (
            <div className="text-gray-400">Loading projects...</div>
          ) : (
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a project</option>
              {projects?.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          {projects?.length === 0 && (
            <p className="text-red-400 mt-2">
              No projects found. <Link to="/projects" className="underline text-blue-400">Create a project first</Link>
            </p>
          )}
        </div>

        {/* Priority */}
        <div className="mb-6">
          <label className="block text-gray-300 font-semibold mb-2">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-gray-300 font-semibold mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/issues')}
            className="px-6 py-3 bg-[#334155] hover:bg-[#475569] border border-[#334155] rounded-lg font-semibold text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Issue'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default CreateIssue;

