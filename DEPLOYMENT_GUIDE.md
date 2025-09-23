# PicoZen CORS Fix & Deployment Guide

This guide will help you fix the CORS errors and connection issues between your PicoZen-Web frontend and the Koyeb server.

## 🔧 What Was Fixed

### Frontend Issues Fixed:
1. **TypeError: (app.rating || 0).toFixed is not a function**
   - Added proper data validation and type conversion
   - Created `safeNumber()` utility function
   - Added `normalizeAppData()` to ensure all app properties are properly formatted

2. **Improved API Error Handling**
   - Better error messages for failed API calls
   - Graceful fallback to mock data
   - Enhanced CORS request headers

### Backend CORS Configuration:
- Created `server-cors-fix.js` with proper CORS headers
- Added support for GitHub Pages and localhost origins
- Implemented preflight OPTIONS request handling

## 🚀 Quick Fix (Frontend Only)

The frontend fix has already been applied to your repository. The JavaScript error should now be resolved. You can test it by:

1. Visit: https://ycccrlab.github.io/PicoZen-Web/
2. Check the browser console - the TypeError should be gone
3. The app should now display with fallback data if the server is unreachable

## 🔧 Server Deployment (For Full Fix)

To completely fix the CORS issues, deploy the server configuration to Koyeb:

### Option 1: Deploy Server Files to Koyeb

1. **Create a new Koyeb service:**
   ```bash
   # Clone your repository
   git clone https://github.com/YCCCVRLab/PicoZen-Web.git
   cd PicoZen-Web
   
   # Install dependencies
   npm install
   ```

2. **Deploy to Koyeb:**
   - Go to [Koyeb Dashboard](https://app.koyeb.com/)
   - Create new service
   - Connect your GitHub repository: `YCCCVRLab/PicoZen-Web`
   - Set build command: `npm install`
   - Set run command: `npm start`
   - Set port: `3000` (or use environment variable `PORT`)

### Option 2: Update Existing Koyeb Server

If you already have a server running, add this CORS configuration:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://ycccrlab.github.io',
    'https://ycccrlab.github.io/PicoZen-Web',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
```

## 🧪 Testing the Fix

### 1. Test Frontend (Already Fixed)
```bash
# Open browser developer tools
# Navigate to: https://ycccrlab.github.io/PicoZen-Web/
# Check console - should see no TypeError errors
```

### 2. Test API Connection
```bash
# Test your Koyeb server directly
curl -X GET "https://above-odella-john-barr-40e8cdf4.koyeb.app/api/apps" \
  -H "Origin: https://ycccrlab.github.io" \
  -v

# Should return JSON data without CORS errors
```

### 3. Test CORS Preflight
```bash
# Test OPTIONS request (preflight)
curl -X OPTIONS "https://above-odella-john-barr-40e8cdf4.koyeb.app/api/apps" \
  -H "Origin: https://ycccrlab.github.io" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Should return 200 OK with proper CORS headers
```

## 🔍 Troubleshooting

### Common Issues:

**1. Still getting CORS errors?**
- Verify your server has the CORS configuration
- Check that your Koyeb deployment is using the updated code
- Ensure the server is listening on `0.0.0.0`, not just `localhost`

**2. API not returning data?**
- Check Koyeb logs for server errors
- Verify your API endpoints are working: `/api/apps`, `/api/health`
- Test direct server access without CORS

**3. Frontend still showing errors?**
- Clear browser cache and refresh
- Check that the updated JavaScript was deployed
- Verify the API server URL in settings

### Debug Commands:

```bash
# Check if server is running
curl https://above-odella-john-barr-40e8cdf4.koyeb.app/health

# Check CORS headers
curl -I -X OPTIONS https://above-odella-john-barr-40e8cdf4.koyeb.app/api/apps \
  -H "Origin: https://ycccrlab.github.io"

# Test full API call
curl https://above-odella-john-barr-40e8cdf4.koyeb.app/api/apps \
  -H "Origin: https://ycccrlab.github.io"
```

## 📱 Expected Behavior After Fix

1. **Frontend loads without JavaScript errors**
2. **Apps display properly with ratings and download counts**
3. **API calls work from GitHub Pages to Koyeb server**
4. **No CORS errors in browser console**
5. **Smooth switching between categories**

## 🔗 Useful Links

- **Frontend:** https://ycccrlab.github.io/PicoZen-Web/
- **Server:** https://above-odella-john-barr-40e8cdf4.koyeb.app/
- **Koyeb Dashboard:** https://app.koyeb.com/
- **Repository:** https://github.com/YCCCVRLab/PicoZen-Web

## 📞 Need Help?

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Look at Koyeb deployment logs
3. Test the API endpoints directly with curl
4. Verify CORS headers are being sent by the server

The main fix has been applied to the frontend, so the TypeError should be resolved immediately. The server CORS configuration will eliminate any remaining connection issues.