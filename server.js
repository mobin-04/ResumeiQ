const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint — keeps your API key hidden from users
app.post('/api/analyze', async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({ error: 'Resume text too short or missing.' });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) analyst and career coach. Analyze this resume thoroughly.

Resume Text:
"""
${resumeText.slice(0, 6000)}
"""

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Claude API error.' });
    }

    const data = await response.json();
    const rawText = data.content.map(b => b.text || '').join('');
    const clean = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Fallback: serve index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ResumeIQ server running on port ${PORT}`);
});
