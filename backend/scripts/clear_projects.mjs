#!/usr/bin/env node
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'src', 'database', 'sonken.db');

console.log('🧹 Tüm projeleri temizleniyor...\n');

try {
    // Backup oluştur
    if (fs.existsSync(dbPath)) {
        const backupPath = `${dbPath}.${Date.now()}.bak`;
        fs.copyFileSync(dbPath, backupPath);
        console.log(`Backup created at ${backupPath}`);
    }

    const db = new Database(dbPath);

    // Önce kaç proje var göster
    const countBefore = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    console.log(`Projects before: ${countBefore.count}`);

    // Tüm projeleri sil
    db.prepare('DELETE FROM projects').run();
    db.prepare('DELETE FROM resource_metrics').run();
    db.prepare('DELETE FROM database_metrics').run();
    db.prepare('DELETE FROM slow_queries').run();
    db.prepare('DELETE FROM http_requests').run();
    db.prepare('DELETE FROM error_logs').run();

    console.log('Deleted projects rows');

    // Sonucu göster
    const countAfter = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    console.log(`Projects after: ${countAfter.count}`);

    db.close();

    // sonken-projects klasörünü temizle
    const projectsDir = path.join(__dirname, '..', '..', 'sonken-projects');
    if (fs.existsSync(projectsDir)) {
        fs.rmSync(projectsDir, { recursive: true, force: true });
        console.log('\n✅ sonken-projects klasörü temizlendi');
    }

    console.log('\n✅ Tüm projeler başarıyla temizlendi!');
} catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
}
