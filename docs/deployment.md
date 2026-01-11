# Deployment Guide

This project uses **Cloudflare Pages** for hosting with automatic deployments via Git integration.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Push to Branch                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Pages (Automatic)                   │
│  1. Detects push                                            │
│  2. Runs: npm install && npm run build                      │
│  3. Deploys dist/ to CDN                                    │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Live in ~60 seconds                      │
│        https://<branch>.gametime-tic-tac-toe.pages.dev      │
└─────────────────────────────────────────────────────────────┘
```

## Branch Strategy

| Branch | Environment | URL | Purpose |
|--------|-------------|-----|---------|
| `release` | **Production** | `gametime-tic-tac-toe.pages.dev` | Live users |
| `main` | **Preview/Beta** | `main.gametime-tic-tac-toe.pages.dev` | Beta testing |
| `feature-*` | **Development** | `<branch>.gametime-tic-tac-toe.pages.dev` | Feature previews |

### Workflow

```
feature-branch → main (beta) → release (production)
```

1. **Development**: Create feature branches from `main`
2. **Preview**: Push to get a unique preview URL for that branch
3. **Beta Testing**: Merge to `main` for beta users to test
4. **Production**: Run release workflow to deploy to `release`

## Deployment Environments

### Production (`release` branch)

- **URL**: https://gametime-tic-tac-toe.pages.dev
- **Audience**: All users
- **Deploys when**: `main` is merged to `release` via workflow
- **Rollback**: Instant via Cloudflare dashboard

### Preview/Beta (`main` branch)

- **URL**: https://main.gametime-tic-tac-toe.pages.dev
- **Audience**: Beta testers, QA
- **Deploys when**: Feature branches merge to `main`
- **Purpose**: Final validation before production

### Feature Previews (`feature-*` branches)

- **URL**: https://`<branch-name>`.gametime-tic-tac-toe.pages.dev
- **Audience**: Developers, code reviewers
- **Deploys when**: Push to any `feature-*` branch
- **Auto-deleted**: When branch is deleted after merge

## Releasing to Production

### Using GitHub CLI (Recommended)

```bash
gh workflow run release-to-production.yml -f confirm=release
```

### Using GitHub Web UI

1. Go to **Actions** tab
2. Select **Release to Production** workflow
3. Click **Run workflow**
4. Type `release` in the confirmation field
5. Click **Run workflow**

### What Happens

1. Workflow fast-forwards `release` to match `main`
2. Cloudflare detects the push to `release`
3. Build runs (~30 seconds)
4. Deployment goes live (~30 seconds)
5. Previous deployment available for instant rollback

## Cloudflare Pages Configuration

### Build Settings

| Setting | Value |
|---------|-------|
| Production branch | `release` |
| Preview branches | `main`, `feature-*` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_VERSION` | `20` | Node.js version for build |

### Build Behavior

- **Auto-deploy**: On every push to configured branches
- **Build timeout**: 20 minutes (default)
- **Concurrent builds**: 1 per project
- **Cache**: Node modules cached between builds

## Manual Deployment

For emergency deployments or testing:

### 1. Build Locally

```bash
npm run build
```

### 2. Deploy via Wrangler

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to preview
wrangler pages deploy dist --project-name=gametime-tic-tac-toe

# Deploy to production
wrangler pages deploy dist --project-name=gametime-tic-tac-toe --branch=release
```

## Rollback Procedures

### Via Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages → `gametime-tic-tac-toe`
2. Click **Deployments**
3. Find the previous working deployment
4. Click **...** → **Rollback to this deployment**
5. Confirm rollback

Rollbacks are instant (no rebuild needed).

### Via Git

```bash
# Revert the problematic commit on release
git checkout release
git revert HEAD
git push origin release
```

This triggers a new build with the reverted code.

## Custom Domain Setup

To add a custom domain (e.g., `tictactoe.example.com`):

### 1. Add Domain in Cloudflare

1. Dashboard → Pages → Project → Custom domains
2. Click **Set up a custom domain**
3. Enter your domain
4. Choose **Cloudflare DNS** or **External DNS**

### 2. DNS Configuration

**For Cloudflare DNS** (automatic):
- CNAME record created automatically

**For External DNS** (manual):
```
CNAME  tictactoe  gametime-tic-tac-toe.pages.dev
```

### 3. SSL Certificate

Cloudflare provides free SSL automatically. Certificate provisioning takes ~15 minutes.

## Monitoring & Analytics

### Cloudflare Analytics

Available in Cloudflare Dashboard → Pages → Analytics:

- **Requests**: Total requests per day
- **Bandwidth**: Data transferred
- **Unique visitors**: Estimated unique visitors
- **Page views**: Top pages by visits

### Web Vitals

The PWA tracks Core Web Vitals automatically:

| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |

## Caching Strategy

### Default Behavior

Cloudflare Pages uses intelligent caching:

- **HTML**: No cache (always fresh)
- **Assets** (`*.js`, `*.css`): Cached with hash-based filenames
- **Static files**: Cached with appropriate headers

### Cache Headers

Vite generates hashed filenames for cache busting:
```
index.abc123.js  → Cache forever (hash changes on update)
index.html       → No cache (entry point)
```

### Purging Cache

Usually not needed due to hashed filenames, but if needed:

1. Dashboard → Pages → Project → Deployments
2. Click on active deployment
3. Click **Purge cache**

## Build Optimization

### Bundle Analysis

Check bundle size:

```bash
npm run build -- --report
```

Opens a visual bundle analyzer.

### Current Bundle Size

| File | Size (gzipped) |
|------|----------------|
| `index.html` | ~1 KB |
| `main.*.js` | ~5 KB |
| `main.*.css` | ~3 KB |
| **Total** | **~10 KB** |

### Optimization Tips

1. **No runtime dependencies**: Already zero deps ✅
2. **Tree-shaking**: Vite handles automatically ✅
3. **Code splitting**: Not needed for this app size
4. **Image optimization**: Use WebP, lazy load large images

## Troubleshooting Deployments

### Build Failures

**Check build logs**:
1. Dashboard → Pages → Deployments
2. Click failed deployment
3. View build logs

**Common issues**:

| Error | Solution |
|-------|----------|
| `npm install` fails | Check `package-lock.json` is committed |
| TypeScript errors | Run `npm run typecheck` locally first |
| Missing env vars | Add to Cloudflare Pages settings |

### Preview URL Not Working

- Branch name must start with `feature-` or be `main`
- Check branch was pushed to origin
- Wait ~60 seconds for deployment
- Check Cloudflare Dashboard for errors

### Production Not Updating

1. Verify `release` branch was updated
2. Check deployment status in Cloudflare Dashboard
3. Try purging cache
4. Check for build errors in logs

## Security Considerations

### Headers

Cloudflare Pages adds security headers by default:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### Custom Headers

Add `_headers` file in `public/` for custom headers:

```
/*
  X-Custom-Header: value

/api/*
  Access-Control-Allow-Origin: *
```

### HTTPS

- All traffic is HTTPS by default
- HTTP automatically redirects to HTTPS
- HSTS enabled

---

**Next**: [Contributing Guide](contributing.md) →
