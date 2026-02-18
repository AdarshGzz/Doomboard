require('dotenv').config();
const puppeteer = require('puppeteer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
];

let globalBrowser = null;

async function getBrowser() {
    if (!globalBrowser || !globalBrowser.isConnected()) {
        globalBrowser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return globalBrowser;
}

/**
 * Improved Core Scraping Logic
 */
async function scrapeUrlWithRetry(url, retries = 2) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        let page;
        try {
            console.log(`[Attempt ${i + 1}] Scraping: ${url}`);
            const browser = await getBrowser();
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
            if (page) await page.close().catch(() => { });
            await new Promise(resolve => setTimeout(resolve, 3000));
        } finally {
            if (page) await page.close().catch(() => { });
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

        console.log('Step 1: Scraping...');
        const scraped = await scrapeUrlWithRetry(job.normalized_url);

        console.log('Step 2: AI Refining (Skills Extraction)...');
        const refined = await refineWithAI(scraped, job.normalized_url);

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

    } catch (err) {
        console.error(`❌ [${job.id}] Failed:`, err.message);
        await supabase.from('jobs').update({
            status: 'error',
            description: `Background worker error: ${err.message}`
        }).eq('id', job.id);
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
        }
    }
}

async function startWorker() {
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
