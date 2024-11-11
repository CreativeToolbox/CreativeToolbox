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

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  timeWindow: 60000, // 1 minute
  requests: []
};

const checkRateLimit = () => {
  const now = Date.now();
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

export const rewriteText = async (text, options = {}) => {
  // Destructure options with defaults
  const {
    tone = 'neutral',
    style = 'narrative',
    audience = 'general',
    pacing = 50,
    keepContext = true,
    isPreview = false
  } = options;

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

  // Check rate limit
  checkRateLimit();

  try {
    console.log('Initializing Gemini with API key:', import.meta.env.VITE_GEMINI_API_KEY.slice(0, 5) + '...');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    
    console.log('Getting model...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Construct story-focused prompt
    const prompt = `As a creative writing assistant, help improve this story segment while keeping the content appropriate and family-friendly. Please rewrite with these specifications:

    Tone: ${tone}
    Writing Style: ${style}
    Target Audience: ${audience}
    Pacing: ${pacing}% (where 0% is slower/detailed and 100% is faster/dynamic)
    ${keepContext ? 'Important: Maintain appropriate story context and continuity.' : ''}
    
    Story segment to revise (maintaining appropriate content):
    "${text}"
    
    Guidelines:
    - Keep content appropriate for the specified audience
    - Maintain story coherence
    - Focus on clear, engaging writing
    - Avoid sensitive or inappropriate themes
    ${isPreview ? '- This is a preview version' : ''}
    
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