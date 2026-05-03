import { GoogleGenerativeAI } from "@google/generative-ai";
import sanitizeHtml from 'sanitize-html';

// Initialize the Gemini AI client with the server-side environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: "You are a nonpartisan, civic-focused Indian Election Process Assistant. Explain concepts about the Indian electoral system (Lok Sabha, Rajya Sabha, Election Commission of India, EVMs, VVPATs, etc.) in simple, accessible language. Do not express political opinions, favor any candidate or party, or discuss current political controversies. Stick strictly to the mechanics, history, and rules of the Indian election process."
});

// Basic in-memory rate limiting (Note: in-memory state can reset across serverless function cold starts)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

export default async function handler(req, res) {
  // Allow CORS for Vercel domain or local dev
  const origin = req.headers.origin;
  const allowedOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*';
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Rate Limiting
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const currentTime = Date.now();
    
    if (rateLimit.has(ip)) {
      const { count, startTime } = rateLimit.get(ip);
      if (currentTime - startTime < RATE_LIMIT_WINDOW_MS) {
        if (count >= MAX_REQUESTS_PER_WINDOW) {
          return res.status(429).json({ error: 'Too many requests, please try again later.' });
        }
        rateLimit.set(ip, { count: count + 1, startTime });
      } else {
        rateLimit.set(ip, { count: 1, startTime: currentTime });
      }
    } else {
      rateLimit.set(ip, { count: 1, startTime: currentTime });
    }

    // 2. Input Validation and Sanitization
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message exceeds the 500 character limit.' });
    }

    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: [], // Strip all HTML tags
      allowedAttributes: {}
    });

    if (!sanitizedMessage.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty or contain only HTML tags.' });
    }

    // Process history if provided (convert from frontend format to Gemini format)
    let geminiHistory = [];
    if (history && Array.isArray(history)) {
      geminiHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
    }

    // 3. Call Gemini API
    const chat = model.startChat({
      history: geminiHistory
    });

    const result = await chat.sendMessage(sanitizedMessage);
    const responseContent = result.response.text();

    return res.status(200).json({ text: responseContent });

  } catch (error) {
    // Return generic error message to avoid exposing internal details
    return res.status(500).json({ error: 'An internal server error occurred while processing your request.' });
  }
}
