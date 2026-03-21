import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const bodyContent = await req.text();
        let body;
        try {
            body = JSON.parse(bodyContent);
        } catch (e) {
            throw new Error("Invalid JSON body in request");
        }

        const { url, html_content, manual_text } = body;
        console.log("Processing request for URL:", url);

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        console.log("Env check:", {
            hasGemini: !!GEMINI_API_KEY,
            hasUrl: !!SUPABASE_URL,
            hasKey: !!SUPABASE_SERVICE_ROLE_KEY
        });

        if (!GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY secret in Supabase Dashboard.");
        }
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing internal Supabase configuration (URL or Service Key)");
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 1. Prepare Text for AI
        let textToAnalyze = manual_text || "";

        // If no text provided, we might try to fetch (though extension usually provides it)
        if (!textToAnalyze && html_content) {
            // Simple HTML stripping if raw HTML is sent
            textToAnalyze = html_content.replace(/<[^>]*>?/gm, ' ');
        }

        if (!textToAnalyze) {
            throw new Error("No page text was provided by the extension. Please refresh the page and try again.");
        }

        // Limit for Gemini
        const truncatedText = textToAnalyze.slice(0, 50000); // 50k is safer for first pass

        // 2. Call Gemini API
        const prompt = `
You are an expert job pattern extractor. Your goal is to extract the COMPLETE job details from the provided page text.
Do not summarize the description; provide the FULL description text as found on the page, preserving paragraphs and lists.

Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.

Required Fields:
- title: Job Title (extract the most specific title)
- company: Company Name
- location: specific location (e.g. "San Francisco, CA", "Remote", "New York, NY")
- salary: salary range if available (e.g. "$120k - $150k", "$60/hr")
- description: The FULL job description. Do not truncate. Include responsibilities, requirements, and benefits.
- workType: "Remote", "On-site", "Hybrid", "Contract", "Full-time", etc.
- postedAt: Date posted if available (YYYY-MM-DD format if possible, or relative like "2 days ago")

Context:
- URL: ${url}
- Page Text:
${truncatedText}
    `;

        const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error("Gemini API Error Details:", errorBody);
            throw new Error(`Gemini API Error: ${errorBody.error?.message || apiResponse.statusText || 'Unknown Error'}`);
        }

        const aiData = await apiResponse.json();
        const generatedText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) throw new Error("No data returned from AI");

        // Clean JSON
        const jsonStr = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jobData = JSON.parse(jsonStr);

        // 3. Insert into Database
        // We check for duplicates based on URL first? 
        // Or just insert and let client handle?
        // Let's allow upsert based on URL if we have a unique constraint, otherwise just insert.
        // The schema doesn't seem to enforce unique URL yet, but optimization is good.

        let source = 'extension';
        try {
            if (url) source = new URL(url).hostname.replace('www.', '');
        } catch (e) {
            console.warn("Could not parse hostname from URL:", url);
        }

        const { data: insertedJob, error: dbError } = await supabase
            .from("jobs")
            .insert([
                {
                    title: jobData.title,
                    company: jobData.company,
                    description: jobData.description,
                    location: jobData.location,
                    salary: jobData.salary,
                    work_type: jobData.workType,
                    posted_at: jobData.postedAt,
                    normalized_url: url,
                    source: source,
                    status: 'collected'
                }
            ])
            .select()
            .single();

        if (dbError) throw dbError;

        return new Response(JSON.stringify({ success: true, job: insertedJob }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Function Error:", error.message);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, // Return 200 so Supabase client doesn't wrap it
        });
    }
});
