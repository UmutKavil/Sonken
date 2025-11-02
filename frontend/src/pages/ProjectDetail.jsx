import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, HardDrive, Database, Activity, AlertCircle, FileCode, ExternalLink, Folder, RefreshCw } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { projectsAPI, monitoringAPI, databaseAPI, filesAPI, serverAPI } from '../services/api';
import { useWebSocket } from '../services/websocket';
import Card from '../components/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [resourceMetrics, setResourceMetrics] = useState([]);
  const [dbMetrics, setDbMetrics] = useState(null);
  const [slowQueries, setSlowQueries] = useState([]);
  const [errors, setErrors] = useState([]);
  const [phpFiles, setPhpFiles] = useState([]);
  const [serverStatus, setServerStatus] = useState(null);
  const [networkIPs, setNetworkIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    loadProjectData();
    loadServerStatus();
    loadNetworkIPs();
  }, [id]);

  useEffect(() => {
    // Handle real-time updates
    if (lastMessage && lastMessage.projectId === id) {
      if (lastMessage.type === 'resource_update') {
        setResourceMetrics(prev => [...prev.slice(-49), {
          timestamp: lastMessage.data.timestamp,
          cpu_usage: parseFloat(lastMessage.data.cpu),
          memory_usage: parseFloat(lastMessage.data.memory),
          disk_usage: parseFloat(lastMessage.data.disk),
        }]);
      }
    }
  }, [lastMessage, id]);

  const loadProjectData = async () => {
    try {
      const [projectRes, resourceRes, dbMetricsRes, slowQueriesRes, errorsRes, phpFilesRes] = await Promise.all([
        projectsAPI.getById(id),
        monitoringAPI.getResources(id, 50),
        databaseAPI.getLatestMetrics(id).catch(() => ({ data: { data: null } })),
        databaseAPI.getSlowQueries(id, 10).catch(() => ({ data: { data: [] } })),
        monitoringAPI.getErrors(id, 10).catch(() => ({ data: { data: [] } })),
        filesAPI.getPhpFiles(id).catch(() => ({ data: { data: { files: [] } } })),
      ]);

      setProject(projectRes.data.data);
      setResourceMetrics(resourceRes.data.data);
      setDbMetrics(dbMetricsRes.data.data);
      setSlowQueries(slowQueriesRes.data.data);
      setErrors(errorsRes.data.data);
      setPhpFiles(phpFilesRes.data.data.files || []);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServerStatus = async () => {
    try {
      const response = await serverAPI.getStatus(id);
      setServerStatus(response.data);
    } catch (error) {
      console.error('Error loading server status:', error);
    }
  };

  const loadNetworkIPs = async () => {
    try {
      const response = await serverAPI.getNetworkIP();
      setNetworkIPs(response.data.data || []);
    } catch (error) {
      console.error('Error loading network IPs:', error);
    }
  };

  const startServer = async () => {
    try {
      const response = await serverAPI.start(id);
      setServerStatus(response.data);
      alert(`Server started on ${response.data.url}`);
      await loadServerStatus();
    } catch (error) {
      console.error('Error starting server:', error);
      alert('Failed to start server. Make sure PHP is installed.');
    }
  };

  const stopServer = async () => {
    try {
      await serverAPI.stop(id);
      await loadServerStatus();
      alert('Server stopped');
    } catch (error) {
      console.error('Error stopping server:', error);
      alert('Failed to stop server');
    }
  };

  const openPhpFile = (file) => {
    if (serverStatus?.running) {
      // Dosya yolunu temizle ve URL'e çevir
      let filePath = file.path.replace(/\\/g, '/');
      // Başındaki ./ veya / varsa temizle
      filePath = filePath.replace(/^\.?\//, '');
      const url = `${serverStatus.url}/${filePath}`;
      window.open(url, '_blank');
    } else {
      alert('Lütfen önce "Start Local Server" butonuna tıklayarak sunucuyu başlatın!');
    }
  };

  const refreshProjectFiles = async () => {
    // Kaynak yolu localStorage'dan al
    const sourcePath = localStorage.getItem(`project_source_${id}`);

    if (!sourcePath) {
      const newSourcePath = prompt('Kaynak dosyaların konumunu girin:');
      if (!newSourcePath) return;

      localStorage.setItem(`project_source_${id}`, newSourcePath);
      await performRefresh(newSourcePath);
    } else {
      // Onay iste
      if (confirm(`Proje dosyaları şu konumdan yeniden kopyalanacak:\n${sourcePath}\n\nDevam edilsin mi?`)) {
        await performRefresh(sourcePath);
      }
    }
  };

  const performRefresh = async (sourcePath) => {
    setRefreshing(true);
    try {
      const response = await projectsAPI.refresh(id, sourcePath);
      alert(response.data.message || 'Dosyalar başarıyla yenilendi!');

      // Sunucu çalışıyorsa yeniden başlat
      if (serverStatus?.running) {
        await stopServer();
        setTimeout(async () => {
          await startServer();
        }, 1000);
      }

      // Verileri yeniden yükle
      await loadProjectData();
    } catch (error) {
      console.error('Error refreshing project:', error);
      alert(error.response?.data?.error || 'Dosyalar yenilenemedi');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </Card>
    );
  }

  const chartData = {
    labels: resourceMetrics.map((m) => {
      const date = new Date(m.timestamp);
      return date.toLocaleTimeString();
    }),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: resourceMetrics.map((m) => m.cpu_usage),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Memory Usage (%)',
        data: resourceMetrics.map((m) => m.memory_usage),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const latestMetrics = resourceMetrics[resourceMetrics.length - 1] || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-600 mt-1">{project.domain}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshProjectFiles}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            title="Dosyaları kaynak konumdan yeniden kopyala"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Yenileniyor...' : 'Dosyaları Yenile'}
          </button>
          {serverStatus?.running ? (
            <>
              <div className="text-right mr-2">
                <p className="text-sm font-medium text-green-700">Server Running</p>
                <p className="text-xs text-gray-500">{serverStatus.url}</p>
                {networkIPs.length > 0 && (
                  <p className="text-xs text-blue-600">
                    Network: http://{networkIPs[0].address}:{serverStatus.port}
                  </p>
                )}
              </div>
              <button
                onClick={stopServer}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Server
              </button>
            </>
          ) : (
            <button
              onClick={startServer}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Activity className="h-4 w-4 mr-2" />
              Start Local Server
            </button>
          )}
          <span
            className={`px-3 py-1 text-sm font-medium rounded ${project.status === 'running'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
              }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Resource Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cpu className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetrics.cpu_usage?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetrics.memory_usage?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Disk Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetrics.disk_usage?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Resource Chart */}
      <Card title="Resource Usage Over Time">
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </Card>

      {/* Database Metrics */}
      {dbMetrics && (
        <Card title="Database Metrics">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Database Size</p>
              <p className="text-xl font-bold text-gray-900">{dbMetrics.db_size} MB</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Connections</p>
              <p className="text-xl font-bold text-gray-900">{dbMetrics.connection_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Slow Queries</p>
              <p className="text-xl font-bold text-gray-900">{dbMetrics.slow_queries}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Slow Queries */}
      {slowQueries.length > 0 && (
        <Card title="Recent Slow Queries">
          <div className="space-y-3">
            {slowQueries.map((query) => (
              <div key={query.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-start">
                  <code className="text-sm text-gray-800 flex-1 mr-4">
                    {query.query.substring(0, 100)}...
                  </code>
                  <span className="text-sm font-medium text-yellow-700">
                    {query.execution_time.toFixed(2)}ms
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(query.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error Logs */}
      {errors.length > 0 && (
        <Card title="Recent Errors">
          <div className="space-y-3">
            {errors.map((error) => (
              <div key={error.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{error.error_type}</p>
                    <p className="text-sm text-red-700 mt-1">{error.error_message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(error.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* PHP Files */}
      <Card
        title="PHP Files"
        subtitle={`${phpFiles.length} files found`}
        action={
          <div className="flex items-center text-sm text-gray-500">
            <Folder className="h-4 w-4 mr-1" />
            {project?.path}
          </div>
        }
      >
        {!serverStatus?.running && phpFiles.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Local server not running</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Click "Start Local Server" button to run PHP files in browser
                </p>
              </div>
            </div>
          </div>
        )}
        {phpFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileCode className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No PHP files found in this project</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {phpFiles.map((file, index) => (
              <button
                key={index}
                onClick={() => openPhpFile(file)}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 text-left transition-all hover:shadow-md group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <FileCode className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate mb-1">
                      {file.path}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(file.modified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-blue-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetail;
