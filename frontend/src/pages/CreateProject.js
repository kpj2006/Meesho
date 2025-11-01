import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getProjects } from '../store/slices/projectsSlice';
import { projectsAPI } from '../services/api';

const CreateProject = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('github'); // 'github' or 'manual'
  const [error, setError] = useState('');

  const [githubForm, setGithubForm] = useState({
    owner: '',
    repo: '',
  });

  const [manualForm, setManualForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  const handleGithubChange = (e) => {
    setGithubForm({
      ...githubForm,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleManualChange = (e) => {
    setManualForm({
      ...manualForm,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleGithubImport = async (e) => {
    e.preventDefault();
    
    if (!githubForm.owner || !githubForm.repo) {
      setError('Please enter both GitHub owner and repository name');
      return;
    }

    // Clean up input - remove whitespace and handle common URL formats
    const owner = githubForm.owner.trim().replace(/^https?:\/\/(www\.)?github\.com\//, '').split('/')[0];
    const repo = githubForm.repo.trim().replace(/^https?:\/\/(www\.)?github\.com\/[^\/]+\//, '').split('/')[0].replace(/\.git$/, '');

    if (!owner || !repo) {
      setError('Please enter a valid GitHub owner and repository name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Importing GitHub repo:', { owner, repo });
      const response = await projectsAPI.importFromGitHub({
        owner,
        repo,
      });
      
      console.log('GitHub import response:', response.data);
      
      if (response.data.success) {
        // The backend now returns the project directly in data
        const project = response.data.data;
        const projectId = project?._id || project?._id;
        if (projectId) {
          // Show success message with metadata if available
          if (response.data.metadata) {
            console.log(`Successfully imported ${response.data.metadata.importedIssues} issue(s)`);
          }
          navigate(`/projects/${projectId}`);
        } else {
          setError('Project imported but could not navigate. Please refresh and check your projects list.');
        }
      } else {
        setError(response.data.message || 'Failed to import from GitHub');
      }
    } catch (err) {
      console.error('GitHub import error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error?.message ||
                          err.message || 
                          'Failed to import from GitHub. Please check the repository owner/name and your GITHUB_TOKEN in the backend.';
      setError(errorMessage);
      
      // Provide helpful error messages
      if (err.response?.status === 404) {
        setError('Repository not found. Please check that the owner and repository name are correct.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your GITHUB_TOKEN in the backend environment variables.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please check your GITHUB_TOKEN.');
      }
    }
    setLoading(false);
  };

  const handleManualCreate = async (e) => {
    e.preventDefault();
    
    if (!manualForm.name) {
      setError('Please enter project name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await projectsAPI.createProject(manualForm);
      
      if (response.data.success) {
        navigate(`/projects/${response.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Add New Project</h1>
          <button
            onClick={() => navigate('/projects')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Projects
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 mb-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setTab('github')}
            className={`pb-2 px-4 font-semibold transition-colors ${
              tab === 'github'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📦 Import from GitHub
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`pb-2 px-4 font-semibold transition-colors ${
              tab === 'manual'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✏️ Create Manually
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold mb-1">Import Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-300 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* GitHub Import Form */}
      {tab === 'github' && (
        <form onSubmit={handleGithubImport} className="bg-[#1e293b] border border-[#334155] rounded-lg p-8">
          <div className="mb-4">
            <p className="text-gray-400 mb-4">
              Import a project from GitHub. Enter the repository owner and name.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Example: For <code className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">https://github.com/facebook/react</code>, enter owner: <code className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">facebook</code> and repo: <code className="bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">react</code>
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-400">
                  💡 Tip: Make sure GITHUB_TOKEN is set in your backend .env file for better rate limits and access to private repos.
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">
              Repository Owner/Organization <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="owner"
              value={githubForm.owner}
              onChange={handleGithubChange}
              required
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., facebook, microsoft, google"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">
              Repository Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="repo"
              value={githubForm.repo}
              onChange={handleGithubChange}
              required
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., react, vscode, chromadb"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="px-6 py-3 bg-[#334155] hover:bg-[#475569] border border-[#334155] rounded-lg font-semibold text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import from GitHub'}
            </button>
          </div>
        </form>
      )}

      {/* Manual Create Form */}
      {tab === 'manual' && (
        <form onSubmit={handleManualCreate} className="bg-[#1e293b] border border-[#334155] rounded-lg p-8">
          <div className="mb-4">
            <p className="text-gray-400 mb-6">
              Create a new project manually by entering project details.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={manualForm.name}
              onChange={handleManualChange}
              required
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              placeholder="Enter project name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={manualForm.description}
              onChange={handleManualChange}
              rows="4"
              className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Enter project description"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="px-6 py-3 bg-[#334155] hover:bg-[#475569] border border-[#334155] rounded-lg font-semibold text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
};

export default CreateProject;
