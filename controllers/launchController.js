// controllers/launchController.js

const rocketLaunchClient = require('../rocketLaunchClient');
const openaiClient = require('../openaiClient');
const logger = require('../logger');
const NodeCache = require('node-cache');

const enrichmentCache = new NodeCache({ stdTTL: 86400 }); // 24 hours TTL

/**
 * Fetches rocket launches and enriches each launch with additional data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getLaunches = async (req, res) => {
  try {
    const launches = await rocketLaunchClient.fetchLaunches();

    if (!Array.isArray(launches)) {
      logger.warn('Fetched launches data is not an array.');
      return res.status(500).json({ error: 'Invalid data format received from RocketLaunch.Live API.' });
    }

    // Enrich each launch
    const enrichedLaunches = await Promise.all(
      launches.map(async (launch) => {
        if (!launch || !launch.id) {
          logger.warn('Invalid launch data encountered during enrichment.');
          return launch;
        }

        const cacheKey = `enriched_${launch.id}`;

        // Check cache
        let enrichedInfo = enrichmentCache.get(cacheKey);
        if (enrichedInfo) {
          logger.info(`Cache hit for launch ID: ${launch.id}`);
        } else {
          // Enrich data
          try {
            enrichedInfo = await openaiClient.enrichLaunchData(launch);
            enrichmentCache.set(cacheKey, enrichedInfo);
            logger.info(`Enriched data cached for launch ID: ${launch.id}`);
          } catch (enrichmentError) {
            logger.warn(`Failed to enrich launch ID: ${launch.id}`);
            // Assign default messages if enrichment fails
            enrichedInfo = {
              missionObjectives: 'Mission objectives not available.',
              payloadInfo: 'Payload information not available.',
              funFacts: 'No fun facts available.',
              historicalContext: 'Historical context unavailable.',
            };
          }
        }

        return {
          ...launch,
          missionObjectives: enrichedInfo.missionObjectives,
          payloadInfo: enrichedInfo.payloadInfo,
          funFacts: enrichedInfo.funFacts,
          historicalContext: enrichedInfo.historicalContext,
        };
      })
    );

    res.json(enrichedLaunches);
  } catch (error) {
    logger.error('Error fetching launches:', error);
    res.status(500).json({ error: 'Failed to fetch launches' });
  }
};