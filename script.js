// Default to localhost for local development, but allow custom servers
const DEFAULT_FILES_URL = "http://localhost:8080";

let host = localStorage.getItem("sideloadServer") || "";
let filesUrl = localStorage.getItem("filesServerUrl") || DEFAULT_FILES_URL;
let currentPath = "/";
let itemList = [];
let isConnected = false;

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

async function getFileList() {
    itemList = [];
    
    if (!host) {
        showSetupInstructions();
        return;
    }

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
        
        // Add API endpoint for file listing
        url.searchParams.set("action", "list");
        
        console.log("Fetching from:", url.toString());
        
        let res = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        let data = await res.json();
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
        document.querySelector("#sideload-error > span").innerHTML = `
            <strong>Connection Failed</strong><br><br>
            Could not connect to: <code>${host}</code><br><br>
            <strong>Troubleshooting:</strong><br>
            • Make sure PicoZen app is running on your headset<br>
            • Check that sideloading is enabled in the app<br>
            • Verify the IP address is correct<br>
            • Ensure both devices are on the same network<br>
            • Try accessing <a href="http://${host}" target="_blank">http://${host}</a> directly<br><br>
            <em>Error: ${error.message}</em>
        `;
        return;
    }

    renderFileList();
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
        url.searchParams.set("action", "download");
        
        const aElement = document.createElement('a');
        aElement.setAttribute('download', item.name);
        aElement.href = url.toString();
        aElement.setAttribute('target', '_blank');
        aElement.click();
    } catch (error) {
        console.error("Download failed:", error);
        alert(`Failed to download ${item.name}: ${error.message}`);
    }
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
        
        // Show loading state
        document.querySelector("#sideload-error > span").innerHTML = "Connecting...";
        document.querySelector("#sideload-list").style.display = "none";
        document.querySelector("#sideload-error").style.display = "grid";
        
        await getFileList();
    }
    
    closeSettings();
}

// Event listeners
document.querySelector("#settings-btn").addEventListener('click', openSettings);
document.querySelector("#settings-overlay-backdrop").addEventListener('click', closeSettings);
document.querySelector("#settings > .close").addEventListener('click', closeSettings);

document.addEventListener('keydown', ev => {
    if (ev.key === "Escape") closeSettings();
});

document.querySelector("#sideload-server-input").addEventListener('keydown', ev => {
    if (ev.key === "Enter") changeServer();
});

document.querySelector("#sideload-server-change").addEventListener('click', changeServer);

// Add refresh functionality
document.addEventListener('keydown', ev => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'r') {
        ev.preventDefault();
        getFileList();
    }
});

// Auto-refresh every 30 seconds if connected
setInterval(() => {
    if (isConnected && host) {
        getFileList();
    }
}, 30000);