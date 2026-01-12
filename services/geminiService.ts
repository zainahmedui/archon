import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Note: In a production app, we would handle missing keys gracefully in the UI. 
// For this demo, we assume the environment is set up correctly.

const ai = new GoogleGenAI({ apiKey });

/**
 * Helps the user write a better bio.
 * Does NOT generate a fake persona. It takes user input and polishes it.
 */
export const enhanceBio = async (currentBio: string): Promise<string> => {
  if (!currentBio.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a helpful UX writer for a social network called Archon. 
      The user has written a bio: "${currentBio}". 
      Rewrite this bio to be more professional, clear, and authentic. 
      Do not invent facts. Keep it under 150 characters. Return only the text.`,
    });
    return response.text?.trim() || currentBio;
  } catch (error) {
    console.error("Gemini Bio Error:", error);
    return currentBio;
  }
};

/**
 * Analyzes post content for tone.
 * Archon promotes "Calm" and "Authentic" content.
 */
export const checkPostTone = async (content: string): Promise<string> => {
  if (!content.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following social media post for tone: "${content}".
      If the tone is aggressive, misleading, or overly "clickbait", suggest a more neutral and authentic phrasing.
      If it is already good, simply return "Looks good.".
      Keep the suggestion short and kind.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Tone Error:", error);
    return "";
  }
};
