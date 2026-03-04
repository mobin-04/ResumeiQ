const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.post('/api/analyze', async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({ error: 'Resume text too short or missing.' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) analyst and career coach. Analyze this resume thoroughly.

Resume Text:
"""
${resumeText.slice(0, 6000)}
"""

Return ONLY a valid JSON object (no markdown, no explanation, no backticks) with this exact structure:
{
  "atsScore": <integer 0-100>,
  "scoreTag": <"Excellent" | "Good" | "Fair" | "Needs Work">,
  "scoreSummary": "<2-3 sentence overall assessment>",
  "breakdown": [
    { "label": "Formatting & Structure", "score": <0-100>, "color": "#6c63ff" },
    { "label": "Keywords & Skills", "score": <0-100>, "color": "#ff6584" },
    { "label": "Work Experience", "score": <0-100>, "color": "#43e97b" },
    { "label": "Education", "score": <0-100>, "color": "#ffd166" },
    { "label": "Achievements & Impact", "score": <0-100>, "color": "#06b6d4" }
  ],
  "jobRoles": [
    { "title": "<job title>", "match": "<reason in 5-8 words>", "pct": <0-100> },
    { "title": "<job title>", "match": "<reason>", "pct": <0-100> },
    { "title": "<job title>", "match": "<reason>", "pct": <0-100> },
    { "title": "<job title>", "match": "<reason>", "pct": <0-100> },
    { "title": "<job title>", "match": "<reason>", "pct": <0-100> }
  ],
  "keywordsFound": ["<keyword1>", "<keyword2>", "...up to 12 keywords found in resume"],
  "keywordsMissing": ["<keyword1>", "<keyword2>", "...up to 8 important missing keywords"],
  "suggestions": [
    { "priority": "high", "title": "<issue title>", "desc": "<specific actionable fix, 1-2 sentences>" },
    { "priority": "high", "title": "<issue title>", "desc": "<specific fix>" },
    { "priority": "medium", "title": "<issue title>", "desc": "<specific fix>" },
    { "priority": "medium", "title": "<issue title>", "desc": "<specific fix>" },
    { "priority": "low", "title": "<issue title>", "desc": "<specific fix>" }
  ]
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Gemini API error.' });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ResumeIQ server running on port ${PORT}`);
});
