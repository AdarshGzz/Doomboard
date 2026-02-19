# Doomboard: Vercel Deployment Guide

Follow these steps to deploy your web app and scraper to Vercel.

## 1. Deploy the Web App (`doomboard-web`)

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import your repository and select the `doomboard-web` directory as the Root Directory.
4. Add the following **Environment Variables**:
   - `VITE_SUPABASE_URL`: (Your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
5. Click **Deploy**. (Your live URL is: `https://doomboard.vercel.app`)

## 2. Deploy the Scraper (`scraper-service`)

Since the scraper needs to stay active and run Puppeteer, it's better to host it on a persistent platform like **Railway** or **Render** instead of Vercel.

1. Go to [Railway](https://railway.app) or [Render](https://render.com).
2. Create a new service and import your repository.
3. Select the `scraper-service` directory.
4. Add the following **Environment Variables**:
   - `SUPABASE_URL`: (Your Supabase URL)
   - `SUPABASE_SERVICE_ROLE_KEY`: (Your Service Role Key)
   - `GEMINI_API_KEY`: (Your Gemini API Key)
5. Set the **Build Command** to: `npm run build`.
6. Set the **Start Command** to: `npm start`.
7. Click **Deploy**.

---

## 3. How it Works (No Webhooks Needed)

This scraper uses **Supabase Realtime**. 
- It automatically listens for new jobs in your database.
- It polls every 30 seconds as a backup.
- **You do NOT need to set up any Webhooks in Supabase.**

---

## 4. Post-Deployment: Syncing URLs

Once your web app is live (e.g., `https://doomboard-client.vercel.app`), you should update your local configuration so the extension and mobile app point to the live version.

### For the Chrome Extension (`doomboard-extension`)
1. Open `.env`.
2. Update `VITE_WEB_APP_URL` to your new Vercel URL.
3. Rebuild the extension (`npm run build`).

### For the Mobile App (`doomboard-mobile`)
1. Open `App.tsx`.
2. Update the `openWebApp` function with your new Vercel URL.
3. Rebuild your APK.

---

## Environment Variable Checklist

| Service | Key | Value |
| :--- | :--- | :--- |
| **Web App** | `VITE_SUPABASE_URL` | Your Project URL |
| **Web App** | `VITE_SUPABASE_ANON_KEY` | Your `anon` key |
| **Scraper** | `SUPABASE_URL` | Your Project URL |
| **Scraper** | `SUPABASE_SERVICE_ROLE_KEY` | Your `service_role` key (Required for updates) |
| **Scraper** | `GEMINI_API_KEY` | Your Gemini API Key (`gemini-2.0-flash`) |
