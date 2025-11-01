import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects } from '../store/slices/projectsSlice';
import { Link } from 'react-router-dom';

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">Projects</h1>
          <Link
            to="/projects/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : projects?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="block bg-[#1e293b] border border-[#334155] rounded-lg p-6 hover:border-blue-500/50 transition-colors"
              >
                <h3 className="text-2xl font-bold text-white mb-2">{project.name}</h3>
                <p className="text-gray-400 mb-4">
                  {project.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  {project.sprints && <span>{project.sprints.length} sprints</span>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;

