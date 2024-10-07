const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint to fetch upcoming launches
app.get('/api/launches', async (req, res) => {
  try {
    const response = await axios.get('https://ll.thespacedevs.com/2.2.0/launch/upcoming/');
    res.json(response.data.results);
  } catch (error) {
    console.error('Error fetching launch data:', error);
    res.status(500).json({ error: 'Failed to fetch launch data' });
  }
});

// Endpoint to enrich launch data (modify as needed)
app.post('/api/enrich', async (req, res) => {
  try {
    const launchData = req.body.launchData;
    // Implement your data enrichment logic here, e.g., using OpenAI API
    // For now, return the original data
    res.json({
      enrichedDescription: 'Description not available.',
      missionObjectives: 'Information not available.',
      payloadInfo: 'Information not available.',
      rocketType: launchData.vehicle?.name || 'Information not available.',
      launchProvider: launchData.provider?.name || 'Information not available.',
      launchSite: launchData.pad?.location?.name || 'Information not available.',
      funFacts: 'No fun facts available.',
      historicalContext: 'Information not available.',
    });
  } catch (error) {
    console.error('Error enriching data:', error);
    res.status(500).json({ error: 'Failed to enrich data' });
  }
});

// Endpoint to get server time
app.get('/api/server-time', (req, res) => {
  res.json({ serverTime: Date.now() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});