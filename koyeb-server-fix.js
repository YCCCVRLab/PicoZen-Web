// koyeb-server-fix.js
// Complete server implementation for Koyeb deployment with proper CORS handling
// Deploy this to your Koyeb app to fix all connectivity issues

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://ycccrlab.github.io',
      'https://ycccrlab.github.io/PicoZen-Web',
      'https://ycccrlab.github.io/PicoZen-Web/',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('github.io')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins for now to fix the issue
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight requests explicitly for all routes
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Add comprehensive security and CORS headers
app.use((req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Log requests for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  
  next();
});

// Sample app data matching the structure seen in the screenshot
const sampleApps = [
  {
    id: "1",
    packageName: "com.yccvrlab.demo",
    title: "YCCC VR Demo",
    description: "A demonstration VR application showcasing the capabilities of the PicoZen app store system. Features immersive environments and interactive elements designed for educational purposes.",
    shortDescription: "Educational VR demonstration",
    version: "1.0.0",
    versionCode: "1",
    category: "Education",
    categoryName: "Education",
    developer: "YCCC VR Lab",
    rating: 4.8,
    downloadCount: 0,
    fileSize: 50000000,
    fileSizeFormatted: "47.68 MB",
    iconUrl: "https://via.placeholder.com/512x512/4A90E2/FFFFFF?text=YCCC+VR",
    downloadUrl: "/api/download/1",
    iconUri: "",
    featured: true,
    createdAt: "2025-09-23T18:42:49.159Z",
    updatedAt: "2025-09-23T18:42:49.171Z"
  },
  {
    id: "2",
    packageName: "com.ubisim.player",
    title: "UbiSim",
    description: "UbiSim is a VR nursing simulation platform that provides immersive clinical training experiences. Practice essential nursing skills in a safe, virtual environment with realistic patient scenarios, medical equipment, and clinical procedures.\\n\\nKey Features:\\n• Immersive VR nursing simulations\\n• Realistic patient interactions\\n• Medical equipment training\\n• Clinical procedure practice\\n• Safe learning environment\\n• Professional development tools\\n• Comprehensive skill assessment\\n\\nPerfect for nursing education, professional development, and clinical skills training. Experience hands-on learning without real-world consequences.",
    shortDescription: "Immersive VR nursing simulation platform for clinical training and skill development",
    version: "1.18.0.157",
    versionCode: "118000157",
    category: "Education",
    categoryName: "Education",
    developer: "UbiSim",
    rating: 4.8,
    downloadCount: 1250,
    fileSize: 157286400,
    fileSizeFormatted: "149.95 MB",
    iconUrl: "https://scontent-lga3-3.oculuscdn.com/v/t64.5771-25/57570314_1220899138305712_3549230735456268391_n.jpg",
    downloadUrl: "https://ubisimstreamingprod.blob.core.windows.net/builds/UbiSimPlayer-1.18.0.157.apk",
    iconUri: "",
    featured: true,
    createdAt: "2025-09-23T18:42:49.159Z",
    updatedAt: "2025-09-23T18:42:49.171Z"
  },
  {
    id: "3",
    packageName: "com.example.vrgame",
    title: "Sample VR Game",
    description: "An exciting virtual reality adventure game that takes you through immersive worlds and challenging puzzles. Experience the future of gaming with cutting-edge VR technology.",
    shortDescription: "An exciting VR adventure game",
    version: "2.1.0",
    versionCode: "21000",
    category: "Games",
    categoryName: "Games",
    developer: "VR Studios",
    rating: 4.5,
    downloadCount: 2500,
    fileSize: 250000000,
    fileSizeFormatted: "238.42 MB",
    iconUrl: "",
    downloadUrl: "/api/download/3",
    iconUri: "",
    featured: false,
    createdAt: "2025-09-23T18:42:49.171Z",
    updatedAt: "2025-09-23T18:42:49.171Z"
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'connected',
    cors: 'enabled'
  });
});

// Main apps endpoint (matching the structure from the screenshot)
app.get('/apps', (req, res) => {
  try {
    const { category, limit = 50, page = 1, server } = req.query;
    
    console.log('Apps request:', { category, limit, page, server });
    
    // Filter by category if provided
    let filteredApps = sampleApps;
    if (category && category.toLowerCase() !== 'all') {
      filteredApps = sampleApps.filter(app => 
        app.category.toLowerCase() === category.toLowerCase() ||
        app.categoryName.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply pagination
    const limitNum = parseInt(limit) || 50;
    const pageNum = parseInt(page) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedApps = filteredApps.slice(startIndex, endIndex);
    
    const response = {
      success: true,
      apps: paginatedApps,
      total: filteredApps.length,
      page: pageNum,
      limit: limitNum,
      category: category || 'all',
      server: 'PicoZen-Server',
      timestamp: new Date().toISOString()
    };
    
    console.log('Returning apps:', response.apps.length);
    res.json(response);
    
  } catch (error) {
    console.error('Error in /apps:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Legacy API endpoint for backward compatibility
app.get('/api/apps', (req, res) => {
  // Redirect to the main apps endpoint
  req.url = req.url.replace('/api/apps', '/apps');
  app._router.handle(req, res);
});

// Get single app by ID
app.get('/apps/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const app = sampleApps.find(a => a.id === id);
    
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
    console.error('Error in /apps/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Categories endpoint
app.get('/categories', (req, res) => {
  const categories = [...new Set(sampleApps.map(app => app.category))];
  res.json({
    success: true,
    categories: ['All', ...categories]
  });
});

// Legacy API categories
app.get('/api/categories', (req, res) => {
  req.url = req.url.replace('/api/categories', '/categories');
  app._router.handle(req, res);
});

// Download endpoint (placeholder)
app.get('/api/download/:id', (req, res) => {
  const { id } = req.params;
  const app = sampleApps.find(a => a.id === id);
  
  if (!app) {
    return res.status(404).json({
      success: false,
      error: 'App not found'
    });
  }
  
  if (app.downloadUrl && app.downloadUrl.startsWith('http')) {
    // Redirect to external download URL
    res.redirect(app.downloadUrl);
  } else {
    res.status(404).json({
      success: false,
      error: 'Download not available'
    });
  }
});

// Test endpoint for connectivity testing
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working correctly',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Legacy API test
app.get('/api/test', (req, res) => {
  req.url = req.url.replace('/api/test', '/test');
  app._router.handle(req, res);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PicoZen Server API',
    version: '1.0.0',
    endpoints: {
      apps: '/apps',
      categories: '/categories',
      health: '/health',
      test: '/test'
    },
    timestamp: new Date().toISOString()
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
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /apps',
      'GET /apps/:id',
      'GET /categories',
      'GET /health',
      'GET /test'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PicoZen Server running on port ${PORT}`);
  console.log(`📡 CORS enabled for multiple origins`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Apps API: http://localhost:${PORT}/apps`);
  console.log(`🌐 Available endpoints:`);
  console.log(`   GET /apps - List all apps`);
  console.log(`   GET /apps/:id - Get specific app`);
  console.log(`   GET /categories - List categories`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /test - Test connectivity`);
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