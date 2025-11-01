import { dbRun } from './src/database/init.js';

// Tüm projeleri sil
await dbRun('DELETE FROM projects');
await dbRun('DELETE FROM resource_metrics');
await dbRun('DELETE FROM database_metrics');
await dbRun('DELETE FROM slow_queries');
await dbRun('DELETE FROM http_requests');
await dbRun('DELETE FROM error_logs');

console.log('✅ Tüm projeler ve ilgili veriler silindi!');
process.exit(0);
