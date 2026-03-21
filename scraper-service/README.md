# Scraper Service

This service handles job page scraping using Puppeteer and refines the data using Gemini AI before saving it to Supabase.

## Setup

1.  **Environment Variables**:
    Update the `.env` file in this directory with your actual keys:
    *   `GEMINI_API_KEY`: Your Google AI API key.
    *   `SUPABASE_URL`: Your Supabase project URL.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase **Service Role** key (found in Project Settings > API).

2.  **Run the Server**:
    ```bash
    cd scraper-service
    node index.js
    ```
    The server will run on `http://localhost:3001`.

## How it works
1.  **Extension** sends a URL to `POST /process-job`.
2.  **Puppeteer** launches a headless browser, navigates to the URL, and extracts all page text.
3.  **Gemini** processes the text to extract structured job details (Title, Company, Description, etc.).
4.  **Supabase** saves the structured data directly into the `jobs` table.
