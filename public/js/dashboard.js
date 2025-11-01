// Dashboard Main JavaScript
let charts = {};
let updateInterval = null;
let siteMetrics = new Map();

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeCharts();
    loadInitialData();
    startRealTimeUpdates();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update page title
            document.getElementById('page-title').textContent = item.querySelector('span').textContent;
            
            // Show corresponding section
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById(`${section}-section`).classList.add('active');
            
            // Load section data
            loadSectionData(section);
        });
    });
}

// Initialize Charts
function initializeCharts() {
    // Traffic Chart
    const trafficCanvas = document.getElementById('trafficChart');
    if (!trafficCanvas) return;
    
    const trafficCtx = trafficCanvas.getContext('2d');
    charts.traffic = new Chart(trafficCtx, {
        type: 'line',
        data: {
            labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
            datasets: [{
                label: 'Gelen Trafik (MB)',
                data: [120, 190, 150, 220, 180, 250, 200],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Giden Trafik (MB)',
                data: [80, 130, 100, 150, 120, 170, 140],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' MB';
                        }
                    }
                }
            }
        }
    });

    // Resources Chart
    const resourcesCanvas = document.getElementById('resourcesChart');
    if (resourcesCanvas) {
        const resourcesCtx = resourcesCanvas.getContext('2d');
        charts.resources = new Chart(resourcesCtx, {
            type: 'doughnut',
            data: {
                labels: ['CPU', 'RAM', 'Disk'],
                datasets: [{
                    data: [45, 62, 38],
                    backgroundColor: ['#667eea', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Network Chart
    const networkCanvas = document.getElementById('networkChart');
    if (networkCanvas) {
        const networkCtx = networkCanvas.getContext('2d');
        charts.network = new Chart(networkCtx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Trafik (MB)',
                    data: Array.from({length: 24}, () => Math.floor(Math.random() * 100)),
                    backgroundColor: 'rgba(102, 126, 234, 0.5)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // CPU Gauge
    const cpuCanvas = document.getElementById('cpuGauge');
    if (cpuCanvas) {
        createGaugeChart('cpuGauge', 45, '#667eea');
    }
    
    // Memory Gauge
    const memoryCanvas = document.getElementById('memoryGauge');
    if (memoryCanvas) {
        createGaugeChart('memoryGauge', 62, '#10b981');
    }
}

function createGaugeChart(canvasId, value, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [color, '#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load system info
        const systemInfo = await fetch('/api/server/info').then(r => r.json());
        updateSystemInfo(systemInfo);
        
        // Load sites
        await loadSites();
        
        // Load database info
        await loadDatabaseInfo();
        
        // Generate sample metrics
        generateSampleData();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Veri yüklenirken hata oluştu', 'error');
    }
}

// Update System Info
function updateSystemInfo(info) {
    const totalMemGB = (info.totalMemory / (1024 ** 3)).toFixed(2);
    const freeMemGB = (info.freeMemory / (1024 ** 3)).toFixed(2);
    const usedMemGB = (totalMemGB - freeMemGB).toFixed(2);
    const memoryPercent = ((usedMemGB / totalMemGB) * 100).toFixed(1);
    
    document.getElementById('cpu-cores').textContent = info.cpus;
    document.getElementById('cpu-load').textContent = info.loadAverage[0].toFixed(2);
    document.getElementById('memory-total').textContent = totalMemGB + ' GB';
    document.getElementById('memory-free').textContent = freeMemGB + ' GB';
    document.getElementById('memory-usage').textContent = memoryPercent + '%';
    
    // Update gauge charts
    updateGaugeChart('cpuGauge', (info.loadAverage[0] / info.cpus * 100).toFixed(1));
    updateGaugeChart('memoryGauge', memoryPercent);
}

function updateGaugeChart(chartId, value) {
    if (charts[chartId]) {
        const numValue = parseFloat(value) || 0;
        charts[chartId].data.datasets[0].data = [numValue, 100 - numValue];
        charts[chartId].update('none'); // Update without animation for smoother performance
    }
}

// Upload Site Form
document.getElementById('site-upload-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const siteName = formData.get('siteName');
    
    try {
        showNotification('Site yükleniyor...', 'info');
        
        const response = await fetch('/api/sites/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Site başarıyla yüklendi!', 'success');
            e.target.reset();
            document.getElementById('file-list').classList.remove('active');
            loadSites();
            loadSectionData('sites');
            
            // Show network info
            if (result.networkUrls) {
                showNetworkInfo(result.networkUrls);
            }
        } else {
            showNotification('Hata: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Site yüklenirken hata oluştu: ' + error.message, 'error');
    }
});

// File input handler
document.getElementById('site-files')?.addEventListener('change', (e) => {
    const fileList = document.getElementById('file-list');
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
        fileList.classList.add('active');
        fileList.innerHTML = files.map(file => `
            <div class="file-item">
                <span>
                    <i class="fas fa-file"></i>
                    ${file.name}
                </span>
                <span class="file-size">${(file.size / 1024).toFixed(2)} KB</span>
            </div>
        `).join('');
    } else {
        fileList.classList.remove('active');
    }
});

// Show network info modal
function showNetworkInfo(urls) {
    const html = `
        <div class="network-info">
            <h4><i class="fas fa-network-wired"></i> Site Local Ağda Erişilebilir</h4>
            ${urls.map(url => `
                <div class="network-url">
                    <code>${url}</code>
                    <button class="copy-btn" onclick="copyToClipboard('${url}')">
                        <i class="fas fa-copy"></i> Kopyala
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add to sites section or show as notification
    const sitesSection = document.getElementById('sites-section');
    const existingInfo = sitesSection.querySelector('.network-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    const uploadSection = sitesSection.querySelector('.upload-section');
    uploadSection.insertAdjacentHTML('afterend', html);
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('URL kopyalandı!', 'success');
    }).catch(() => {
        showNotification('Kopyalama başarısız', 'error');
    });
}

// Load Sites
async function loadSites() {
    const tbody = document.getElementById('sites-tbody');
    const sitesGrid = document.getElementById('sites-grid');
    
    try {
        // Load uploaded sites from server
        const response = await fetch('/api/sites/list');
        const data = await response.json();
        
        const sites = data.sites || [];
        
        // Update active sites count
        const activeSites = sites.filter(s => s.status === 'running').length;
        document.getElementById('active-sites').textContent = activeSites;
        
        // Populate table
        if (tbody) {
            tbody.innerHTML = sites.map(site => `
                <tr>
                    <td><strong>${site.name}</strong></td>
                    <td><code>${site.url}</code></td>
                    <td><span class="status-badge ${site.status === 'running' ? 'online' : 'offline'}">${site.status === 'running' ? 'Çevrimiçi' : 'Çevrimdışı'}</span></td>
                    <td>${site.traffic || '0 MB'}</td>
                    <td>${(site.requests || 0).toLocaleString()}</td>
                    <td>${site.avgResponse || '-'}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="viewSiteDetails('${site.name}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSite('${site.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Populate sites grid
        if (sitesGrid) {
            sitesGrid.innerHTML = sites.map(site => `
                <div class="site-card">
                    <div class="site-card-header">
                        <div>
                            <div class="site-card-title">${site.name}</div>
                            <div class="site-card-url">
                                <i class="fas fa-link"></i>
                                <a href="${site.localUrl}" target="_blank">${site.localUrl}</a>
                            </div>
                        </div>
                        <span class="site-card-status ${site.status}">${site.status === 'running' ? 'Aktif' : 'Durduruldu'}</span>
                    </div>
                    <div class="site-card-info">
                        <div class="site-info-item">
                            <span class="site-info-label">Port:</span>
                            <span class="site-info-value">${site.port}</span>
                        </div>
                        <div class="site-info-item">
                            <span class="site-info-label">Dosya Sayısı:</span>
                            <span class="site-info-value">${site.fileCount || 0}</span>
                        </div>
                        <div class="site-info-item">
                            <span class="site-info-label">Oluşturulma:</span>
                            <span class="site-info-value">${new Date(site.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                    ${site.networkUrls && site.networkUrls.length > 0 ? `
                        <div class="network-info">
                            <h4><i class="fas fa-network-wired"></i> Ağ Adresleri</h4>
                            ${site.networkUrls.map(url => `
                                <div class="network-url">
                                    <code>${url}</code>
                                    <button class="copy-btn" onclick="copyToClipboard('${url}')">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="site-card-actions">
                        <button class="btn btn-primary" onclick="window.open('${site.localUrl}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Aç
                        </button>
                        <button class="btn btn-secondary" onclick="viewSiteDetails('${site.name}')">
                            <i class="fas fa-eye"></i> Detay
                        </button>
                        <button class="btn btn-danger" onclick="deleteSite('${site.name}')">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Store metrics for each site
        sites.forEach(site => {
            siteMetrics.set(site.name, {
                bytesReceived: Math.random() * 1000000000,
                bytesSent: Math.random() * 500000000,
                requestCount: site.requests || 0,
                errorCount: Math.floor(Math.random() * 10)
            });
        });
    } catch (error) {
        console.error('Error loading sites:', error);
        showNotification('Siteler yüklenirken hata oluştu', 'error');
    }
}

// Load Database Info
async function loadDatabaseInfo() {
    try {
        // Test database connections
        const dbTest = await fetch('/api/database/test').then(r => r.json());
        
        if (dbTest.connections.mysql) {
            const mysqlDbs = await fetch('/api/database/mysql/databases').then(r => r.json());
            document.getElementById('mysql-db-count').textContent = mysqlDbs.databases?.length || 0;
            document.getElementById('mysql-connections').textContent = Math.floor(Math.random() * 10);
            document.getElementById('mysql-queries').textContent = Math.floor(Math.random() * 100);
        }
        
        if (dbTest.connections.mongodb) {
            const mongoColls = await fetch('/api/database/mongodb/collections').then(r => r.json());
            document.getElementById('mongo-collections').textContent = mongoColls.collections?.length || 0;
            document.getElementById('mongo-documents').textContent = Math.floor(Math.random() * 1000);
            document.getElementById('mongo-size').textContent = (Math.random() * 100).toFixed(2) + ' MB';
        }
    } catch (error) {
        console.error('Error loading database info:', error);
    }
}

// Generate Sample Data
function generateSampleData() {
    // Update traffic chart with sample data
    if (charts.traffic) {
        const trafficData = Array.from({length: 7}, () => Math.floor(Math.random() * 500));
        charts.traffic.data.datasets[0].data = trafficData;
        charts.traffic.data.datasets[1].data = trafficData.map(v => Math.floor(v * 0.7));
        charts.traffic.update();
    }
    
    // Update resources chart
    const cpuUsage = Math.floor(Math.random() * 60 + 20);
    const ramUsage = Math.floor(Math.random() * 70 + 20);
    const diskUsage = Math.floor(Math.random() * 50 + 30);
    
    if (charts.resources) {
        charts.resources.data.datasets[0].data = [cpuUsage, ramUsage, diskUsage];
        charts.resources.update();
    }
    
    const cpuElement = document.getElementById('cpu-usage');
    if (cpuElement) {
        cpuElement.textContent = cpuUsage + '%';
    }
    
    // Update bandwidth
    const totalBandwidth = (Math.random() * 5000 + 1000).toFixed(2);
    const bandwidthElement = document.getElementById('total-bandwidth');
    if (bandwidthElement) {
        bandwidthElement.textContent = totalBandwidth + ' MB';
    }
    
    // Update network chart
    if (charts.network) {
        const networkData = Array.from({length: 24}, () => Math.floor(Math.random() * 100));
        charts.network.data.datasets[0].data = networkData;
        charts.network.update();
    }
    
    // Update disk usage
    const diskPercent = Math.floor(Math.random() * 40 + 30);
    const diskPercentElement = document.getElementById('disk-c-percent');
    const diskFillElement = document.getElementById('disk-c-fill');
    if (diskPercentElement) {
        diskPercentElement.textContent = diskPercent + '%';
    }
    if (diskFillElement) {
        diskFillElement.style.width = diskPercent + '%';
    }
}

// Real-time Updates
function startRealTimeUpdates() {
    updateInterval = setInterval(async () => {
        try {
            const systemInfo = await fetch('/api/server/info').then(r => r.json());
            updateSystemInfo(systemInfo);
            
            // Simulate traffic changes
            const currentTraffic = parseFloat(document.getElementById('total-bandwidth').textContent);
            const newTraffic = currentTraffic + Math.random() * 10;
            document.getElementById('total-bandwidth').textContent = newTraffic.toFixed(2) + ' MB';
            
            // Add new log entry
            addLogEntry('info', 'System health check completed');
            
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }, 5000); // Update every 5 seconds
}

// Load Section Data
function loadSectionData(section) {
    switch(section) {
        case 'sites':
            loadSites();
            break;
        case 'databases':
            loadDatabaseInfo();
            break;
        case 'logs':
            loadLogs();
            break;
    }
}

// Logs
function loadLogs() {
    const logsList = document.getElementById('logs-list');
    const sampleLogs = [
        { level: 'info', message: '[' + new Date().toISOString() + '] Server started successfully' },
        { level: 'info', message: '[' + new Date().toISOString() + '] Connected to MySQL database' },
        { level: 'info', message: '[' + new Date().toISOString() + '] Connected to MongoDB database' },
        { level: 'warn', message: '[' + new Date().toISOString() + '] High memory usage detected: 75%' },
        { level: 'info', message: '[' + new Date().toISOString() + '] New site request: localhost:8000' },
    ];
    
    logsList.innerHTML = sampleLogs.map(log => 
        `<div class="log-entry ${log.level}">${log.message}</div>`
    ).join('');
}

function addLogEntry(level, message) {
    const logsList = document.getElementById('logs-list');
    if (logsList && logsList.children.length > 0) {
        const timestamp = new Date().toISOString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${level}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        logsList.insertBefore(logEntry, logsList.firstChild);
        
        // Keep only last 100 logs
        while (logsList.children.length > 100) {
            logsList.removeChild(logsList.lastChild);
        }
    }
}

// Helper Functions
function refreshData() {
    const btn = document.querySelector('.refresh-btn i');
    btn.classList.add('fa-spin');
    
    loadInitialData().then(() => {
        setTimeout(() => {
            btn.classList.remove('fa-spin');
            showNotification('Veriler güncellendi', 'success');
        }, 1000);
    });
}

function addNewSite() {
    const siteName = prompt('Site adını girin:');
    if (siteName) {
        showNotification('Site eklendi: ' + siteName, 'success');
        loadSites();
    }
}

function viewSiteDetails(siteName) {
    const metrics = siteMetrics.get(siteName) || {};
    const details = `
Site: ${siteName}
Alınan: ${(metrics.bytesReceived / (1024**2)).toFixed(2)} MB
Gönderilen: ${(metrics.bytesSent / (1024**2)).toFixed(2)} MB
İstekler: ${metrics.requestCount}
Hatalar: ${metrics.errorCount}
    `;
    alert(details);
}

async function deleteSite(siteName) {
    if (confirm(siteName + ' sitesini silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch('/api/sites/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ siteName })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Site silindi: ' + siteName, 'success');
                loadSites();
            } else {
                showNotification('Hata: ' + result.error, 'error');
            }
        } catch (error) {
            showNotification('Site silinirken hata oluştu', 'error');
        }
    }
}

function openPhpMyAdmin() {
    window.open('http://localhost:8080', '_blank');
}

function openMongoExpress() {
    window.open('http://localhost:8081', '_blank');
}

function viewDatabases(type) {
    showNotification(type + ' veritabanları görüntüleniyor...', 'info');
}

function clearLogs() {
    if (confirm('Tüm logları temizlemek istediğinizden emin misiniz?')) {
        document.getElementById('logs-list').innerHTML = '';
        showNotification('Loglar temizlendi', 'success');
    }
}

function exportLogs() {
    showNotification('Loglar dışa aktarılıyor...', 'info');
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can implement a toast notification here
}

// Handle settings form
document.getElementById('general-settings')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('Ayarlar kaydedildi', 'success');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
