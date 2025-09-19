# PicoZen Web - Complete VR App Store & Sideloading Platform

A complete recreation of the original PicoZen web interface with enhanced app store functionality, maintained by YCCC VR Lab.

## 🌐 Live Website
**https://ycccrlab.github.io/PicoZen-Web/**

## ✨ Features

### 📱 VR App Store
- **Browse VR Apps** - Curated collection of VR applications
- **Category Filtering** - Games, Education, Productivity, Social, Entertainment, Tools
- **App Details** - Descriptions, ratings, download counts, screenshots
- **Direct Downloads** - One-click APK downloads
- **Featured Apps** - Highlighted educational and popular applications

### 🔧 Original PicoZen Sideloading
- **File Browsing** - Navigate headset file system wirelessly
- **Wireless Downloads** - Transfer files without cables
- **Directory Navigation** - Full folder structure access
- **Multiple File Types** - APKs, media files, documents, and more

### 🎯 Educational Focus
- **UbiSim Integration** - VR nursing simulation platform
- **Educational Categories** - Learning and training applications
- **YCCC VR Lab Branding** - Customized for academic use
- **Professional Interface** - Clean, intuitive design

## 🚀 Quick Start

### For Students & Educators

1. **Browse Apps**: Visit https://ycccrlab.github.io/PicoZen-Web/
2. **Download APKs**: Click any app to download the APK file
3. **Install on Headset**: Sideload the APK to your VR device
4. **Enjoy**: Launch the app in VR!

### For Sideloading Files

1. **Install PicoZen App**: Download from [releases](https://github.com/YCCCVRLab/PicoZen/releases/latest)
2. **Enable Web Server**: Open PicoZen → Sideload → Enable Web Server
3. **Connect**: Click settings ⚙️ and enter your headset's IP address
4. **Browse Files**: Navigate and download files wirelessly

## 🎓 Featured Applications

### UbiSim - VR Nursing Simulation
- **Developer**: UbiSim
- **Category**: Education
- **Description**: Immersive VR nursing simulation platform for clinical training
- **Features**: 
  - Realistic patient interactions
  - Medical equipment training
  - Clinical procedure practice
  - Safe learning environment
- **Perfect for**: Nursing education, professional development, clinical skills training

*More educational VR apps coming soon!*

## 🔧 Technical Details

### Original PicoZen Design
- **Authentic Interface** - Matches original PicoZen web design
- **Dark Theme** - VR-optimized color scheme
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Accessibility** - Keyboard navigation and screen reader support

### Enhanced Functionality
- **App Store Integration** - Connect to PicoZen-Server backend
- **Fallback Mode** - Works offline with curated app list
- **Dual Mode** - Switch between Apps and Sideload sections
- **Settings Management** - Configure API and sideload servers

### Browser Compatibility
- ✅ Chrome/Chromium (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🏫 YCCC VR Lab Integration

### Educational Use Cases
- **Nursing Training** - UbiSim and medical simulation apps
- **Classroom Management** - Easy app distribution to multiple headsets
- **Student Projects** - File sharing and collaboration tools
- **Professional Development** - Training simulations and skill assessment

### Institution Benefits
- **Centralized App Management** - Curated educational content
- **Easy Deployment** - No complex setup required
- **Cost Effective** - Open source and self-hosted options
- **Privacy Focused** - Local network operation

## 🛠️ For Developers

### Connecting to Your Server

```javascript
// Set custom API server in browser console
localStorage.setItem('apiServer', 'https://your-server.com/api');
```

### API Integration

The interface expects these endpoints:
- `GET /api/apps` - List all apps
- `GET /api/apps?category=Education` - Filter by category
- `GET /api/download/:id` - Download app APK

### Customization

1. **Fork this repository**
2. **Edit configuration** in `script.js`
3. **Customize branding** in HTML/CSS
4. **Deploy** to your hosting service

## 📚 Related Projects

- **[PicoZen-Server](https://github.com/YCCCVRLab/PicoZen-Server)** - Backend API and database
- **[PicoZen Android](https://github.com/YCCCVRLab/PicoZen)** - VR headset application
- **[Original PicoZen](https://github.com/barnabwhy/PicoZen)** - Original project by barnabwhy

## 🤝 Contributing

We welcome contributions from the VR education community:

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your improvements
4. **Submit** a pull request

### Adding New Apps

To add apps to the store:
1. Use the [PicoZen-Server](https://github.com/YCCVRLab/PicoZen-Server) admin panel
2. Or submit app information via GitHub Issues
3. Include: APK URL, icon, description, category

## 📞 Support

### YCCC VR Lab
- **Location**: Room 112, Wells Campus
- **GitHub**: [YCCCVRLab](https://github.com/YCCCVRLab)
- **Issues**: Report bugs via GitHub Issues

### Community
- **Discord**: [PicoZen Community](https://discord.gg/D4DBD2N6sA)
- **Documentation**: Check individual project READMEs
- **Original Project**: [barnabwhy/PicoZen](https://github.com/barnabwhy/PicoZen)

## 📄 License

GPL-3.0 - Same as original PicoZen project

## 🙏 Acknowledgments

- **barnabwhy** - Original PicoZen creator
- **UbiSim** - VR nursing simulation platform
- **YCCC VR Lab** - Educational implementation and maintenance
- **VR Education Community** - Feedback and contributions

---

**Building the Future of VR Education** 🥽  
*YCCC VR Lab - York County Community College*