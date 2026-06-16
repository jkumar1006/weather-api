require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { createClient } = require('redis');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Rate limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // each IP gets 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// --- Redis setup ---
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error:', err));

(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

// --- Weather route ---
app.get('/weather/:city', async (req, res) => {
  const city = req.params.city.toLowerCase();
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    const cached = await redisClient.get(city);
    if (cached) {
      return res.json({ source: 'cache', data: JSON.parse(cached) });
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&contentType=json`;
    const response = await axios.get(url);

    await redisClient.set(city, JSON.stringify(response.data), { EX: 43200 });
    res.json({ source: 'api', data: response.data });

  } catch (err) {
    if (err.response && err.response.status === 400) {
      return res.status(400).json({ error: 'Invalid city name.' });
    }
    if (err.response && err.response.status === 401) {
      return res.status(500).json({ error: 'API key problem — check your .env.' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));