require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// Initialize Gemini
// Initialize Gemini - Using 2.0 Flash Lite per user request
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
];

// Launch a fresh browser for each task to prevent memory leaks and zombie hangs
async function launchFreshBrowser() {
    return await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
}

/**
 * Improved Core Scraping Logic
 */
async function scrapeUrlWithRetry(url, retries = 2) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        let page;
        let browser;
        try {
            console.log(`[Attempt ${i + 1}] Scraping: ${url}`);
            browser = await launchFreshBrowser();
            page = await browser.newPage();

            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                if (['image', 'font', 'media', 'stylesheet'].includes(type)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.setUserAgent(USER_AGENTS[i % USER_AGENTS.length]);

            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            await new Promise(r => setTimeout(r, 5000));

            const data = await page.evaluate(() => {
                const texts = [];
                const walk = (el) => {
                    if (!el) return;
                    if (['SCRIPT', 'STYLE', 'IFRAME', 'NOSCRIPT', 'SVG', 'NAV', 'FOOTER'].includes(el.tagName)) return;
                    if (el.nodeType === Node.TEXT_NODE) {
                        const val = el.textContent.trim();
                        if (val && val.length > 5) texts.push(val);
                    } else {
                        el.childNodes.forEach(walk);
                    }
                };
                walk(document.body);
                return {
                    title: document.title,
                    content: texts.join(' ')
                };
            });

            if (!data.content || data.content.length < 500) {
                throw new Error("Page content too short or empty.");
            }

            return data;
        } catch (err) {
            console.warn(`[Attempt ${i + 1}] Failed: ${err.message}`);
            lastError = err;
        } finally {
            if (page) await page.close().catch(() => { });
            if (browser) await browser.close().catch(() => { });
            if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    throw lastError;
}

/**
 * AI Logic
 */
async function refineWithAI(scrapedData, url) {
    const prompt = `
Extract job details from this text. Return ONLY JSON.
Fields: 
- title
- company
- location
- salary
- description (the full original text, cleaned of navigation artifacts)
- skills (an array of strings representing technical and soft skills required)
- workType
- postedAt

URL: ${url}
Text: ${scrapedData.content.slice(0, 30000)}
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
}

/**
 * Main Job Processor
 */
async function handleJobRecord(job) {
    if (['processing', 'finalized', 'error'].includes(job.status)) return;

    console.log(`\n--- [${new Date().toISOString()}] New Job Detected: ${job.id} ---`);
    console.log(`URL: ${job.normalized_url}`);

    try {
        const { data: lockData, error: lockError } = await supabase
            .from('jobs')
            .update({ status: 'processing' })
            .eq('id', job.id)
            .eq('status', 'collected')
            .select();

        if (lockError) throw lockError;
        if (!lockData || lockData.length === 0) return;

        // 2-minute safety timeout for the entire processing block
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Job processing timed out (2m)')), 120000)
        );

        await Promise.race([
            (async () => {
                console.log('Step 1: Scraping...');
                const scraped = await scrapeUrlWithRetry(job.normalized_url);

                console.log('Step 2: AI Refining (Skills Extraction)...');
                console.log(`Sending ${scraped.content.length} characters to AI...`);
                const refined = await refineWithAI(scraped, job.normalized_url);
                console.log('AI Response Received:', JSON.stringify(refined).slice(0, 100) + '...');

                console.log('Step 3: Updating Record...');
                const { error } = await supabase.from('jobs').update({
                    title: refined.title,
                    company: refined.company,
                    description: refined.description,
                    skills: refined.skills || [],
                    location: refined.location,
                    salary: refined.salary,
                    work_type: refined.workType,
                    posted_at: refined.postedAt,
                    status: 'finalized'
                }).eq('id', job.id);

                if (error) throw error;
                console.log(`✅ [${job.id}] Success: ${refined.title} at ${refined.company}`);
            })(),
            timeoutPromise
        ]);

    } catch (err) {
        console.error(`❌ [${job.id}] Failed:`, err.message);
        // Explicitly update to error state on failure
        const { error: updateError } = await supabase.from('jobs').update({
            status: 'error',
            description: `Scraper Error: ${err.message}`
        }).eq('id', job.id);

        if (updateError) console.error('Failed to update error status:', updateError.message);
    }
}

async function handleStaleJobs() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Find jobs stuck in 'processing' for too long
    // Note: We'd need an 'updated_at' column to do this perfectly, 
    // but we can fallback to 'created_at' if we just started.
    // Let's assume there's no updated_at yet, so we just check for processing jobs.
    // For now, let's just log them and maybe reset them.
    const { data: staleJobs, error } = await supabase
        .from('jobs')
        .select('id, title, status, created_at')
        .eq('status', 'processing')
        .lt('created_at', fiveMinutesAgo);

    if (error) return;

    if (staleJobs && staleJobs.length > 0) {
        console.log(`[Stale] Found ${staleJobs.length} stale jobs. Resetting...`);
        for (const job of staleJobs) {
            await supabase.from('jobs')
                .update({ status: 'error', description: 'Scraper timeout/hang detected.' })
                .eq('id', job.id);
        }
    }
}

async function scanForPendingJobs() {
    const { data: pendingJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'collected')
        .eq('is_deleted', false);

    if (error) {
        console.error('Scan Error:', error.message);
        return;
    }

    if (pendingJobs && pendingJobs.length > 0) {
        console.log(`[Scan] Found ${pendingJobs.length} pending jobs.`);
        for (const job of pendingJobs) {
            await handleJobRecord(job);
            // Add a small 10s delay between jobs to respect API quotas
            await new Promise(r => setTimeout(r, 10000));
        }
    }

    // Also check for stale ones periodically
    await handleStaleJobs();
}

async function startWorker() {
    // Basic Health Check Server
    const app = express();
    const port = process.env.PORT || 3001;
    app.get('/', (req, res) => res.send('DOOMBOARD Scraper Active'));
    app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
    app.listen(port, () => console.log(`Health check server on port ${port}`));

    console.log('--- DOOMBOARD Scraper Worker Starting ---');
    console.log(`Monitoring Supabase: ${process.env.SUPABASE_URL}`);
    console.log('Mode: Hybrid (Realtime + 30s Polling Fallback)');

    await scanForPendingJobs();

    const channel = supabase.channel('db-changes');

    channel
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'jobs' },
            (payload) => {
                if (payload.new && payload.new.status === 'collected') {
                    console.log(`[Realtime] Triggered for job: ${payload.new.id}`);
                    handleJobRecord(payload.new);
                }
            }
        )
        .subscribe((status) => {
            console.log(`Realtime Status: ${status}`);
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.warn('Realtime connection unstable. Relying on Polling fallback...');
            }
        });

    setInterval(async () => {
        await scanForPendingJobs();
    }, 30000);
}

startWorker().catch(err => {
    console.error('CRITICAL WORKER ERROR:', err.message);
    process.exit(1);
});

process.on('SIGINT', async () => {
    console.log('\nWorker shutting down...');
    if (globalBrowser) await globalBrowser.close();
    process.exit();
});
