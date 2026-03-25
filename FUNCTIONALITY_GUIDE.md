# Doomboard: Full Functionality Guide

Doomboard is a unified ecosystem designed to automate and streamline the job search process. This guide outlines every feature and functionality available across our platform.

---

## 🛠 1. Chrome Extension (The Smart Collector)
**The front-line tool for capturing job leads directly from the web.**

*   **Intelligent Auto-Detection**: Uses advanced page analysis to automatically detect if you are viewing a job posting on any website.
*   **Multi-Strategy Extraction**: 
    *   **JSON-LD Parsing**: Extracts high-fidelity structured data from Schema.org scripts.
    *   **Meta Tag Analysis**: Scrapes metadata from OpenGraph and standard SEO tags.
    *   **Site-Specific Selectors**: Optimized scrapers for LinkedIn, Indeed, Greenhouse, Lever, and Workday.
*   **One-Click "Push to Board"**: A single button to capture the title, company, URL, and full description.
*   **Real-Time Status Sync**: Shows current collection progress (Collected → Processing → Success/Error) directly in the popup.
*   **Session Management**: Keeps you logged in across browser sessions.

---

## 📱 2. Mobile App (On-the-Go Collection)
**Never miss a lead while browsing on your phone.**

*   **Native Share Intent Integration**: Share any link from Chrome, Safari, or the LinkedIn app directly to Doomboard via the system share sheet.
*   **Secure OTP Authentication**: Secure, passwordless entry using 6-digit access codes delivered to your inbox.
*   **Instant Result Feedback**: Visual cards confirm if a job was successfully saved, if it's a duplicate, or if there was an error.
*   **Persistent Session**: Stay signed in securely with `AsyncStorage` integration.
*   **Dynamic Landing Pages**: Quick access to your main dashboard from the mobile interface.

---

## 🧠 3. Scraper Service (The AI Brain)
**A high-performance Node.js backend that transforms raw data into actionable insights.**

*   **Puppeteer-Powered Scraping**: Headless browser automation to fetch full page content, even from complex SPAs.
*   **Gemini 2.0 AI Refinement**: Intelligent data cleaning using the latest AI models to remove navigation fluff and extract core job requirements.
*   **Automated Skill Extraction**: AI identifying technical and soft skills (React, Python, AWS, Leadership, etc.) and tagging them automatically.
*   **Metadata Synthesis**: Reliable extraction of salary ranges, work types (Remote/Hybrid/On-site), and location data.
*   **Hybrid Sync System**: 
    *   **Postgres Realtime**: Processes new jobs the millisecond they are added.
    *   **Polling Fallback**: A 30-second automated scan ensures no lead is ever missed.
*   **SMTP Mailer Engine**: High-performance nodemailer setup for reliable delivery of authentication codes.

---

## 🖥 4. Web Dashboard (High-Performance Management)
**The ultimate control center for your job search strategy.**

*   **Vision-Focused Kanban Board**: A drag-and-drop interface powered by `@dnd-kit` to move leads through "Waitlist", "Applied", "Interview", and "Offer".
*   **Premium Glassmorphism UI**: A high-end, distraction-free design with vibrant glows and blur effects.
*   **Interactive Modal System**: Detailed view for every job lead with AI-parsed summaries.
*   **Live Strategy Notes**: An auto-saving (debounced) markdown-ready area to strategize and track your progress for each application.
*   **Smart Filtering & Sorting**: Group jobs by status or view your entire collection history.
*   **Lead Cleanup Hub**: A soft-delete system (Trash) to discard irrelevant leads while keeping the option to restore them.
*   **Full Responsiveness**: Optimized for everything from ultrawide monitors to tablet screens.

---

## 🔐 5. Platform Infrastructure (Unified Backend)
**The bedrock that keeps your data in sync.**

*   **Supabase Realtime**: Ensures that a job pushed from your phone or extension appears on your laptop instantly.
*   **Unified Auth**: A single identity used across Web, Mobile, and Extension.
*   **Secure Data Storage**: Industry-standard encryption for your notes and application data.
*   **Cross-Platform ID Sync**: Shared IDs across all devices for consistent tracking.
