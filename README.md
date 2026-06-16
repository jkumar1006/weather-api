# Project URL
https://roadmap.sh/projects/weather-api-wrapper-service
# Weather API

A weather API that fetches data from the Visual Crossing API and caches results in Redis.

Project from roadmap.sh: https://roadmap.sh/projects/weather-api

## Features
- Fetches real-time weather data for any city
- Caches responses in Redis with a 12-hour expiry
- Clean error handling for invalid cities and API issues
- Rate limiting to prevent abuse

## Setup

1. Clone the repo and install dependencies:

npm install

2. Create a `.env` file in the root with:

WEATHER_API_KEY=your_visual_crossing_key

REDIS_URL=your_redis_connection_url

PORT=3000

3. Start the server:

node app.js

## Usage

Request weather for a city:

GET http://localhost:3000/weather/London

Returns JSON with a `source` field (`api` or `cache`) and the weather data.

## Tech Stack
Node.js, Express, Redis, Axios, express-rate-limit
