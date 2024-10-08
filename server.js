// server.js

const express = require('express');
const dotenv = require('dotenv');
const logger = require('./logger');
const apiRoutes = require('./routes/apiRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'client' directory
app.use(express.static('client'));

// Mount API routes under '/api'
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});