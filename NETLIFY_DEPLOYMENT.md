# Netlify Deployment Guide for Plant Tracker

## 🚀 Quick Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your Plant Tracker repository

3. **Configure Build Settings**:
   ```
   Build command: npm run build
   Publish directory: out
   ```

4. **Environment Variables**: Set these in Netlify dashboard under "Site settings" > "Environment variables":
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=https://your-app-name.netlify.app
   NEXT_PUBLIC_ENVIRONMENT=production
   NEXT_TELEMETRY_DISABLED=1
   ```

5. **Deploy**: Click "Deploy site"

### Option 2: Manual Deploy

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=out
```

## 🔧 Optimizations Included

### Performance Optimizations
- ✅ **Static Export**: Configured for optimal performance
- ✅ **Image Optimization**: Next.js Image component with optimization
- ✅ **Bundle Splitting**: Optimized webpack configuration
- ✅ **Code Minification**: SWC minification enabled
- ✅ **Tree Shaking**: Automatic dead code elimination
- ✅ **Lazy Loading**: Components load only when needed

### SEO & PWA Features
- ✅ **Meta Tags**: Complete OpenGraph and Twitter meta tags
- ✅ **Sitemap**: XML sitemap for search engines
- ✅ **Robots.txt**: Search engine guidelines
- ✅ **PWA Manifest**: Progressive Web App support
- ✅ **Structured Data**: SEO-friendly markup

### Security & Headers
- ✅ **Security Headers**: XSS protection, content type options
- ✅ **HTTPS Redirect**: Automatic HTTPS enforcement
- ✅ **CSP Headers**: Content Security Policy
- ✅ **Cache Control**: Optimized caching strategy

## 📁 File Structure for Deployment

```
public/
├── manifest.json          # PWA manifest
├── robots.txt            # SEO robots file
├── sitemap.xml           # XML sitemap
├── favicon.ico           # Favicon
├── icon-192.png          # PWA icon 192x192
├── icon-512.png          # PWA icon 512x512
├── apple-touch-icon.png  # iOS icon
├── og-image.png          # OpenGraph image
└── assets/
    └── tamagatchi.png    # Tamagotchi image

netlify.toml              # Netlify configuration
```

## 🔄 Build Process

The build process will:
1. Compile TypeScript to JavaScript
2. Bundle and minify all assets
3. Optimize images and fonts
4. Generate static HTML files
5. Create service worker for PWA
6. Output to `out/` directory

## 📱 Progressive Web App Features

Your Plant Tracker will be installable as a PWA with:
- **Offline Support**: Works without internet connection
- **App-like Experience**: Feels like a native mobile app
- **Push Notifications**: (If enabled in future updates)
- **Home Screen Installation**: Users can install to home screen

## 🎯 Performance Targets

Expected Lighthouse scores:
- **Performance**: 95+ 
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **PWA**: 100

## 🔧 Custom Domain Setup

1. **Purchase Domain**: Buy a custom domain
2. **Configure DNS**: Point your domain to Netlify:
   ```
   CNAME www your-app-name.netlify.app
   A @ 75.2.60.5
   ```
3. **SSL Certificate**: Netlify auto-generates SSL certificates
4. **Update Environment**: Update `NEXT_PUBLIC_APP_URL` to your custom domain

## 📊 Monitoring & Analytics

### Built-in Netlify Analytics
- Page views and unique visitors
- Top pages and traffic sources
- Bandwidth usage

### Optional: Google Analytics
Add to environment variables:
```
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Optional: Sentry Error Tracking
Add to environment variables:
```
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Fails**: Check Node.js version (requires 18+)
   ```bash
   node --version  # Should be 18.x.x or higher
   ```

2. **Images Not Loading**: Ensure images are in `public/` directory

3. **Environment Variables**: Double-check all required env vars are set

4. **Supabase Connection**: Verify Supabase URL and keys are correct

### Debug Commands

```bash
# Test build locally
npm run build
npm run start

# Check for TypeScript errors
npm run type-check

# Lint code
npm run lint

# Analyze bundle size
npm run analyze
```

## 🔄 Continuous Deployment

Once connected to GitHub:
- ✅ **Auto Deploy**: Pushes to main branch auto-deploy
- ✅ **Preview Builds**: Pull requests get preview URLs
- ✅ **Rollback**: Easy rollback to previous versions
- ✅ **Branch Deploys**: Deploy from different branches

## 📈 Post-Deployment Checklist

- [ ] Test all pages and functionality
- [ ] Verify PWA installation works
- [ ] Check mobile responsiveness
- [ ] Test offline functionality
- [ ] Validate meta tags with social media debuggers
- [ ] Run Lighthouse audit
- [ ] Test form submissions (if any)
- [ ] Verify analytics are working

## 🎉 Your Plant Tracker is Live!

Share your deployed app:
- **URL**: `https://your-app-name.netlify.app`
- **Social Media**: Use the built-in share meta tags
- **App Store**: Consider publishing as PWA to app stores

## 📞 Support

If you encounter issues:
1. Check [Netlify documentation](https://docs.netlify.com/)
2. Review build logs in Netlify dashboard
3. Check [Next.js deployment docs](https://nextjs.org/docs/deployment/static-export)

---

**Happy Planting! 🌱** 