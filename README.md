# Doomboard

![Doomboard Banner](doomboard_banner.png)

Doomboard is a comprehensive, multi-platform ecosystem designed to track, scrape, and visualize data across web, mobile, and browser environments. Powered by Supabase, React, Expo, and Gemini AI, it offers a seamless experience for managing and analyzing information in real-time.

---

## 🚀 Project Overview

Doomboard is a monorepo consisting of several integrated components:

*   **Doomboard Web**: A modern React-based dashboard for data visualization and management.
*   **Doomboard Mobile**: An Expo-based mobile application for on-the-go access.
*   **Doomboard Extension**: A Chrome extension for seamless browser integration and data capture.
*   **Scraper Service**: A Node.js backend using Puppeteer and Gemini AI to intelligently scrape and process information.
*   **Supabase**: The unified backend providing real-time database capabilities, authentication, and storage.

---

## ✨ Features

- **Real-time Synchronization**: Seamless data flow between web, mobile, and extension via Supabase Realtime.
- **AI-Powered Scraping**: Intelligent data extraction using Gemini 2.0 Flash and Puppeteer.
- **Cross-Platform Access**: Consistent experience across desktop (Web/Extension) and mobile (Android/iOS).
- **Drag-and-Drop Interface**: Highly interactive web dashboard built with `@dnd-kit`.
- **Automated Workflows**: Automatic job processing and polling backup system.

---

## 🛠 Tech Stack

### Frontend & Mobile
- **Web**: React 19, Vite, Tailwind CSS, Lucide React, React Router.
- **Mobile**: React Native, Expo 54, Lucide React Native, Expo Share Intent.
- **Extension**: React, Vite, Chrome Extension APIs.

### Backend & AI
- **Backend-as-a-Service**: Supabase (Database, Auth, Realtime).
- **Scraper Service**: Express, Puppeteer, Gemini AI (`gemini-2.0-flash`).
- **Data Management**: Lodash, Date-fns.

---

## 📁 Project Structure

```text
Doomboard/
├── doomboard-web/        # React Web Application
├── doomboard-mobile/     # Expo Mobile Application
├── doomboard-extension/  # Chrome Browser Extension
├── scraper-service/      # Puppeteer & AI Scraper Backend
├── supabase/             # Supabase Schema & Configurations
└── deployment_guide.md   # Detailed Deployment Instructions
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- npm or bun
- A Supabase Project
- Gemini API Key (for the scraper)

### 2. Component Setup

#### Web App
```bash
cd doomboard-web
npm install
npm run dev
```

#### Mobile App
```bash
cd doomboard-mobile
npm install
npx expo start
```

#### Chrome Extension
```bash
cd doomboard-extension
npm install
npm run build
```
*Load the `dist` folder into Chrome via `chrome://extensions/`.*

#### Scraper Service
```bash
cd scraper-service
npm install
npm start
```

---

## 🌐 Deployment

For detailed deployment instructions for Vercel, Railway, and Supabase, please refer to the [Deployment Guide](./deployment_guide.md).

---

## 🛡 License

This project is licensed under the ISC License.

---

Developed with ❤️ by [AdarshGzz](https://github.com/AdarshGzz)
