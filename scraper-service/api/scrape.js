const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
];

async function scrapeUrl(url) {
    let browser = null;
    try {
        console.log(`Scraping: ${url}`);
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'font', 'media', 'stylesheet'].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent(USER_AGENTS[0]);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for potential dynamic content
        await new Promise(r => setTimeout(r, 3000));

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

        return data;
    } finally {
        if (browser) await browser.close();
    }
}

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
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Supabase Webhook payload structure: { record: { ... }, old_record: { ... }, type: 'INSERT', ... }
    const { record } = req.body;

    if (!record || !record.id || !record.normalized_url) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    const { id, normalized_url } = record;

    console.log(`Starting background scrape for Job ID: ${id}`);

    try {
        // 1. Lock record to processing
        await supabase.from('jobs').update({ status: 'processing' }).eq('id', id);

        // 2. Scrape
        const scraped = await scrapeUrl(normalized_url);

        // 3. AI Refine
        const refined = await refineWithAI(scraped, normalized_url);

        // 4. Update Final
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
        }).eq('id', id);

        if (error) throw error;

        return res.status(200).json({ success: true, jobId: id });
    } catch (err) {
        console.error(`Error processing job ${id}:`, err);
        await supabase.from('jobs').update({
            status: 'error',
            description: `Vercel Scraper Error: ${err.message}`
        }).eq('id', id);
        return res.status(500).json({ error: err.message });
    }
};
