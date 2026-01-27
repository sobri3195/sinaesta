# Vercel Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Vercel account
- Project repository connected to Vercel

## Environment Variables

Before deploying, ensure these environment variables are set in Vercel:

### Required
- `GEMINI_API_KEY` - Your Google Gemini API key for AI features
- `VITE_API_URL` - Your backend API URL (e.g., `https://your-backend.vercel.app/api`)

### Optional
- `JWT_SECRET` - JWT secret key (if deploying backend separately)
- `JWT_REFRESH_SECRET` - JWT refresh token secret

## Deployment Steps

### 1. Automatic Deployment (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Vercel will automatically detect Vite framework
4. Configure environment variables in Vercel dashboard
5. Click Deploy

### 2. Manual Deployment via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Build Configuration

The project uses:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Known Issues & Solutions

### Issue: "Object prototype may only be an Object or null: undefined"

**Fixed**: Updated Zustand imports from `zustand/middleware` to `zustand/middleware/persist`

### Issue: Chrome extension errors

Chrome extension errors (like `chrome-extension://...`) are not related to your application and can be safely ignored. These are from browser extensions interfering with the page.

## Backend Deployment

If you need to deploy the backend separately:

### Option 1: Vercel Serverless Functions
- Move `server` code to `api/` directory
- Vercel will automatically deploy as serverless functions

### Option 2: Separate Backend Deployment
- Deploy backend to Railway, Render, or Heroku
- Set `VITE_API_URL` to your backend URL in Vercel environment variables

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Test demo accounts
- [ ] Verify file uploads (if enabled)
- [ ] Check WebSocket connections (if backend deployed)
- [ ] Test responsive design

## Troubleshooting

### Build Fails

1. Clear Vercel cache in deployment settings
2. Check Node.js version (use 18+)
3. Verify all dependencies are in package.json
4. Check environment variables are properly set

### Assets Not Loading

- Ensure `vercel.json` routes are correctly configured
- Check file paths in code
- Verify `dist` directory is built correctly

### API Connection Issues

- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is deployed and accessible

## Production Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use Vercel environment variables for sensitive data
3. **Monitoring**: Enable Vercel Analytics for performance monitoring
4. **Error Tracking**: Integrate Sentry for error tracking
5. **HTTPS**: Vercel automatically provides SSL certificates

## Support

For issues specific to:
- **Vercel Deployment**: Check [Vercel Documentation](https://vercel.com/docs)
- **SINAESTA Platform**: Review project documentation files
- **Build Issues**: Check Vite configuration in `vite.config.ts`
