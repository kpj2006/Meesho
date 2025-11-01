const axios = require('axios');

/**
 * Call Gemini API with a prompt
 * @param {string} prompt - The prompt to send to Gemini
 * @param {string} systemInstruction - Optional system instruction
 * @param {object} options - Options like temperature, maxTokens
 * @returns {Promise<string>} - The response text from Gemini
 */
async function callGemini(prompt, systemInstruction = null, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const temperature = options.temperature || 0.3;
  const maxOutputTokens = options.maxTokens || 1000;
  const model = options.model || 'gemini-1.5-flash';

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  // Add system instruction if provided
  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [
        {
          text: systemInstruction,
        },
      ],
    };
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract text from Gemini response
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response text from Gemini');
    }

    return text.trim();
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { callGemini };

