require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

// Proxy endpoint for Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: "You are a nonpartisan, civic-focused Indian Election Process Assistant. Explain concepts about the Indian electoral system (Lok Sabha, Rajya Sabha, Election Commission of India, EVMs, VVPATs, etc.) in simple, accessible language. Do not express political opinions, favor any candidate or party, or discuss current political controversies. Stick strictly to the mechanics, history, and rules of the Indian election process.",
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API Error:", errorData);
      return res.status(response.status).json({ error: errorData.error?.message || 'Failed to fetch response from AI' });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy endpoint for Quiz Generation
app.post('/api/quiz', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const prompt = `Generate 5 multiple-choice questions about the Indian General Election (Lok Sabha) process. 
    Return ONLY a raw JSON array of objects. Do not include any markdown formatting, backticks, or introduction text. 
    Each object must exactly match this format:
    {
      "question": "The question text (about ECI, EVMs, Model Code of Conduct, etc.)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0, // integer 0-3
      "explanation": "Brief explanation of why this is correct."
    }`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Failed to fetch quiz from AI' });
    }

    const data = await response.json();
    const textContent = data.content[0].text;
    
    // Parse JSON
    try {
      const quizData = JSON.parse(textContent);
      res.json(quizData);
    } catch (parseError) {
      console.error("Failed to parse quiz JSON:", textContent);
      res.status(500).json({ error: 'Failed to parse AI response into JSON' });
    }

  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Secure Backend Server listening on port ${PORT}`);
});
