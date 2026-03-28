require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { Cluster } = require('puppeteer-cluster');
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

// --- SCALING CORE ---
// 1. Redis Connection (The "engine" for our queue)
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

// Handle Redis connection errors to prevent process crash
connection.on('error', (err) => {
    console.error('[Redis Error]', err.message);
});

// 2. The Queue (The "waiting room" for jobs)
const scrapeQueue = new Queue('scrape-jobs', { connection });

// 3. The Browser Pool (The "worker team")
let cluster;
let scrapeWorker;

// Initialize Resend (HTTP API instead of SMTP to bypass Render block)
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase (with Service Role Key for Admin actions)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Scaling Concept: The Cluster Pool
 * Instead of "launching a fresh browser" for every job (Slow + High RAM), 
 * we use a pool of browsers that stay open and wait for tasks.
 */
async function initCluster() {
    cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE, // Use one browser with multiple tabs
        maxConcurrency: 3, // Only 3 jobs at a time (Perfect for Render's 512MB RAM)
        puppeteerOptions: {
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: "new"
        }
    });

    console.log('✅ Puppeteer Cluster Initialized (Max 3 parallel jobs)');

    // Handle cluster errors
    cluster.on('taskerror', (err, data) => {
        console.error(`[Cluster Error] ${data}: ${err.message}`);
    });
}

/**
 * Scaling Concept: The Worker (Consumer)
 * This is the "brain" that pulls jobs from the queue and gives them to the cluster.
 */
function initWorker() {
    scrapeWorker = new Worker('scrape-jobs', async (job) => {
        const { jobId } = job.data;
        console.log(`[Queue] Processing job: ${jobId}`);
        
        // Fetch the latest job data from Supabase
        const { data: jobData, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error || !jobData) {
            console.error(`[Queue] Job ${jobId} not found or error:`, error?.message);
            return;
        }

        // Use the cluster to execute the scrape
        await cluster.execute(jobData.normalized_url, async ({ page, data: url }) => {
            await handleJobWithPage(page, jobData);
        });
    }, { connection, concurrency: 3 });

    scrapeWorker.on('completed', (job) => {
        console.log(`[Queue] Job ${job.id} (JobId: ${job.data.jobId}) completed successfully`);
    });

    scrapeWorker.on('failed', (job, err) => {
        console.error(`[Queue] Job ${job?.id} failed: ${err.message}`);
    });
}

/**
 * Optimized Scraping Logic using a pre-allocated page
 */
async function handleJobWithPage(page, job) {
    try {
        // 1. Atomic Lock: Ensure only one worker processes this job
        const { data: lockedJob, error: lockError } = await supabase
            .from('jobs')
            .update({ status: 'processing' })
            .eq('id', job.id)
            .eq('status', 'collected') // Only claim if it's still 'collected'
            .select()
            .single();

        if (lockError || !lockedJob) {
            console.log(`[${job.id}] Job already claimed by another worker or not found.`);
            return;
        }

        // 2. Cluster Safety Guard
        if (!cluster) {
            throw new Error('Puppeteer Cluster not initialized');
        }

        // 3. Scrape
        await page.setRequestInterception(true);
        const onReq = (req) => {
            if (['image', 'font', 'media'].includes(req.resourceType())) req.abort();
            else req.continue();
        };
        page.on('request', onReq);

        await page.goto(job.normalized_url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        const scraped = await page.evaluate(() => {
            const texts = [];
            document.querySelectorAll('script, style, nav, footer').forEach(el => el.remove());
            const walk = (el) => {
                if (el.nodeType === Node.TEXT_NODE) {
                    const val = el.textContent.trim();
                    if (val.length > 5) texts.push(val);
                } else el.childNodes.forEach(walk);
            };
            walk(document.body);
            return { title: document.title, content: texts.join(' ') };
        });

        page.off('request', onReq); // Cleanup listener for this page

        // 3. AI Refine
        const refined = await refineWithAI(scraped, job.normalized_url);

        // 4. Update Supabase
        await supabase.from('jobs').update({
            title: refined.title,
            company: refined.company,
            description: refined.description,
            skills: refined.skills || [],
            location: refined.location,
            salary: refined.salary,
            status: 'finalized'
        }).eq('id', job.id);

        console.log(`✅ [${job.id}] Finalized: ${refined.title}`);

    } catch (err) {
        console.error(`❌ [${job.id}] Failed:`, err.message);
        await supabase.from('jobs').update({ status: 'error', description: err.message }).eq('id', job.id);
    }
}

/**
 * Self-Healing: Cleanup jobs that got stuck in 'processing'
 */
async function handleStaleJobs() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    // Scaling Fix: Use 'created_at' (updated_at missing from schema)
    const { data: staleJobs, error } = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'processing')
        .lt('created_at', tenMinutesAgo);

    if (error) {
        console.error('[Stale] Database error:', error.message);
        return;
    }

    if (!staleJobs || staleJobs.length === 0) return;

    console.log(`[Stale] Resetting ${staleJobs.length} jobs that timed out...`);
    for (const job of staleJobs) {
        await supabase.from('jobs')
            .update({ status: 'error', description: 'Worker Timeout' })
            .eq('id', job.id);
    }
}

/**
 * AI Logic via OpenRouter
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
Text: ${scrapedData.content.slice(0, 15000)}
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://doomboard.vercel.app", // Optional, for OpenRouter rankings
            "X-Title": "Doomboard Scraper" // Optional, for OpenRouter rankings
        },
        body: JSON.stringify({
            "model": "arcee-ai/trinity-large-preview:free",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "reasoning": { "enabled": true }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const aiMessage = result.choices[0].message.content;
    const jsonStr = aiMessage.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
}

/**
 * Main Job Processor
 */
/**
 * Scaling Concept: The Producer
 * Instead of doing work, this function just adds the task to the queue "waiting room".
 */
async function scanForPendingJobs() {
    const { data: pendingJobs, error } = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'collected')
        .eq('is_deleted', false);

    if (error) {
        console.error('[Producer] Database error:', error.message);
        return;
    }

    if (pendingJobs && pendingJobs.length > 0) {
        console.log(`[Producer] Found ${pendingJobs.length} jobs. Adding to queue...`);
        for (const job of pendingJobs) {
            await scrapeQueue.add('scrape', { jobId: job.id }, { 
                jobId: job.id, // Prevent duplicate jobs in queue
                removeOnComplete: true,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                }
            });
        }
    }
    
    await handleStaleJobs();
}

async function startWorker() {
    // Basic Health Check Server
    const app = express();
    const port = process.env.PORT || 3001;

    // Enhanced CORS to handle browser requests from Vercel
    app.use(cors({
        origin: '*', // Allow all for now, or use ['https://doomboard.vercel.app']
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json());

    // --- AUTH OTP ENDPOINTS ---

    // 1. Send OTP
    app.post('/api/auth/send-otp', async (req, res) => {
        console.log(`[AUTH] Received Send-OTP request for: ${req.body?.email}`);
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        try {
            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            // Save to DB (hashed for security)
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            const { error: dbError } = await supabase
                .from('auth_otps')
                .insert([{ email, otp_hash: otpHash, expires_at: expiresAt.toISOString() }]);

            if (dbError) throw dbError;

            // Send Email via Resend HTTP API
            const { error: mailError } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: email,
                subject: 'Your Doomboard Access Code',
                html: `
                    <div style="font-family: sans-serif; padding: 40px; background: #000; color: #fff; border-radius: 20px;">
                        <h1 style="color: #fff; margin-bottom: 20px;">Verification Code</h1>
                        <p style="color: #666; font-size: 16px;">Use the code below to sign in to your Doomboard account.</p>
                        <div style="background: #111; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 10px; border-radius: 10px; text-align: center; margin: 30px 0; border: 1px solid #333;">
                            ${otp}
                        </div>
                        <p style="color: #444; font-size: 12px;">This code will expire in 5 minutes.</p>
                    </div>
                `,
            });

            if (mailError) throw mailError;
            console.log(`[OTP] Sent to ${email}`);

            res.json({ message: 'OTP sent successfully' });
        } catch (err) {
            console.error('[OTP Error]', err);
            // Provide more specific error message to help debugging
            const errorMessage = err.message || 'Unknown error';
            if (errorMessage.includes('auth_otps')) {
                res.status(500).json({ error: `Database Error: Table 'auth_otps' might be missing. ${errorMessage}` });
            } else if (errorMessage.includes('SMTP') || errorMessage.includes('mail')) {
                res.status(500).json({ error: `SMTP Error: Failed to send email. ${errorMessage}` });
            } else {
                res.status(500).json({ error: `Auth Error: ${errorMessage}` });
            }
        }
    });

    // 2. Verify OTP
    app.post('/api/auth/verify-otp', async (req, res) => {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

        try {
            const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

            // Find valid OTP
            const { data, error: dbError } = await supabase
                .from('auth_otps')
                .select('*')
                .eq('email', email)
                .eq('otp_hash', otpHash)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (dbError || !data) {
                return res.status(401).json({ error: 'Invalid or expired OTP' });
            }

            // Cleanup OTP after use
            await supabase.from('auth_otps').delete().eq('id', data.id);

            // GENERATE SUPABASE SESSION
            const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
                type: 'magiclink',
                email: email,
            });

            if (authError) throw authError;

            // Return tokens directly if they are available in authData.properties
            // Most Supabase versions return hashed_token, etc.
            res.json({
                message: 'OTP verified',
                session_url: authData.properties.action_link,
                tokens: {
                    access_token: authData.properties.hashed_token, // Note: might need confirm endpoint fetch if hashed
                    email: email
                }
            });

        } catch (err) {
            console.error('[Verify Error]', err);
            res.status(500).json({ error: 'Authentication failed' });
        }
    });

    app.get('/', (req, res) => res.send('DOOMBOARD Scraper Active'));
    app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
    app.listen(port, () => console.log(`Health check server on port ${port}`));

    console.log('--- DOOMBOARD Scraper Worker Starting ---');
    console.log(`Monitoring Supabase: ${process.env.SUPABASE_URL}`);
    console.log('Mode: Hybrid (Realtime + 60s Polling Fallback)');

    // Boot everything
    await initCluster();
    initWorker();
    await scanForPendingJobs();

    const channel = supabase.channel('db-changes');
    channel
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'jobs' },
            async (payload) => {
                if (payload.new && payload.new.status === 'collected') {
                    console.log(`[Producer] Realtime trigger for job: ${payload.new.id}`);
                    await scrapeQueue.add('scrape', { jobId: payload.new.id }, {
                        jobId: payload.new.id,
                        removeOnComplete: true,
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 1000,
                        }
                    });
                }
            }
        )
        .subscribe();

    setInterval(async () => {
        await scanForPendingJobs();
    }, 60000); // Poll once a minute as a safety net
}

startWorker().catch(err => {
    console.error('CRITICAL BOOT ERROR:', err.message);
    process.exit(1);
});

process.on('SIGINT', async () => {
    console.log('\nWorker shutting down gracefully...');
    try {
        if (scrapeWorker) await scrapeWorker.close();
        if (cluster) await cluster.close();
        console.log('✅ Shutdown complete.');
    } catch (err) {
        console.error('❌ Error during shutdown:', err.message);
    } finally {
        process.exit(0);
    }
});
