# CampusNest — Netlify Production Deployment Guide

This repository is **100% production-ready** for deployment on [Netlify](https://www.netlify.com/).

---

## 🚀 Pre-Configured Netlify Features

| Feature | File | Purpose |
| :--- | :--- | :--- |
| **Build Settings** | `netlify.toml` | Automatically sets build command (`npm run build`), publish directory (`dist`), and Node 20 runtime. |
| **SPA Route Handling** | `public/_redirects` & `netlify.toml` | Ensures deep links (`/explore`, `/stay/:id`, etc.) and page refreshes return HTTP 200 without 404 errors. |
| **Security Headers** | `netlify.toml` | Adds `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`. |
| **Asset Caching** | `netlify.toml` | Configures immutable 1-year caching for Vite-hashed production bundles in `/assets/*`. |
| **Search Engine SEO** | `public/robots.txt` & `public/sitemap.xml` | Optimizes search indexing across all 34 Kolhapur colleges & categories. |
| **Optimized Chunks** | `vite.config.ts` | Code-split into vendor chunks (`vendor-react`, `vendor-firebase`, `vendor-icons`, `vendor-search`). |

---

## 📦 Deployment Option 1: Netlify Drop (Instant Drag & Drop, No Git Required)

The production bundle is already generated in the `dist` folder:

1. Open **[https://app.netlify.com/drop](https://app.netlify.com/drop)** in your browser.
2. Sign in or create a free Netlify account.
3. Drag the folder `C:\CampusNest\dist` and drop it onto the upload area.
4. Your website is deployed and live within 10 seconds on a free `*.netlify.app` URL!

---

## 🔄 Deployment Option 2: Continuous Deployment via GitHub (Recommended)

To automatically deploy whenever you push code changes:

### Step 1: Push your project to GitHub
```bash
git add .
git commit -m "feat: configure production deployment for Netlify"
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/campusnest-kolhapur.git
git branch -M main
git push -u origin main
```

### Step 2: Import into Netlify
1. Log in to [app.netlify.com](https://app.netlify.com).
2. Click **Add new site** > **Import an existing project**.
3. Choose **GitHub** and authorize access.
4. Select your **campusnest-kolhapur** repository.
5. Netlify will auto-detect settings from `netlify.toml`:
   - **Base directory:** *(leave blank)*
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy CampusNest**.

---

## ⚡ Deployment Option 3: Terminal Deploy (Netlify CLI)

If you prefer deploying directly from your command line:

```bash
# 1. Run local build
cmd.exe /c build.bat

# 2. Deploy to production using Netlify CLI
npx netlify-cli deploy --prod --dir=dist
```

---

## 🔑 Environment Variables Configuration

If you are using custom Google Maps or Firebase Authentication in production, configure them in Netlify:

1. Go to your site dashboard on Netlify: **Site configuration** > **Environment variables** > **Add a variable**.
2. Add your keys as needed:

| Variable Name | Description | Default / Fallback |
| :--- | :--- | :--- |
| `VITE_ENABLE_DEMO_LOGIN` | Allows one-click testing of Student, Owner, and Admin dashboards | `true` or `false` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key | Graceful fallback cards if unset |
| `VITE_FIREBASE_API_KEY` | Firebase API Key | In-memory demo auth if unset |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `campusnest-kolhapur.firebaseapp.com` | — |
| `VITE_FIREBASE_PROJECT_ID` | e.g. `campusnest-kolhapur` | — |
| `VITE_FIREBASE_STORAGE_BUCKET` | e.g. `campusnest-kolhapur.firebasestorage.app`| — |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | — |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | — |

---

## 🛡️ Important Step for Google Sign-In: Firebase Authorized Domains

When deploying to Netlify, Google Auth requires your Netlify domain to be authorized:

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project > **Authentication** > **Settings** tab.
3. Under **Authorized domains**, click **Add domain**.
4. Enter your Netlify domain (e.g., `campusnest-kolhapur.netlify.app`).
5. Click **Save**. Google Sign-In popups will now authenticate smoothly on your live domain!

---

## 🧪 Local Verification Command

To test the exact production bundle locally before deploying:
```bash
# Compile latest production assets
cmd.exe /c build.bat

# Preview the dist folder locally at http://localhost:4173/
cmd.exe /c preview.bat
```
