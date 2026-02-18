# Doomboard: Vercel Deployment Guide

Follow these steps to deploy your web app and scraper to Vercel.

## 1. Deploy the Web App (`doomboard-web`)

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import your repository and select the `doomboard-web` directory as the Root Directory.
4. Add the following **Environment Variables**:
   - `VITE_SUPABASE_URL`: (Your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
5. Click **Deploy**.

## 2. Deploy the Scraper (`scraper-service`)

1. Click **Add New** > **Project** again.
2. Import the same repository but select `scraper-service` as the Root Directory.
3. Add the following **Environment Variables**:
   - `SUPABASE_URL`: (Your Supabase URL)
   - `SUPABASE_SERVICE_ROLE_KEY`: (Your Service Role Key - **IMPORTANT**: NOT the anon key)
   - `GEMINI_API_KEY`: (Your Gemini API Key)
4. Click **Deploy**.
5. Once deployed, copy your **Production URL** (e.g., `https://scraper-service.vercel.app`).

## 3. Set up Supabase Webhook

To make the scraper run automatically when a new job is added:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Database** > **Webhooks**.
3. Click **Create a new Hook**.
4. **Name**: `TriggerScraper`
5. **Table**: `jobs`
6. **Events**: `INSERT`
7. **Filter**: `status = 'collected'`
8. **Method**: `POST`
9. **URL**: `https://YOUR-SCRAPER-URL.vercel.app/api/scrape`
10. Click **Create Webhook**.

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
