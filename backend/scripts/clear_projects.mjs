import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'src', 'database', 'sonken.db');

async function run() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      console.error('DB not found at', DB_PATH);
      process.exit(1);
    }

    // Backup
    const bakPath = DB_PATH + '.' + Date.now() + '.bak';
    fs.copyFileSync(DB_PATH, bakPath);
    console.log('Backup created at', bakPath);

    const db = new sqlite3.Database(DB_PATH);

    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');

      db.get('SELECT COUNT(*) as c FROM projects', (err, row) => {
        if (err) {
          console.error('Error counting projects:', err.message);
        } else {
          console.log('Projects before:', row.c);
        }
      });

      db.run('DELETE FROM projects', function(err) {
        if (err) {
          console.error('Error deleting projects:', err.message);
        } else {
          console.log('Deleted projects rows');
        }
      });

      db.get('SELECT COUNT(*) as c FROM projects', (err, row) => {
        if (err) {
          console.error('Error counting projects after delete:', err.message);
        } else {
          console.log('Projects after:', row.c);
        }
      });

    });

    db.close();
  } catch (error) {
    console.error('Error in script:', error);
    process.exit(1);
  }
}

run();
