import { GoogleGenerativeAI } from "@google/generative-ai";

class AIError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'AIError';
    this.type = type;
    this.originalError = originalError;
  }
}

const MAX_CHARS = 1000;
const MIN_CHARS = 10;

export const rewriteText = async (text, style = "professional") => {
  // Input validation
  if (!text || typeof text !== 'string') {
    throw new AIError(
      'Invalid input: Text must be a non-empty string.',
      'INPUT_ERROR'
    );
  }

  if (text.length > MAX_CHARS) {
    throw new AIError(
      `Text is too long. Please select less than ${MAX_CHARS} characters.`,
      'LENGTH_ERROR'
    );
  }

  if (text.length < MIN_CHARS) {
    throw new AIError(
      `Text is too short. Please select at least ${MIN_CHARS} characters.`,
      'LENGTH_ERROR'
    );
  }

  const RATE_LIMIT = {
    maxRequests: 10,
    timeWindow: 60000, // 1 minute
    requests: []
  };
  
  const checkRateLimit = () => {
    const now = Date.now();
    // Remove old requests
    RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
      time => now - time < RATE_LIMIT.timeWindow
    );
    
    if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
      const oldestRequest = RATE_LIMIT.requests[0];
      const waitTime = Math.ceil((RATE_LIMIT.timeWindow - (now - oldestRequest)) / 1000);
      throw new AIError(
        `Rate limit exceeded. Please wait ${waitTime} seconds.`,
        'RATE_LIMIT_ERROR'
      );
    }
    
    RATE_LIMIT.requests.push(now);
  };

  // Validate input
  if (!text || typeof text !== 'string') {
    throw new AIError(
      'Invalid input: Text must be a non-empty string.',
      'INPUT_ERROR'
    );
  }

  try {
    console.log('Initializing Gemini with API key:', import.meta.env.VITE_GEMINI_API_KEY.slice(0, 5) + '...');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    
    console.log('Getting model...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Please rewrite the following text in a ${style} tone, maintaining the core message but improving clarity and impact:

Text to rewrite: "${text}"

Provide only the rewritten text without any explanations or additional formatting.`;

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini:', result);
    
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Detailed AI Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      // Add any Gemini-specific error properties
      status: error.status,
      details: error.details,
    });

    // Categorize errors
    if (error.message?.includes('API key')) {
      throw new AIError(
        'Invalid API key. Please check your configuration.',
        'AUTH_ERROR',
        error
      );
    }
    
    if (error.message?.includes('quota')) {
      throw new AIError(
        'API quota exceeded. Please try again later.',
        'QUOTA_ERROR',
        error
      );
    }

    if (error.name === 'TypeError') {
      throw new AIError(
        'Network or configuration error. Please check your connection.',
        'NETWORK_ERROR',
        error
      );
    }

    throw new AIError(
      'Failed to process text with AI: ' + error.message,
      'GENERAL_ERROR',
      error
    );
  }
};