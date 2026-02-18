import { useState, useEffect } from 'react';

export interface JobDetails {
    title: string;
    company: string;
    url: string;
    source: string;
    description?: string;
    location?: string;
    salary?: string;
    postedAt?: string;
    workType?: string;
}

export const useJobDetection = () => {
    const [job, setJob] = useState<JobDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const detectJob = async () => {
        setLoading(true);
        // Check if we are in a chrome extension environment
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

                if (tab?.id) {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            // --- SCRAPING LOGIC (Runs in Page Context) ---
                            const getMeta = (name: string) =>
                                document.querySelector(`meta[property='${name}']`)?.getAttribute("content") ||
                                document.querySelector(`meta[name='${name}']`)?.getAttribute("content");

                            let jobData: any = {
                                title: document.title,
                                company: "Unknown Company",
                                url: window.location.href,
                                source: window.location.hostname.replace('www.', ''),
                                description: "",
                            };

                            // Strategy 1: JSON-LD (Schema.org)
                            const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
                            for (const script of jsonLdScripts) {
                                try {
                                    const json = JSON.parse(script.textContent || "{}");
                                    const entities = Array.isArray(json) ? json : [json];
                                    const jobPosting = entities.find(e => e['@type'] === 'JobPosting');

                                    if (jobPosting) {
                                        jobData.title = jobPosting.title || jobData.title;
                                        jobData.company = jobPosting.hiringOrganization?.name || jobData.company;
                                        jobData.description = jobPosting.description || "";
                                        jobData.location = jobPosting.jobLocation?.address?.addressLocality || "";
                                        jobData.postedAt = jobPosting.datePosted;
                                        // Handle salary if available (often complex object)
                                        if (typeof jobPosting.baseSalary === 'object') {
                                            jobData.salary = `${jobPosting.baseSalary.value?.minValue || ''} - ${jobPosting.baseSalary.value?.maxValue || ''} ${jobPosting.baseSalary.currency || ''}`;
                                        }

                                        // Handle work type
                                        if (jobPosting.employmentType) {
                                            jobData.workType = Array.isArray(jobPosting.employmentType)
                                                ? jobPosting.employmentType.join(", ").replace(/_/g, " ")
                                                : jobPosting.employmentType.replace(/_/g, " ");
                                        }
                                        if (jobPosting.jobLocationType === 'TELECOMMUTE') {
                                            jobData.workType = jobData.workType ? `${jobData.workType} (Remote)` : "Remote";
                                        }

                                        break; // Found the best data source
                                    }
                                } catch (e) {
                                    // Ignore parse errors
                                }
                            }

                            // Strategy 2: Meta Tags (if JSON-LD failed for core fields)
                            if (jobData.company === "Unknown Company") {
                                jobData.company = getMeta("og:site_name") || jobData.company;
                            }
                            if (jobData.title === document.title) { // validation if specific title exists
                                jobData.title = getMeta("og:title") || document.title;
                            }
                            if (!jobData.description) {
                                jobData.description = getMeta("og:description") || getMeta("description") || "";
                            }

                            // Strategy 3: Selectors (LinkedIn, Indeed specific overrides)
                            const host = window.location.hostname;
                            if (host.includes("linkedin")) {
                                // LinkedIn Unified Top Card
                                const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title');
                                const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name');
                                const descriptionEl = document.querySelector('#job-details') || document.querySelector('.jobs-description__content');

                                if (titleEl) jobData.title = titleEl.textContent?.trim();
                                if (companyEl) jobData.company = companyEl.textContent?.trim();
                                if (descriptionEl) {
                                    // Get text with newlines preservation
                                    jobData.description = (descriptionEl as HTMLElement).innerText?.trim();
                                }
                            }
                            else if (host.includes("indeed")) {
                                const titleEl = document.querySelector('.jobsearch-JobInfoHeader-title');
                                const companyEl = document.querySelector('[data-company-name="true"]');
                                const descriptionEl = document.querySelector('#jobDescriptionText');

                                if (titleEl) jobData.title = titleEl.textContent?.trim();
                                if (companyEl) jobData.company = companyEl.textContent?.trim();
                                if (descriptionEl) {
                                    jobData.description = (descriptionEl as HTMLElement).innerText?.trim();
                                }
                            }

                            // Clean up title (remove " | LinkedIn", etc. if sticking with doc title)
                            if (jobData.title.includes(" | ")) {
                                jobData.title = jobData.title.split(" | ")[0];
                            }

                            return jobData;
                        }
                    });

                    if (results && results[0] && results[0].result) {
                        const data = results[0].result;

                        // Basic URL check
                        const isJobUrl = data.url.includes("/jobs/") ||
                            data.url.includes("linkedin.com/jobs") ||
                            data.url.includes("indeed.com") ||
                            data.url.includes("greenhouse.io") ||
                            data.url.includes("lever.co") ||
                            data.url.includes("workday");

                        if (isJobUrl) {
                            setJob(data);
                        } else {
                            setJob(null);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to detect job", err);
            }
        } else {
            // Dev mode fallback
            console.log("Not in Chrome Extension environment, using mock");
            setTimeout(() => setJob({
                title: "Senior React Developer",
                company: "Tech Corp",
                url: "http://mock-job",
                source: "mock",
                description: "Great job opportunity..."
            }), 1000);
        }
        setLoading(false);
    };

    useEffect(() => {
        detectJob();
    }, []);

    return { job, loading, detectJob };
};
