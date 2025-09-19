# PicoZen Web Setup Guide

## 🚀 Quick Start

### Step 1: Install PicoZen App
1. Download the PicoZen APK from [YCCCVRLab/PicoZen releases](https://github.com/YCCCVRLab/PicoZen/releases/latest)
2. Sideload it to your PICO or Quest headset using SideQuest, ADB, or another sideloading method
3. Launch the PicoZen app on your headset

### Step 2: Enable Web Server
1. Open PicoZen on your headset
2. Navigate to the **Sideload** section
3. Enable the **"Web Server"** option
4. Note the IP address displayed (e.g., `192.168.1.100:8080`)

### Step 3: Connect via Web Interface
1. Visit: **https://ycccrlab.github.io/PicoZen-Web/**
2. Click the settings gear ⚙️ in the bottom left
3. Enter your headset's IP address in the server field
4. Click **"Connect"**

### Step 4: Start Sideloading!
- Browse files and folders on your headset
- Click any APK file to download it to your computer
- Upload files by using the PicoZen app's file management features

---

## 🔧 Detailed Setup Instructions

### For PICO Headsets
1. **Enable Developer Mode:**
   - Go to Settings > General > Developer Mode
   - Enable Developer Mode and USB Debugging

2. **Install PicoZen:**
   - Use PICO Developer Center or SideQuest
   - Or use ADB: `adb install PicoZen.apk`

3. **Network Setup:**
   - Ensure headset is connected to WiFi
   - Note the IP address in Settings > WiFi > [Your Network] > Advanced

### For Quest Headsets
1. **Enable Developer Mode:**
   - Set up Meta Developer Account
   - Enable Developer Mode in Oculus app
   - Enable USB Debugging on headset

2. **Install PicoZen:**
   - Use SideQuest (recommended)
   - Or use ADB: `adb install PicoZen.apk`

3. **Network Setup:**
   - Connect to same WiFi as your computer
   - Check IP in Settings > WiFi

---

## 🌐 Network Requirements

### Same Network
- **Computer and headset must be on the same WiFi network**
- Some corporate/school networks block device-to-device communication
- Guest networks often have isolation enabled

### Firewall Settings
- Windows: Allow PicoZen through Windows Firewall
- Mac: System Preferences > Security & Privacy > Firewall > Options
- Router: Ensure AP Isolation is disabled

### Alternative: Hotspot Mode
If network issues persist:
1. Enable hotspot on your headset
2. Connect computer to headset's hotspot
3. Use the hotspot gateway IP (usually `192.168.43.1:8080`)

---

## 🔍 Troubleshooting

### "Connection Failed" Error

**Check Network Connection:**
```bash
# Test if headset is reachable
ping 192.168.1.100

# Test if web server is running
curl http://192.168.1.100:8080
```

**Common Solutions:**
1. **Restart PicoZen app** on headset
2. **Disable/re-enable web server** in app
3. **Check firewall settings** on both devices
4. **Try different port** (some routers block certain ports)
5. **Use headset hotspot** instead of WiFi

### "No Files Found" Error

**Possible Causes:**
- Directory is actually empty
- App doesn't have storage permissions
- Files are in a different location

**Solutions:**
1. Grant storage permissions to PicoZen
2. Navigate to `/sdcard/` or `/storage/emulated/0/`
3. Upload test files using PicoZen app first

### Slow Connection

**Optimization Tips:**
- Use 5GHz WiFi instead of 2.4GHz
- Reduce distance between devices
- Close other network-heavy apps
- Use wired connection for computer if possible

### Downloads Not Working

**Browser Issues:**
- Try different browser (Chrome, Firefox, Safari)
- Disable popup blockers
- Check download permissions
- Clear browser cache

**Network Issues:**
- Large files may timeout
- Try downloading smaller files first
- Check available storage space

---

## 🎯 Educational Use Cases

### VR Lab Management
- **Batch App Installation:** Download APKs to distribute to multiple headsets
- **Content Curation:** Organize educational VR apps and experiences
- **Student Projects:** Easy file transfer for student-created content

### Development Workflow
- **Testing Builds:** Quickly deploy and test APK builds
- **Asset Transfer:** Move 3D models, videos, and other assets
- **Backup Solutions:** Create backups of important VR content

### Classroom Integration
- **Lesson Preparation:** Pre-load content for specific lessons
- **Student Collaboration:** Share projects between students
- **Assessment Tools:** Collect student work from headsets

---

## 🛠️ Advanced Configuration

### Custom Server URLs
For advanced users running custom servers:
```javascript
// In browser console, set custom server
localStorage.setItem("filesServerUrl", "http://your-server:port");
```

### API Endpoints
The web interface expects these endpoints:
- `GET /?action=list` - Returns JSON file listing
- `GET /path/to/file?action=download` - Downloads file
- CORS headers must be enabled

### Security Considerations
- **Local Network Only:** Never expose to internet
- **Temporary Use:** Disable web server when not needed
- **File Permissions:** Be cautious with sensitive files

---

## 📞 Support

### YCCC VR Lab Resources
- **GitHub:** [YCCCVRLab/PicoZen-Web](https://github.com/YCCCVRLab/PicoZen-Web)
- **Issues:** Report bugs via GitHub Issues
- **VR Lab:** Room 112, Wells Campus

### Community Support
- **Discord:** [PicoZen Community](https://discord.gg/D4DBD2N6sA)
- **Original Project:** [barnabwhy/PicoZen](https://github.com/barnabwhy/PicoZen)

### Technical Documentation
- **Web API:** See `/api-docs` endpoint on running server
- **App Documentation:** Check PicoZen app's help section
- **Network Diagnostics:** Use browser developer tools

---

## 📋 Checklist

Before asking for help, please verify:

- [ ] PicoZen app is installed and running on headset
- [ ] Web server is enabled in PicoZen app
- [ ] Both devices are on the same WiFi network
- [ ] IP address is entered correctly (including port number)
- [ ] Firewall allows connections on the specified port
- [ ] Browser allows downloads from the site
- [ ] No VPN or proxy interfering with local connections

---

*Last updated: September 19, 2025*
*YCCC VR Lab - York County Community College*