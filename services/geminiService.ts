
import { GoogleGenAI } from "@google/genai";
import { type GeminiTextResponse } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

const getApiKey = (): string | undefined => {
  // In a real app, process.env.API_KEY would be set by the build process or environment.
  // For this sandbox, it relies on the execution environment having it.
  return process.env.API_KEY;
};


let ai: GoogleGenAI | null = null;

const getGenAIClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API Key (API_KEY environment variable) is not configured.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

/**
 * Generates text content using the Gemini API.
 * @param prompt The text prompt to send to the model.
 * @returns A Promise resolving to a GeminiTextResponse object.
 */
export const generateText = async (prompt: string): Promise<GeminiTextResponse> => {
  try {
    const client = getGenAIClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      // config: { thinkingConfig: { thinkingBudget: 0 } } // Example: Disable thinking for low latency, if needed
    });

    // Direct access to text as per documentation for GenerateContentResponse
    const text = response.text;
    if (typeof text === 'string') {
      return { text };
    }
    // Fallback if .text is not directly available or in an unexpected format, though current SDK should provide it.
    return { text: '', error: "Unexpected response format from Gemini API." };

  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    // Provide more specific error messages if possible
    let errorMessage = "Failed to get response from Gemini API.";
    if (error.message) {
      errorMessage += ` Details: ${error.message}`;
    }
    if (error.toString().includes("API key not valid")) {
        errorMessage = "Gemini API Key is not valid. Please check your API_KEY environment variable.";
    } else if (error.toString().includes("fetch")) {
         errorMessage = "Network error or issue reaching Gemini API. Check internet connection and API endpoint.";
    }
    return { text: '', error: errorMessage };
  }
};