import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Square, Trash2, ExternalLink } from 'lucide-react';
import { projectsAPI } from '../services/api';
import { useWebSocket } from '../services/websocket';
import Card from '../components/Card';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = async (id) => {
    try {
      await projectsAPI.toggle(id);
      await loadProjects();
    } catch (error) {
      console.error('Error toggling project:', error);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsAPI.delete(id);
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600 mt-1">
            Manage your local development projects
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="ml-2 text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first project
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Project
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">{project.domain}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      project.status === 'running'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>PHP: {project.php_version || 'N/A'}</p>
                  <p>Database: {project.database_name || 'None'}</p>
                </div>

                <div className="flex space-x-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => toggleProject(project.id)}
                    className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${
                      project.status === 'running'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {project.status === 'running' ? (
                      <>
                        <Square className="h-4 w-4 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Details
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="px-3 py-2 text-sm font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
};

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    path: '',
    php_version: '8.2',
    database_name: '',
    database_user: 'root',
    database_password: '',
  });

  // Otomatik domain oluştur
  const generateDomain = (name) => {
    if (!name) return '';
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '.test';
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ 
      ...formData, 
      name: name,
      domain: formData.domain === '' || formData.domain === generateDomain(formData.name) 
        ? generateDomain(name) 
        : formData.domain
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Domain boşsa otomatik oluştur
      const submitData = {
        ...formData,
        domain: formData.domain || generateDomain(formData.name)
      };
      const response = await projectsAPI.create(submitData);
      const createdProject = response.data.data;
      
      // Proje oluşturulduktan sonra detay sayfasına yönlendir
      window.location.href = `/project/${createdProject.id}`;
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Create New Project
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="My Project"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain <span className="text-xs text-gray-500">(Optional - auto-generated)</span>
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Auto-generated from project name"
            />
            {formData.name && !formData.domain && (
              <p className="text-xs text-gray-500 mt-1">
                Will be: {formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}.test
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Path
            </label>
            <input
              type="text"
              required
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="C:\projects\myproject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PHP Version
            </label>
            <select
              value={formData.php_version}
              onChange={(e) => setFormData({ ...formData, php_version: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7.4">7.4</option>
              <option value="8.0">8.0</option>
              <option value="8.1">8.1</option>
              <option value="8.2">8.2</option>
              <option value="8.3">8.3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Database Name (Optional)
            </label>
            <input
              type="text"
              value={formData.database_name}
              onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="my_database"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
