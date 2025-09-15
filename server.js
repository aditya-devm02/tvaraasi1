const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDSKBupwR_jNNUTFeodQkOl26LlA0gjxcU';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.post('/ask-gemini', async (req, res) => {
  const startedAt = Date.now();
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ loading: false, error: 'Missing required field: prompt' });
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    };

    const response = await axios.post(
      `${GEMINI_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const candidates = response?.data?.candidates || [];
    const first = candidates[0] || {};
    const parts = first?.content?.parts || [];
    const text = parts[0]?.text || '';

    return res.status(200).json({
      loading: false,
      response: text,
      model: 'gemini-2.0-flash',
      elapsedMs: Date.now() - startedAt
    });
  } catch (err) {
    const status = err?.response?.status || 500;
    const details = err?.response?.data || { message: err?.message };
    return res.status(status).json({ loading: false, error: details });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});


