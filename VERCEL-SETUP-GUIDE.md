# Vercel Deployment Setup Guide

## 🚀 Quick Setup Instructions

Your project has a monorepo structure with `frontend` and `backend` directories. Vercel needs to be configured to deploy only the frontend.

---

## 📋 Step-by-Step Deployment

### 1. **Import Project to Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `Daninc24/myshop`

### 2. **Configure Root Directory** ⚠️ IMPORTANT

In the project configuration screen:

1. **Framework Preset:** Vite
2. **Root Directory:** Click "Edit" and set to `frontend`
3. **Build Command:** `npm run build` (auto-detected)
4. **Output Directory:** `dist` (auto-detected)
5. **Install Command:** `npm install` (auto-detected)

### 3. **Add Environment Variables**

In the "Environment Variables" section, add:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_GA_ID=your_google_analytics_id (optional)
```

**Important:** Make sure to add these for all environments (Production, Preview, Development)

### 4. **Deploy**

Click "Deploy" and Vercel will:
- Install dependencies from `frontend/package.json`
- Build the Vite app
- Deploy to a `.vercel.app` URL

---

## 🔧 Configuration Files

### `vercel.json` (in root)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This file only handles SPA routing. The root directory is configured in Vercel's project settings.

---

## ✅ After Deployment

1. **Note your Vercel URL:** `https://your-app.vercel.app`

2. **Update Backend CORS:**
   - Go to Render dashboard
   - Add environment variable: `FRONTEND_URL=https://your-app.vercel.app`
   - Or update `ALLOWED_ORIGINS` in `backend/src/server.js`
   - Redeploy backend

3. **Test the deployment:**
   - Visit your Vercel URL
   - Check browser console for errors
   - Test API connectivity
   - Verify all features work

---

## 🐛 Troubleshooting

### Build Fails: "Cannot find module"
**Solution:** Make sure "Root Directory" is set to `frontend` in Vercel project settings

### API Calls Fail
**Solution:** Check that `VITE_API_URL` environment variable is set correctly in Vercel

### CORS Errors
**Solution:** Add your Vercel URL to backend's `ALLOWED_ORIGINS` array

### Environment Variables Not Working
**Solution:** Make sure variables are prefixed with `VITE_` and redeploy after adding them

---

## 📝 Important Notes

1. **Root Directory:** Must be set to `frontend` in Vercel project settings (not in vercel.json)
2. **Environment Variables:** Must start with `VITE_` to be accessible in the frontend
3. **Backend URL:** Must end with `/api` in the `VITE_API_URL` variable
4. **Automatic Deployments:** Every push to `main` branch will trigger a new deployment

---

## 🔄 Redeployment

To redeploy:
1. Push changes to GitHub
2. Vercel automatically detects and deploys
3. Or manually trigger from Vercel dashboard

---

## 📞 Need Help?

If deployment fails:
1. Check Vercel build logs
2. Verify root directory is set to `frontend`
3. Verify all environment variables are set
4. Check that `frontend/package.json` exists and is valid

---

**Your frontend will be deployed to:** `https://your-project-name.vercel.app`
