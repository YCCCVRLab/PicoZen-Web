// Configuration
const DEFAULT_API_SERVER = 'https://ycccrlab.github.io/PicoZen-Web/mock-api';
const LOCAL_API_SERVER = 'http://localhost:3000/api';

// State management
let apiServer = localStorage.getItem('apiServer') || DEFAULT_API_SERVER;
let sideloadHost = localStorage.getItem('sideloadServer') || '';
let currentPath = '/';
let itemList = [];
let isConnected = false;
let isLoading = false;
let currentSection = 'apps';
let currentCategory = '';
let apps = [];

// Initialize the application
init();

async function init() {
    // Load saved API server
    document.getElementById('api-server-input').value = apiServer === DEFAULT_API_SERVER ? '' : apiServer;
    document.getElementById('api-server-display').textContent = apiServer === DEFAULT_API_SERVER ? 'Default (GitHub)' : apiServer;
    
    // Load saved sideload server
    document.getElementById('sideload-server-input').value = sideloadHost;
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial content
    if (currentSection === 'apps') {
        await loadApps();
    }
}

function setupEventListeners() {
    // Section navigation
    document.getElementById('apps-link').addEventListener('click', () => showSection('apps'));
    document.getElementById('sideload-link').addEventListener('click', () => showSection('sideload'));
    
    // Settings
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('settings-overlay-backdrop').addEventListener('click', closeSettings);
    document.querySelector('#settings > .close').addEventListener('click', closeSettings);
    
    // API server settings
    document.getElementById('api-server-change').addEventListener('click', changeApiServer);
    document.getElementById('api-server-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') changeApiServer();
    });
    
    // Sideload server settings
    document.getElementById('sideload-server-change').addEventListener('click', changeSideloadServer);
    document.getElementById('sideload-server-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') changeSideloadServer();
    });
    
    // Category filters
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => filterByCategory(chip.dataset.category));
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') closeSettings();
    });
}

// Section Management
function showSection(section) {
    currentSection = section;
    
    // Update navigation
    document.querySelectorAll('.section-list > a').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(section + '-link').classList.add('active');
    
    // Show/hide sections
    document.getElementById('apps-section').style.display = section === 'apps' ? 'block' : 'none';
    document.getElementById('sideload-section').style.display = section === 'sideload' ? 'block' : 'none';
    
    // Load content
    if (section === 'apps') {
        loadApps();
    } else if (section === 'sideload') {
        if (sideloadHost) {
            getSideloadFileList();
        } else {
            showSideloadInstructions();
        }
    }
}

// App Store Functionality
async function loadApps(category = '') {
    const appsList = document.getElementById('apps-list');
    appsList.innerHTML = '<div class="loading-message">Loading apps...</div>';
    
    try {
        // Try to load from API server first
        let appsData = await fetchAppsFromServer(category);
        
        // Fallback to mock data if server fails
        if (!appsData) {
            appsData = getMockApps(category);
        }
        
        apps = appsData;
        renderApps();
        
    } catch (error) {
        console.error('Error loading apps:', error);
        appsList.innerHTML = `
            <div class="error-message">
                Failed to load apps. Using offline mode.<br>
                <button onclick="loadApps('${category}')" style="margin-top: 10px; padding: 8px 16px; background: var(--color-link); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

async function fetchAppsFromServer(category = '') {
    try {
        let url = `${apiServer}/apps?limit=50`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        return data.success ? data.apps : null;
    } catch (error) {
        console.error('Server fetch failed:', error);
        return null;
    }
}

function getMockApps(category = '') {
    const mockApps = [
        {
            id: 1,
            title: 'UbiSim',
            developer: 'UbiSim',
            category: 'Education',
            shortDescription: 'Immersive VR nursing simulation platform for clinical training and skill development',
            description: 'UbiSim is a VR nursing simulation platform that provides immersive clinical training experiences. Practice essential nursing skills in a safe, virtual environment with realistic patient scenarios, medical equipment, and clinical procedures.',
            version: '1.18.0.157',
            rating: 4.8,
            downloadCount: 1250,
            fileSize: 157286400,
            iconUrl: 'https://scontent-lga3-3.oculuscdn.com/v/t64.5771-25/57570314_1220899138305712_3549230735456268391_n.jpg?stp=dst-jpg_q92_s720x720_tt6&_nc_cat=108&ccb=1-7&_nc_sid=6e7a0a&_nc_ohc=abiM3cUS1t0Q7kNvwEG6f1M&_nc_oc=Adlp9UfoNVCqrK-SF2vUQyBzNMkhhmJ3jvqEt7cfDM_qYnrQBVzTmcC-E25FLjrIr8Y&_nc_zt=3&_nc_ht=scontent-lga3-3.oculuscdn.com&oh=00_AfbbeH7p7KL9MnwLkOJPJMiKRTOgGj_LNCz46TKiUK_knA&oe=68D3347B',
            downloadUrl: 'https://ubisimstreamingprod.blob.core.windows.net/builds/UbiSimPlayer-1.18.0.157.apk?sv=2023-11-03&spr=https,http&se=2026-01-22T13%3A54%3A34Z&sr=b&sp=r&sig=fWimVufXCv%2BG6peu4t4R1ooXF37BEGVm2IS9e%2Fntw%2BI%3D',
            featured: true
        }
    ];
    
    return category ? mockApps.filter(app => app.category === category) : mockApps;
}

function renderApps() {
    const appsList = document.getElementById('apps-list');
    
    if (apps.length === 0) {
        appsList.innerHTML = '<div class="error-message">No apps found for this category.</div>';
        return;
    }
    
    appsList.innerHTML = apps.map(app => `
        <div class="app-item" onclick="downloadApp('${app.downloadUrl || app.downloadUrl}', '${app.title}')">
            <div class="app-header">
                <div class="app-icon" style="background-image: url('${app.iconUrl}'); background-size: cover;">
                    ${!app.iconUrl ? app.title.charAt(0) : ''}
                </div>
                <div class="app-info">
                    <h3>${app.title}</h3>
                    <div class="developer">${app.developer}</div>
                </div>
            </div>
            <div class="app-category">${app.category}</div>
            <div class="app-description">${app.shortDescription || app.description || 'No description available'}</div>
            <div class="app-stats">
                <div class="app-rating">${'⭐'.repeat(Math.floor(app.rating || 0))} ${(app.rating || 0).toFixed(1)}</div>
                <div class="app-downloads">${formatDownloads(app.downloadCount)} downloads</div>
            </div>
            <button class="download-btn" onclick="event.stopPropagation(); downloadApp('${app.downloadUrl}', '${app.title}')">
                Download APK
            </button>
        </div>
    `).join('');
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Update active category
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.category === category) {
            chip.classList.add('active');
        }
    });
    
    loadApps(category);
}

function downloadApp(downloadUrl, appTitle) {
    if (!downloadUrl) {
        alert('Download URL not available for this app');
        return;
    }
    
    // Create temporary link to trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.download = `${appTitle.replace(/[^a-zA-Z0-9]/g, '_')}.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification(`Downloading ${appTitle}...`);
}

// Sideload Functionality (Original PicoZen)
function showSideloadInstructions() {
    document.getElementById('sideload-list').style.display = 'none';
    document.getElementById('sideload-error').style.display = 'grid';
}

async function getSideloadFileList() {
    itemList = [];
    
    if (!sideloadHost) {
        showSideloadInstructions();
        return;
    }

    setLoading(true);

    try {
        let url;
        if (sideloadHost.startsWith('http://') || sideloadHost.startsWith('https://')) {
            url = new URL(sideloadHost);
        } else {
            url = new URL(`http://${sideloadHost}`);
        }
        
        if (currentPath && currentPath !== '/') {
            url.pathname = currentPath;
        }
        
        url.searchParams.set('action', 'list');
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        isConnected = true;

        // Handle back navigation
        if (currentPath !== '/' && currentPath !== '') {
            let backPath = currentPath.split('/').slice(0, -1).join('/');
            if (backPath === '') backPath = '/';

            itemList.push({
                type: 'dir',
                name: '../',
                path: backPath,
                size: 0
            });
        }

        // Add directories and files
        if (data.dirs) {
            data.dirs.forEach(dir => {
                itemList.push({
                    type: 'dir',
                    name: dir.name,
                    path: dir.path || `${currentPath}/${dir.name}`.replace(/\/+/g, '/'),
                    size: dir.size || 0
                });
            });
        }
        
        if (data.files) {
            data.files.forEach(file => {
                itemList.push({
                    type: 'file',
                    name: file.name,
                    path: file.path || `${currentPath}/${file.name}`.replace(/\/+/g, '/'),
                    size: file.size || 0,
                    date: file.date || file.modified
                });
            });
        }

    } catch (error) {
        console.error('Failed to fetch file list:', error);
        isConnected = false;
        
        document.getElementById('sideload-list').style.display = 'none';
        document.getElementById('sideload-error').style.display = 'grid';
        document.querySelector('#sideload-error > span').innerHTML = `
            <strong>Connection Failed</strong><br><br>
            Could not connect to: <code>${sideloadHost}</code><br><br>
            <strong>Troubleshooting:</strong><br>
            • Make sure PicoZen app is running on your headset<br>
            • Check that sideloading is enabled in the app<br>
            • Verify the IP address is correct<br>
            • Ensure both devices are on the same network<br><br>
            <em>Error: ${error.message}</em>
        `;
        
        setLoading(false);
        return;
    }

    setLoading(false);
    renderSideloadFileList();
}

function renderSideloadFileList() {
    const list = document.getElementById('sideload-list');
    
    if (itemList.length === 0) {
        document.getElementById('sideload-list').style.display = 'none';
        document.getElementById('sideload-error').style.display = 'grid';
        return;
    }

    document.getElementById('sideload-list').style.display = 'block';
    document.getElementById('sideload-error').style.display = 'none';

    list.innerHTML = itemList.map(item => `
        <div class="sideload-item ${item.type}" onclick="handleSideloadItemClick('${item.type}', '${item.path}', '${item.name}')">
            <span class="name">${item.name}</span>
            <span class="modified">${item.date ? new Date(item.date).toLocaleString() : ''}</span>
            <span class="size">${bytesReadable(item.size)}</span>
        </div>
    `).join('');
}

function handleSideloadItemClick(type, path, name) {
    if (type === 'dir') {
        currentPath = path;
        getSideloadFileList();
    } else {
        downloadSideloadFile(path, name);
    }
}

function downloadSideloadFile(path, filename) {
    try {
        let url;
        if (sideloadHost.startsWith('http://') || sideloadHost.startsWith('https://')) {
            url = new URL(sideloadHost);
        } else {
            url = new URL(`http://${sideloadHost}`);
        }
        
        url.pathname = path;
        url.searchParams.set('action', 'download');
        
        const a = document.createElement('a');
        a.href = url.toString();
        a.download = filename;
        a.target = '_blank';
        a.click();
        
        showNotification(`Downloading ${filename}...`);
    } catch (error) {
        console.error('Download failed:', error);
        alert(`Failed to download ${filename}: ${error.message}`);
    }
}

// Settings Management
function openSettings() {
    document.getElementById('settings-overlay').style.display = 'grid';
    document.getElementById('left').setAttribute('inert', 'true');
    document.getElementById('right').setAttribute('inert', 'true');
    document.getElementById('settings').focus();
}

function closeSettings() {
    document.getElementById('settings-overlay').style.display = 'none';
    document.getElementById('left').removeAttribute('inert');
    document.getElementById('right').removeAttribute('inert');
}

function changeApiServer() {
    const newServer = document.getElementById('api-server-input').value.trim();
    
    if (newServer) {
        apiServer = newServer;
        localStorage.setItem('apiServer', apiServer);
        document.getElementById('api-server-display').textContent = apiServer;
    } else {
        apiServer = DEFAULT_API_SERVER;
        localStorage.removeItem('apiServer');
        document.getElementById('api-server-display').textContent = 'Default (GitHub)';
    }
    
    if (currentSection === 'apps') {
        loadApps(currentCategory);
    }
    
    closeSettings();
}

function changeSideloadServer() {
    const newHost = document.getElementById('sideload-server-input').value.trim();
    
    if (newHost !== sideloadHost) {
        sideloadHost = newHost;
        localStorage.setItem('sideloadServer', sideloadHost);
        currentPath = '/';
        
        if (currentSection === 'sideload') {
            if (sideloadHost) {
                getSideloadFileList();
            } else {
                showSideloadInstructions();
            }
        }
    }
    
    closeSettings();
}

// Utility Functions
function setLoading(loading) {
    isLoading = loading;
    // Add loading visual feedback if needed
}

function bytesReadable(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const byteTypes = ['KB', 'MB', 'GB', 'TB', 'PB'];
    let currentByteType = 'B';
    
    for (let byteType of byteTypes) {
        if (bytes < 1024) break;
        currentByteType = byteType;
        bytes = bytes / 1024;
    }

    return `${Math.round(bytes * 100) / 100} ${currentByteType}`;
}

function formatDownloads(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-link);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 2000;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}