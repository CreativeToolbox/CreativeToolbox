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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH",
        },
      ],
    });

    // Enhanced prompt with more specific guidance
    const toneGuidance = {
      whimsical: 'light-hearted and playful, with a sense of wonder',
      serious: 'thoughtful and measured, with gravitas',
      mysterious: 'intriguing and suspenseful, building curiosity',
      humorous: 'witty and entertaining, with natural humor',
      dramatic: 'emotionally intense and impactful',
      adventurous: 'exciting and dynamic, full of energy',
      neutral: 'balanced and straightforward'
    };

    const styleGuidance = {
      narrative: 'flowing storytelling with strong narrative voice',
      descriptive: 'rich, vivid details that paint a clear picture',
      'dialogue-heavy': 'natural conversations that reveal character and advance the story',
      'action-focused': 'dynamic and engaging action sequences',
      emotional: 'deep emotional resonance and character insight',
      minimalist: 'concise and impactful, every word carefully chosen',
      poetic: 'lyrical and metaphorical, with artistic flair'
    };

    const pacingDescription = pacing < 30 ? 'measured and detailed, taking time to explore moments' :
                             pacing > 70 ? 'swift and dynamic, maintaining forward momentum' :
                             'balanced pacing, with natural flow';

    const prompt = `As a writing assistant, enhance this text while preserving its original meaning and intent.

Key requirements:
- Tone: ${toneGuidance[tone]}
- Style: ${styleGuidance[style]}
- Audience: ${audience} readers
- Pacing: ${pacingDescription}
${keepContext ? '- Maintain narrative continuity and context from the original' : ''}

Original text to enhance:
"${text}"

Guidelines:
1. Preserve the core message and key details
2. Enhance readability and flow
3. Match the requested style and tone
4. Keep similar length and structure
5. Maintain the original context and meaning
${isPreview ? '6. This is a preview version - focus on demonstrating the style changes' : ''}

Response format: Provide only the enhanced text, without explanations or meta-text.`;

    console.log('Sending enhanced request to Gemini...');
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    
    // Clean up the response text
    let rewrittenText = response.text()
      .replace(/^["']|["']$/g, '') // Remove quotes if present
      .trim();
    
    return rewrittenText;
    
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

    // Add specific handling for safety blocks
    if (error.message?.includes('SAFETY')) {
      throw new AIError(
        'Unable to process this content. Please ensure the text is appropriate and try again.',
        'SAFETY_ERROR',
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