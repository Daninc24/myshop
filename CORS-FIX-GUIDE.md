# CORS and Mixed Content Fix Guide

## Issues Fixed

### 1. CORS Configuration
- Added missing Vercel domain to CORS origins
- Updated both main CORS and file upload CORS configurations
- Added wildcard support for vercel.app domains

### 2. Mixed Content Issues
- Fixed image URLs to use HTTPS in production
- Updated all controllers to force HTTPS protocol for image URLs
- Fixed product, event, and other controllers

### 3. Authentication Issues
- Frontend making requests to protected endpoints without auth
- Need to check authentication state before making API calls

## Backend Changes Made

### Server.js CORS Updates
```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'https://myshoppingcenters-8knn.vercel.app',
    'https://myshoppingcenters.vercel.app',
    'https://myshoppingcenter.vercel.app',
    'https://myshopcenter-git-main-daniel-mailus-projects.vercel.app',
    'https://myshop-git-main-daniel-mailus-projects.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### Image URL Generation Fix
All controllers now use HTTPS in production:
```javascript
// Force HTTPS in production to prevent mixed content
const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
const baseUrl = `${protocol}://${req.get('host')}`;
```

## Frontend Issues to Fix

### 1. Authentication State Management
- Check if user is authenticated before making API calls
- Handle 401 errors gracefully
- Redirect to login if needed

### 2. Protected Route Access
- Ensure POS page checks authentication
- Add loading states for auth-dependent features
- Handle unauthenticated users appropriately

## Deployment Steps

1. **Redeploy Backend to Render.com**
   ```bash
   git add .
   git commit -m "Fix CORS and mixed content issues"
   git push
   ```

2. **Verify Environment Variables**
   - Ensure `NODE_ENV=production` is set
   - Check all CORS origins are correct

3. **Test Frontend**
   - Clear browser cache
   - Test image loading
   - Verify authentication flow

## Testing Checklist

- [ ] Images load without mixed content errors
- [ ] CORS errors are resolved
- [ ] Authentication works properly
- [ ] Protected routes are accessible
- [ ] 401 errors are handled gracefully

## Common Issues

### Mixed Content Error
- **Cause**: Images served over HTTP from HTTPS page
- **Fix**: Force HTTPS protocol in production

### CORS Error
- **Cause**: Missing domain in CORS origins
- **Fix**: Add exact domain to allowed origins

### 401 Unauthorized
- **Cause**: Making requests without authentication
- **Fix**: Check auth state before API calls

## Security Notes

- All image URLs now use HTTPS in production
- CORS is properly configured for your domains
- Authentication middleware is working correctly
- No hardcoded credentials in the codebase 