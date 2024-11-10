import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function rewriteText(text, style = "professional") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Please rewrite the following text in a ${style} tone, maintaining the core message but improving clarity and impact:

Text to rewrite: "${text}"

Provide only the rewritten text without any explanations or additional formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Processing Error:', error);
    throw new Error('Failed to process text with AI');
  }
}