// Default to localhost for local development, but allow custom servers
const DEFAULT_FILES_URL = "http://localhost:8080";

let host = localStorage.getItem("sideloadServer") || "";
let filesUrl = localStorage.getItem("filesServerUrl") || DEFAULT_FILES_URL;
let currentPath = "/";
let itemList = [];
let isConnected = false;
let isLoading = false;

// Initialize the app
init();

async function init() {
    // Show initial instructions if no server is configured
    if (!host) {
        showSetupInstructions();
    } else {
        await getFileList();
    }
}

function showSetupInstructions() {
    document.querySelector("#sideload-list").style.display = "none";
    document.querySelector("#sideload-error").style.display = "grid";
    document.querySelector("#sideload-error > span").innerHTML = `
        <strong>Welcome to PicoZen Web!</strong><br><br>
        To get started:<br>
        1. Install the PicoZen app on your headset<br>
        2. Enable sideloading in the app<br>
        3. Note the IP address shown in the app<br>
        4. Click the settings gear ⚙️ and enter that IP address<br><br>
        <em>For local testing, you can use 'localhost:8080'</em>
    `;
}

function setLoading(loading) {
    isLoading = loading;
    document.body.classList.toggle('loading', loading);
    
    if (loading) {
        document.querySelector("#sideload-list").style.display = "none";
        document.querySelector("#sideload-error").style.display = "grid";
        document.querySelector("#sideload-error > span").innerHTML = `
            <strong>Connecting...</strong><br><br>
            Please wait while we connect to your headset.
        `;
    }
}

async function getFileList() {
    if (isLoading) return;
    
    itemList = [];
    
    if (!host) {
        showSetupInstructions();
        return;
    }

    setLoading(true);

    try {
        // Construct the URL for the file server
        let url;
        if (host.startsWith('http://') || host.startsWith('https://')) {
            url = new URL(host);
        } else {
            // Assume it's an IP address or hostname, default to http
            url = new URL(`http://${host}`);
        }
        
        // Add current path
        if (currentPath && currentPath !== "/") {
            url.pathname = currentPath;
        }
        
        // Try different API endpoints that might work
        const endpoints = [
            { action: "list", format: "json" },
            { list: "1" },
            { }  // Just try the base URL
        ];
        
        let data = null;
        let lastError = null;
        
        for (let params of endpoints) {
            try {
                const testUrl = new URL(url.toString());
                Object.keys(params).forEach(key => {
                    testUrl.searchParams.set(key, params[key]);
                });
                
                console.log("Trying endpoint:", testUrl.toString());
                
                let res = await fetch(testUrl.toString(), {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json, text/html, */*',
                    },
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }

                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await res.json();
                    break;
                } else {
                    // Try to parse as text and see if it's HTML with file listings
                    const text = await res.text();
                    data = parseHTMLListing(text);
                    if (data) break;
                }
            } catch (error) {
                lastError = error;
                console.warn(`Endpoint failed:`, error.message);
            }
        }

        if (!data) {
            throw lastError || new Error("No valid response from any endpoint");
        }

        isConnected = true;

        // Handle back navigation
        if (currentPath !== "/" && currentPath !== "") {
            let backPath = currentPath.split("/").slice(0, -1).join("/");
            if (backPath === "") backPath = "/";

            itemList.push({
                type: "dir",
                name: "../",
                path: backPath,
                size: 0,
                lastUpdated: undefined,
            });
        }

        // Add directories
        if (data.dirs) {
            for (let dir of data.dirs) {
                itemList.push({
                    type: "dir",
                    name: dir.name,
                    path: dir.path || `${currentPath}/${dir.name}`.replace(/\/+/g, '/'),
                    size: dir.size || 0,
                });
            }
        }
        
        // Add files
        if (data.files) {
            for (let file of data.files) {
                itemList.push({
                    type: "file",
                    name: file.name,
                    path: file.path || `${currentPath}/${file.name}`.replace(/\/+/g, '/'),
                    size: file.size || 0,
                    date: file.date || file.modified,
                });
            }
        }

    } catch (error) {
        console.error("Failed to fetch file list:", error);
        isConnected = false;
        
        // Show error message with helpful information
        document.querySelector("#sideload-list").style.display = "none";
        document.querySelector("#sideload-error").style.display = "grid";
        
        let errorMsg = error.message;
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMsg = "Network connection failed";
        } else if (error.name === 'AbortError') {
            errorMsg = "Connection timeout";
        }
        
        document.querySelector("#sideload-error > span").innerHTML = `
            <strong>Connection Failed</strong><br><br>
            Could not connect to: <code>${host}</code><br><br>
            <strong>Troubleshooting:</strong><br>
            • Make sure PicoZen app is running on your headset<br>
            • Check that sideloading is enabled in the app<br>
            • Verify the IP address is correct<br>
            • Ensure both devices are on the same network<br>
            • Try accessing <a href="http://${host}" target="_blank">http://${host}</a> directly<br><br>
            <em>Error: ${errorMsg}</em>
        `;
        
        setLoading(false);
        return;
    }

    setLoading(false);
    renderFileList();
}

// Simple HTML directory listing parser (fallback)
function parseHTMLListing(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href]');
        
        const files = [];
        const dirs = [];
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            const name = link.textContent.trim();
            
            if (href && name && !href.startsWith('http') && name !== '../') {
                if (href.endsWith('/')) {
                    dirs.push({ name: name, path: href });
                } else {
                    files.push({ name: name, path: href });
                }
            }
        });
        
        if (files.length > 0 || dirs.length > 0) {
            return { files, dirs };
        }
    } catch (e) {
        console.warn("Failed to parse HTML listing:", e);
    }
    return null;
}

function renderFileList() {
    document.querySelector("#sideload-list").innerHTML = "";

    if (itemList.length === 0) {
        document.querySelector("#sideload-list").style.display = "none";
        document.querySelector("#sideload-error").style.display = "grid";
        
        if (!host) {
            showSetupInstructions();
        } else if (isConnected) {
            document.querySelector("#sideload-error > span").innerHTML = `
                <strong>No Files Found</strong><br><br>
                The directory appears to be empty.<br>
                Try uploading some APK files to your headset first.
            `;
        }
        return;
    }

    document.querySelector("#sideload-list").style.display = "block";
    document.querySelector("#sideload-error").style.display = "none";

    for (let item of itemList) {
        let div = document.createElement("div");

        div.classList.add("sideload-item");
        div.classList.add(item.type);
        div.setAttribute("tabindex", "0");
        div.setAttribute("aria-label", 
            item.type === "dir" 
                ? `Folder, ${item.name === "../" ? "back" : item.name}` 
                : `File, ${item.name}. ${bytesReadable(item.size)}`
        );
        div.setAttribute("role", "button");

        let name = document.createElement("span");
        name.innerText = item.name;
        name.classList.add("name");
        div.appendChild(name);

        let modified = document.createElement("span");
        if (item.date) {
            try {
                modified.innerText = new Date(item.date).toLocaleString();
            } catch (e) {
                modified.innerText = "";
            }
        }
        modified.classList.add("modified");
        div.appendChild(modified);

        let size = document.createElement("span");
        size.innerText = bytesReadable(item.size);
        size.classList.add("size");
        div.appendChild(size);

        if (item.type === "dir") {
            div.addEventListener('click', async () => {
                currentPath = item.path;
                let activeElement = document.activeElement;
                await getFileList();
                if (activeElement === div) {
                    let firstItem = document.querySelector("#sideload-list > .sideload-item:first-child");
                    if (firstItem) firstItem.focus();
                }
            });
        } else {
            div.addEventListener('click', () => {
                downloadFile(item);
            });
        }

        document.querySelector("#sideload-list").appendChild(div);
    }
}

function downloadFile(item) {
    try {
        let url;
        if (host.startsWith('http://') || host.startsWith('https://')) {
            url = new URL(host);
        } else {
            url = new URL(`http://${host}`);
        }
        
        url.pathname = item.path;
        
        // Try different download parameters
        const downloadParams = [
            { action: "download" },
            { download: "1" },
            { dl: "1" },
            { }  // Direct file access
        ];
        
        // Try the first approach
        const downloadUrl = new URL(url.toString());
        downloadUrl.searchParams.set("action", "download");
        
        const aElement = document.createElement('a');
        aElement.setAttribute('download', item.name);
        aElement.href = downloadUrl.toString();
        aElement.setAttribute('target', '_blank');
        aElement.click();
        
        // Show feedback
        showNotification(`Downloading ${item.name}...`, 'success');
        
    } catch (error) {
        console.error("Download failed:", error);
        showNotification(`Failed to download ${item.name}: ${error.message}`, 'error');
    }
}

function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 2000;
        max-width: 300px;
        background-color: ${type === 'error' ? 'var(--color-alert)' : 'var(--color-success)'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function bytesReadable(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    
    const byteTypes = ["KB", "MB", "GB", "TB", "PB"];
    let currentByteType = "B";
    
    for (let byteType of byteTypes) {
        if (bytes < 1024) break;
        currentByteType = byteType;
        bytes = bytes / 1024;
    }

    return `${Math.round(bytes * 100) / 100} ${currentByteType}`;
}

function openSettings() {
    document.querySelector("#sideload-server-input").value = host;
    document.querySelector("#settings-overlay").style.display = "grid";
    document.querySelector("#left").setAttribute("inert", "true");
    document.querySelector("#right").setAttribute("inert", "true");
    document.querySelector("#settings").focus();
}

function closeSettings() {
    document.querySelector("#settings-overlay").style.display = "none";
    document.querySelector("#left").removeAttribute("inert");
    document.querySelector("#right").removeAttribute("inert");
}

async function changeServer() {
    const newHost = document.querySelector("#sideload-server-input").value.trim();
    
    if (newHost !== host) {
        host = newHost;
        localStorage.setItem("sideloadServer", host);
        currentPath = "/";
        
        closeSettings();
        
        if (host) {
            await getFileList();
        } else {
            showSetupInstructions();
        }
    } else {
        closeSettings();
    }
}

async function refreshList() {
    if (!isLoading && host) {
        await getFileList();
        showNotification("File list refreshed", 'success');
    }
}

// Event listeners
document.querySelector("#settings-btn").addEventListener('click', openSettings);
document.querySelector("#settings-overlay-backdrop").addEventListener('click', closeSettings);
document.querySelector("#settings > .close").addEventListener('click', closeSettings);
document.querySelector("#refresh-btn").addEventListener('click', refreshList);

document.addEventListener('keydown', ev => {
    if (ev.key === "Escape") closeSettings();
});

document.querySelector("#sideload-server-input").addEventListener('keydown', ev => {
    if (ev.key === "Enter") changeServer();
});

document.querySelector("#sideload-server-change").addEventListener('click', changeServer);

// Keyboard shortcuts
document.addEventListener('keydown', ev => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'r') {
        ev.preventDefault();
        refreshList();
    }
});

// Auto-refresh every 30 seconds if connected
setInterval(() => {
    if (isConnected && host && !isLoading) {
        getFileList();
    }
}, 30000);

// Add notification styles to the page
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);