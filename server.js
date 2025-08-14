// server.js - Reconfigured for OpenRouter API
// This server now uses your OpenRouter key to access the Kimi K2 model.
const express = require("express");
require("dotenv").config();

const app = express();

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.path}`);
  next();
});

app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// --- Resilient Fetch with Exponential Backoff (Kept for robustness) ---
const fetchWithRetry = async (url, options, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(url, options);
            if (response.status === 429 || response.status === 503) { // Handle rate limits from OpenRouter
                const delay = Math.pow(2, i) * 1000;
                console.log(`API is busy. Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                lastError = new Error(`API is busy. Last status: ${response.status}`);
                continue;
            }
            return response;
        } catch (error) {
            lastError = error;
            const delay = Math.pow(2, i) * 1000;
            console.log(`Network error. Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
};

// --- Main Generation Endpoint (Now using OpenRouter) ---
app.post("/api/generate", async (req, res) => {
    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OPENROUTER_API_KEY is not set." });
    }
    try {
        const { prompt, type } = req.body;
        if (!prompt || !type) {
            return res.status(400).json({ error: "Missing prompt or type." });
        }

        let systemInstruction = "";
        if (type === 'resume') {
            // --- NEW: STRICT SINGLE-PAGE ATS RESUME PROMPT ---
            systemInstruction = `You are an expert ATS-friendly resume writer creating a modern, two-column resume.
- **ULTRA-CRITICAL CONSTRAINT: The final output MUST be brief enough to fit on a single standard A4 or Letter-sized page. Be ruthless in cutting down content to meet this limit. Prioritize recent and relevant information.**
- **CRITICAL:** All work experience must be in reverse chronological order (most recent job first).
- The Professional Summary must be **no more than 3-4 lines**.
- Use **no more than 3-5** achievement-oriented bullet points under each job.
- Format the entire response using simple Markdown.
- Start with the main header: '# Full Name'.
- Immediately after the name, add contact info on one line: 'Location | Phone | Email | LinkedIn URL | Portfolio URL'.
- Follow with '## Professional Summary'.
- For the two-column layout, use a special marker '---[COLUMN_BREAK]---' exactly ONCE.
- The LEFT column (before the marker) should contain '## Work Experience' and '## Education'.
- The RIGHT column (after the marker) should contain '## Skills' and '## Projects'.
- Under 'Work Experience', format each job entry precisely like this: '**Job Title** at Company Name | *City, State* | Month Year - Month Year'.
- Use '* List item' for all bullet points.
- Do NOT add any extra notes, commentary, or cover letter content.`;
        } else {
            // --- NEW: STRICT SINGLE-PAGE PROFESSIONAL COVER LETTER PROMPT ---
            systemInstruction = `You are a professional cover letter writer.
- **ULTRA-CRITICAL CONSTRAINT: The entire letter must be concise and professionally formatted to fit comfortably on a single standard A4 or Letter-sized page. This is a strict requirement.**
- Format the response as a complete, standard business letter, ready to be sent.
- The body of the letter must consist of **exactly 3 professional and concise paragraphs** tailored to the job description.
- The structure must be:
[Your Name]
[Your Phone]
[Your Email]

[Date]

[Hiring Manager Name]
[Company Name]
[Company Address]

Dear [Hiring Manager Name],

[Paragraph 1: Introduction - State the position you're applying for and where you saw it.]
[Paragraph 2: Body - Highlight your most relevant skills and experiences from the job description.]
[Paragraph 3: Conclusion - Reiterate your interest and include a call to action.]

Sincerely,
[Your Name]
- Do NOT use Markdown formatting like '#' or '*'. Just plain text with paragraph breaks.
- Do NOT include any resume sections or extra commentary.`;
        }
        const fullPrompt = `${systemInstruction}\n\n---\n\n${prompt}`;

        const payload = {
            model: "moonshotai/kimi-k2:free", // Using the specified free Kimi K2 model
            messages: [
                { role: "user", content: fullPrompt }
            ]
        };
        
        const API_URL = "https://openrouter.ai/api/v1/chat/completions";
        
        const response = await fetchWithRetry(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000", // Optional, replace with your site URL
                "X-Title": "AI Resume Architect" // Optional, replace with your site name
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Error:", errorText);
            return res.status(response.status).json({ error: "Failed to generate document from API." });
        }

        const data = await response.json();
        const output = data.choices?.[0]?.message?.content || "No content received from API.";
        res.json({ output });

    } catch (err) {
        console.error("Server Error on /api/generate:", err);
        res.status(500).json({ error: err.message || "An internal server error occurred." });
    }
});

// The contact extraction endpoint is removed as it's better to handle all AI calls through one unified generator.
// The main prompt is sufficient to get all necessary information.

app.use(express.static(__dirname)); 

const PORT = process.env.PORT || 3000;  
app.listen(PORT, () => console.log(`Proxy server listening on http://localhost:${PORT}`));
