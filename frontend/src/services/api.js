import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  toggle: (id) => api.post(`/projects/${id}/toggle`),
  refresh: (id, sourcePath) => api.post(`/projects/${id}/refresh`, { sourcePath }),
};

// Monitoring API
export const monitoringAPI = {
  getResources: (projectId, limit = 50) => 
    api.get(`/monitoring/resources/${projectId}?limit=${limit}`),
  getLatestResources: (projectId) => 
    api.get(`/monitoring/resources/${projectId}/latest`),
  getRequests: (projectId, limit = 100) => 
    api.get(`/monitoring/requests/${projectId}?limit=${limit}`),
  getErrorStats: (projectId) => 
    api.get(`/monitoring/errors/${projectId}/stats`),
  getErrors: (projectId, limit = 50) => 
    api.get(`/monitoring/errors/${projectId}?limit=${limit}`),
  getThroughput: (projectId, interval = '1 hour') => 
    api.get(`/monitoring/throughput/${projectId}?interval=${interval}`),
};

// Database API
export const databaseAPI = {
  getMetrics: (projectId, limit = 50) => 
    api.get(`/database/metrics/${projectId}?limit=${limit}`),
  getLatestMetrics: (projectId) => 
    api.get(`/database/metrics/${projectId}/latest`),
  getSlowQueries: (projectId, limit = 20) => 
    api.get(`/database/slow-queries/${projectId}?limit=${limit}`),
  getSlowQueryStats: (projectId) => 
    api.get(`/database/slow-queries/${projectId}/stats`),
};

// System API
export const systemAPI = {
  getInfo: () => api.get('/system/info'),
  getResources: () => api.get('/system/resources'),
  getNetwork: () => api.get('/system/network'),
  selectFolder: () => api.post('/system/select-folder'),
};

// Files API
export const filesAPI = {
  getPhpFiles: (projectId) => api.get(`/files/php-files/${projectId}`),
  getFileContent: (projectId, filePath) => 
    api.get(`/files/file-content/${projectId}?filePath=${encodeURIComponent(filePath)}`),
};

// Server API
export const serverAPI = {
  start: (projectId, port) => api.post(`/server/start/${projectId}`, { port }),
  stop: (projectId) => api.post(`/server/stop/${projectId}`),
  getStatus: (projectId) => api.get(`/server/status/${projectId}`),
  getNetworkIP: () => api.get('/server/network-ip'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
