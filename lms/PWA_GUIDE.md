# LMS Arena – PWA Installation & Optimization Guide

## What Was Added

### New Files
| File | Purpose |
|------|---------|
| `manifest.json` | PWA app manifest (icons, display mode, theme) |
| `sw.js` | Service Worker (caching, offline support) |
| `pwa.css` | Mobile/tablet responsive styles + PWA enhancements |
| `pwa.js` | SW registration, install prompt, viewport fixes |
| `offline.html` | Offline fallback page |
| `assets/icons/icon-192.png` | PWA home screen icon 192×192 |
| `assets/icons/icon-512.png` | PWA splash/store icon 512×512 |
| `assets/icons/icon-512-maskable.png` | Adaptive/maskable icon for Android |
| `assets/icons/apple-touch-icon.png` | iOS home screen icon 180×180 |
| `assets/icons/favicon-32.png` | Browser tab favicon 32×32 |

### All HTML Files Updated
Every `.html` page now includes:
- Correct `viewport` with `viewport-fit=cover` (safe areas / notch support)
- `mobile-web-app-capable` and `apple-mobile-web-app-capable` meta tags
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `theme-color` meta tag
- Link to `manifest.json`
- Link to `pwa.css`
- `pwa.js` script before `</body>`

---

## Deployment Instructions

### Option A – Static Hosting (Recommended: Netlify / Vercel / GitHub Pages)

1. Upload the entire `frontend/` folder contents (including all new files).
2. **HTTPS is mandatory** – PWA features (Service Worker, install prompt) only work on HTTPS.
3. If using **Nginx**, add this to your server block:
   ```nginx
   # Service worker must be served from root scope
   location /sw.js {
     add_header Cache-Control "no-cache";
     add_header Service-Worker-Allowed "/";
   }
   location /manifest.json {
     add_header Cache-Control "no-cache";
   }
   ```

4. If using **Apache**, add to `.htaccess`:
   ```apache
   <Files "sw.js">
     Header set Cache-Control "no-cache"
     Header set Service-Worker-Allowed "/"
   </Files>
   <Files "manifest.json">
     Header set Cache-Control "no-cache"
   </Files>
   ```

### Option B – Node.js / Express Backend

Add to your Express app:
```js
// Serve PWA files with correct headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, '../frontend/sw.js'));
});
app.get('/manifest.json', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../frontend/manifest.json'));
});
```

---

## Installing the PWA on Android

1. Open the site in **Chrome** on Android.
2. A banner will appear at the bottom after ~3 seconds: **"Install LMS Arena"**.
3. Tap **Install** → the app is added to your home screen.
4. Opening from the home screen shows the app in **standalone mode** (no address bar).

### Manual install (if banner doesn't appear):
- Tap the **⋮ menu** in Chrome → **Add to Home Screen** → **Install**.

---

## Installing on iOS (Safari)

1. Open the site in **Safari** on iPhone/iPad.
2. Tap the **Share** button (square with arrow).
3. Scroll down → **Add to Home Screen** → **Add**.

> Note: iOS does not support the `beforeinstallprompt` event, so the install banner won't appear automatically. The app still works in standalone mode after manual add.

---

## Caching Strategy Summary

| Content Type | Strategy | Cache Name |
|---|---|---|
| CSS / JS / Icons | Cache-First | `lms-static-v1.0.0` |
| HTML Pages | Stale-While-Revalidate | `lms-pages-v1.0.0` |
| API calls (`gymgurus.in`) | Network-First | `lms-api-v1.0.0` |
| Google Fonts / Bootstrap CDN | Cache-First | `lms-fonts-v1.0.0` |
| Unknown / fallback | Network-First | `lms-static-v1.0.0` |

---

## Updating the App (Cache Busting)

When you deploy a new version:

1. In `sw.js`, increment the version number:
   ```js
   const CACHE_VERSION = 'v1.0.1'; // bump this
   ```
2. Old caches are automatically deleted on activation.
3. Users will see a **"Update available – tap to refresh"** toast.

---

## Lighthouse PWA Checklist

Run Lighthouse in Chrome DevTools → **PWA** tab. Expected score: **90+**

### ✅ Already implemented:
- [x] Manifest with `name`, `short_name`, `icons`, `start_url`, `display: standalone`
- [x] Service Worker registered
- [x] Offline fallback page (`offline.html`)
- [x] `theme-color` meta tag
- [x] Responsive `viewport` meta
- [x] HTTPS (required for hosting)
- [x] Icons 192×192 and 512×512 (both `any` and `maskable`)
- [x] `apple-touch-icon` for iOS
- [x] Touch targets ≥ 44×44px
- [x] No horizontal scroll / overflow

### 🔧 Additional improvements (manual):
- [ ] **Splash screen**: Android auto-generates from `background_color` + icon. No extra config needed.
- [ ] **Custom icons**: Replace `assets/icons/*.png` with your actual branded icons.
- [ ] **ARIA labels**: Audit forms and interactive elements for accessibility.
- [ ] **Font preconnect**: Add to `<head>` for faster Google Fonts:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ```
- [ ] **Critical CSS**: Inline above-the-fold styles for faster FCP.
- [ ] **Bootstrap CDN integrity**: Already uses SRI hashes via jsDelivr.
- [ ] **Image optimization**: Convert PNGs/JPGs to WebP where possible.

---

## Performance Tips

1. **Preload key scripts** – Add to `<head>` of dashboard pages:
   ```html
   <link rel="preload" href="/assets/js/student.js" as="script">
   ```

2. **Defer non-critical JS** – Scripts at end of `<body>` already load last; add `defer` to any in `<head>`.

3. **Compress assets** – Enable gzip/brotli on your web server for 60-80% size reduction.

4. **Service Worker pre-caching** – The SW pre-caches all HTML + CSS + JS on first install, making repeat visits near-instant.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Install banner not showing | Must be on HTTPS, not localhost (or use `chrome://flags/#unsafely-treat-insecure-origin-as-secure`) |
| Service worker not registering | Check browser console for errors; ensure `sw.js` is at site root `/` |
| App not standalone (address bar visible) | Verify `manifest.json` has `"display": "standalone"` and was linked before install |
| Icons not showing | Check `assets/icons/` paths; icons must be accessible via HTTP |
| iOS status bar overlapping | `viewport-fit=cover` + `env(safe-area-inset-top)` in `pwa.css` handles this |
| Cache stale after deploy | Bump `CACHE_VERSION` in `sw.js` |
