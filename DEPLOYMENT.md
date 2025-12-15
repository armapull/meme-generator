# Deployment Guide

This guide covers deploying your Meme App to various platforms.

## Prerequisites

Before deploying, ensure you have:
1. A Git repository with your code pushed to GitHub/GitLab/Bitbucket
2. Your InstantDB App ID (already configured in `lib/instant.ts`)
3. Sightengine API credentials (for content moderation)

## Option 1: Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the best integration.

### Steps:

1. **Install Vercel CLI** (optional, you can also use the web interface):
```bash
npm i -g vercel
```

2. **Deploy via Web Interface**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Configure Environment Variables**:
   In Vercel dashboard → Project Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_INSTANT_APP_ID=5509502a-a3f4-4057-9d8b-3c2d4498ad10
   MODERATION_API_KEY=your_sightengine_api_key
   MODERATION_API_SECRET=your_sightengine_api_secret
   ```

4. **Deploy via CLI** (alternative):
```bash
vercel
```
Follow the prompts and add environment variables when asked.

### Benefits:
- Automatic deployments on git push
- Free SSL certificate
- Global CDN
- Preview deployments for pull requests
- Zero configuration needed

---

## Option 2: Netlify

### Steps:

1. **Install Netlify CLI** (optional):
```bash
npm install -g netlify-cli
```

2. **Deploy via Web Interface**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with your GitHub account
   - Click "Add new site" → "Import an existing project"
   - Connect your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
   - Add environment variables (see below)
   - Click "Deploy site"

3. **Configure Environment Variables**:
   In Netlify dashboard → Site settings → Environment variables, add:
   ```
   NEXT_PUBLIC_INSTANT_APP_ID=5509502a-a3f4-4057-9d8b-3c2d4498ad10
   MODERATION_API_KEY=your_sightengine_api_key
   MODERATION_API_SECRET=your_sightengine_api_secret
   ```

4. **Create `netlify.toml`** (optional, for better configuration):
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Deploy via CLI:
```bash
netlify deploy --prod
```

---

## Option 3: Railway

### Steps:

1. **Go to Railway**:
   - Visit [railway.app](https://railway.app)
   - Sign up/login with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**:
   In Railway dashboard → Variables tab, add:
   ```
   NEXT_PUBLIC_INSTANT_APP_ID=5509502a-a3f4-4057-9d8b-3c2d4498ad10
   MODERATION_API_KEY=your_sightengine_api_key
   MODERATION_API_SECRET=your_sightengine_api_secret
   ```

4. **Configure Build Settings**:
   Railway auto-detects Next.js, but ensure:
   - Build Command: `npm run build`
   - Start Command: `npm start`

---

## Option 4: Render

### Steps:

1. **Go to Render**:
   - Visit [render.com](https://render.com)
   - Sign up/login with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your repository

3. **Configure Settings**:
   - **Name**: meme-app (or your choice)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid)

4. **Add Environment Variables**:
   In Render dashboard → Environment, add:
   ```
   NEXT_PUBLIC_INSTANT_APP_ID=5509502a-a3f4-4057-9d8b-3c2d4498ad10
   MODERATION_API_KEY=your_sightengine_api_key
   MODERATION_API_SECRET=your_sightengine_api_secret
   ```

5. **Deploy**: Click "Create Web Service"

---

## Option 5: Self-Hosted (VPS/Docker)

### Using Docker:

1. **Create `Dockerfile`**:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

2. **Update `next.config.js`** for standalone output:
```javascript
const nextConfig = {
  output: 'standalone',
  // ... rest of config
}
```

3. **Build and run**:
```bash
docker build -t meme-app .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_INSTANT_APP_ID=5509502a-a3f4-4057-9d8b-3c2d4498ad10 \
  -e MODERATION_API_KEY=your_key \
  -e MODERATION_API_SECRET=your_secret \
  meme-app
```

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] App loads without errors
- [ ] Environment variables are set correctly
- [ ] Memes can be created and posted
- [ ] Meme feed displays correctly
- [ ] Upvoting works
- [ ] Content moderation is working (if API keys are configured)
- [ ] Images load properly
- [ ] HTTPS is enabled (should be automatic on most platforms)

---

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Environment Variables Not Working
- Ensure `NEXT_PUBLIC_*` variables are set correctly
- Restart deployment after adding variables
- Check variable names match exactly (case-sensitive)

### InstantDB Connection Issues
- Verify `NEXT_PUBLIC_INSTANT_APP_ID` is correct
- Check InstantDB dashboard for app status
- Ensure schema is synced: `npx instant-cli@latest sync`

### Images Not Loading
- Check CORS settings if using external image URLs
- Verify image URLs are accessible
- Check browser console for errors

---

## Recommended: Vercel

For Next.js apps, **Vercel is the recommended choice** because:
- Zero configuration needed
- Automatic optimizations
- Best performance
- Free tier is generous
- Easy rollbacks
- Preview deployments

