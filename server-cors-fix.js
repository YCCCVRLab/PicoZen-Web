// server-cors-fix.js
// Use this configuration for your Koyeb server to fix CORS issues

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: [
    'https://ycccrlab.github.io',
    'https://ycccrlab.github.io/PicoZen-Web',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Add security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Sample apps endpoint
app.get('/api/apps', (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    
    // Sample app data - replace with your actual database/API calls
    const sampleApps = [
      {
        id: 1,
        title: 'UbiSim',
        developer: 'UbiSim',
        category: 'Education',
        shortDescription: 'Immersive VR nursing simulation platform',
        description: 'UbiSim is a VR nursing simulation platform that provides immersive clinical training experiences.',
        version: '1.18.0.157',
        rating: 4.8,
        downloadCount: 1250,
        fileSize: 157286400,
        iconUrl: 'https://scontent-lga3-3.oculuscdn.com/v/t64.5771-25/57570314_1220899138305712_3549230735456268391_n.jpg',
        downloadUrl: 'https://ubisimstreamingprod.blob.core.windows.net/builds/UbiSimPlayer-1.18.0.157.apk',
        featured: true
      },
      {
        id: 2,
        title: 'Sample VR Game',
        developer: 'VR Studios',
        category: 'Games',
        shortDescription: 'An exciting VR adventure game',
        description: 'Experience thrilling adventures in virtual reality with this immersive game.',
        version: '2.1.0',
        rating: 4.5,
        downloadCount: 2500,
        fileSize: 250000000,
        iconUrl: '',
        downloadUrl: '#',
        featured: false
      }
    ];
    
    // Filter by category if provided
    let filteredApps = sampleApps;
    if (category && category.toLowerCase() !== 'all') {
      filteredApps = sampleApps.filter(app => 
        app.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply limit
    const limitedApps = filteredApps.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      apps: limitedApps,
      total: filteredApps.length,
      category: category || 'all',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/apps:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get single app by ID
app.get('/api/apps/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Sample app lookup - replace with your database call
    const app = {
      id: parseInt(id),
      title: 'UbiSim',
      developer: 'UbiSim',
      category: 'Education',
      description: 'Detailed app information...',
      version: '1.18.0.157',
      rating: 4.8,
      downloadCount: 1250,
      fileSize: 157286400
    };
    
    if (!app) {
      return res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }
    
    res.json({
      success: true,
      app: app
    });
    
  } catch (error) {
    console.error('Error in /api/apps/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    categories: [
      'All',
      'Education',
      'Games',
      'Productivity',
      'Social',
      'Entertainment',
      'Tools'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 CORS enabled for multiple origins`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Apps API: http://localhost:${PORT}/api/apps`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;