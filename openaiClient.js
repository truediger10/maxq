// openaiClient.js

const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const logger = require('./logger');

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Enriches launch data using OpenAI's text completion API.
 * @param {Object} launchData - The launch data object.
 * @returns {Object} - Enriched launch data.
 */
exports.enrichLaunchData = async (launchData) => {
  try {
    const prompt = `
You are an expert in aerospace and space missions. Provide detailed information on the following aspects for the rocket launch "${launchData.name}":

1. **Mission Objectives:** What are the primary goals of this mission?
2. **Payload Information:** What payload is being carried, and what is its purpose?
3. **Fun Facts:** Share some interesting or lesser-known facts about this launch or the rocket involved.
4. **Historical Context:** How does this mission fit into the broader history of space exploration?

Provide the information in the following JSON format without any additional text or code blocks:

{
  "missionObjectives": "",
  "payloadInfo": "",
  "funFacts": "",
  "historicalContext": ""
}
`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
      stop: ["}"], // Ensures the model stops after completing the JSON
    });

    let enrichedInfoText = response.data.choices[0].text.trim();

    // Ensure the response ends with a closing brace
    const lastBraceIndex = enrichedInfoText.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      enrichedInfoText = enrichedInfoText.substring(0, lastBraceIndex + 1);
    }

    // Parse the JSON response
    let enrichedInfo;
    try {
      enrichedInfo = JSON.parse(enrichedInfoText);
    } catch (parseError) {
      logger.error('Error parsing OpenAI JSON response:', parseError);
      logger.error('OpenAI response text:', enrichedInfoText);
      throw new Error('Failed to parse enriched data from OpenAI.');
    }

    return enrichedInfo;
  } catch (error) {
    logger.error('Error enriching data with OpenAI:', error);
    throw error;
  }
};