// rocketLaunchClient.js

const axios = require('axios');
const logger = require('./logger');
require('dotenv').config();

const API_KEY = process.env.ROCKETLAUNCHLIVE_API_KEY;

// Add caching mechanism
let cachedLaunchData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

exports.fetchLaunches = async () => {
  const currentTime = Date.now();
  if (cachedLaunchData && currentTime - lastFetchTime < CACHE_DURATION) {
    return cachedLaunchData;
  }
  try {
    const response = await axios.get(`https://fdo.rocketlaunch.live/json/launches/next/25?key=${API_KEY}`);
    cachedLaunchData = response.data.result;
    lastFetchTime = currentTime;
    return cachedLaunchData;
  } catch (error) {
    logger.error('Error fetching launch data:', error.response ? error.response.data : error.message);
    throw error;
  }
};