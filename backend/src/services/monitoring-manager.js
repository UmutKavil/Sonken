import { ResourceMonitor } from './resource-monitor.js';
import { DatabaseMonitor } from './database-monitor.js';
import { dbAll } from '../database/init.js';

let monitors = new Map();
let wssInstance = null;

export const startMonitoring = async (wss) => {
  wssInstance = wss;
  
  // Get all active projects
  const projects = await dbAll('SELECT * FROM projects WHERE status = "running"');
  
  for (const project of projects) {
    startProjectMonitoring(project.id);
  }
  
  console.log(`Started monitoring for ${projects.length} active projects`);
};

export const startProjectMonitoring = (projectId) => {
  if (monitors.has(projectId)) {
    console.log(`Monitoring already active for project ${projectId}`);
    return;
  }
  
  const resourceMonitor = new ResourceMonitor(projectId, wssInstance);
  const databaseMonitor = new DatabaseMonitor(projectId, wssInstance);
  
  resourceMonitor.start();
  databaseMonitor.start();
  
  monitors.set(projectId, {
    resource: resourceMonitor,
    database: databaseMonitor
  });
  
  console.log(`Started monitoring for project ${projectId}`);
};

export const stopProjectMonitoring = (projectId) => {
  const projectMonitors = monitors.get(projectId);
  
  if (!projectMonitors) {
    console.log(`No monitoring active for project ${projectId}`);
    return;
  }
  
  projectMonitors.resource.stop();
  projectMonitors.database.stop();
  
  monitors.delete(projectId);
  
  console.log(`Stopped monitoring for project ${projectId}`);
};

export const getActiveMonitors = () => {
  return Array.from(monitors.keys());
};
