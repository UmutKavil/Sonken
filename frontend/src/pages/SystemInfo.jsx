import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, Wifi } from 'lucide-react';
import { systemAPI } from '../services/api';
import Card from '../components/Card';

const SystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadResources, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      const [infoRes, resourcesRes] = await Promise.all([
        systemAPI.getInfo(),
        systemAPI.getResources(),
      ]);
      setSystemInfo(infoRes.data.data);
      setResources(resourcesRes.data.data);
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const response = await systemAPI.getResources();
      setResources(response.data.data);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900">System Information</h2>
        <p className="text-gray-600 mt-1">Overview of your system resources</p>
      </div>

      {/* Current Resource Usage */}
      {resources && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="CPU Usage">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Load</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {resources.cpu.usage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${resources.cpu.usage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  Idle: {resources.cpu.idle}%
                </div>
              </div>
            </Card>

            <Card title="Memory Usage">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Used / Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {resources.memory.usagePercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${resources.memory.usagePercent}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatBytes(resources.memory.used)} / {formatBytes(resources.memory.total)}
                </div>
              </div>
            </Card>
          </div>

          {/* Disk Usage */}
          <Card title="Disk Usage">
            <div className="space-y-4">
              {resources.disk.map((disk, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{disk.fs}</p>
                      <p className="text-sm text-gray-600">{disk.type}</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {disk.usagePercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${disk.usagePercent}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {formatBytes(disk.used)} / {formatBytes(disk.size)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* System Information */}
      {systemInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="CPU Information">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Brand</p>
                <p className="text-base font-medium text-gray-900">{systemInfo.cpu.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Manufacturer</p>
                <p className="text-base font-medium text-gray-900">{systemInfo.cpu.manufacturer}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cores</p>
                  <p className="text-base font-medium text-gray-900">{systemInfo.cpu.cores}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Speed</p>
                  <p className="text-base font-medium text-gray-900">{systemInfo.cpu.speed} GHz</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Operating System">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="text-base font-medium text-gray-900">{systemInfo.os.platform}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Distribution</p>
                <p className="text-base font-medium text-gray-900">{systemInfo.os.distro}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Release</p>
                <p className="text-base font-medium text-gray-900">{systemInfo.os.release}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Architecture</p>
                <p className="text-base font-medium text-gray-900">{systemInfo.os.arch}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemInfo;
