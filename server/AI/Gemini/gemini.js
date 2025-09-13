import { GoogleGenAI } from "@google/genai"
import { config } from "dotenv"
config({
    path: '../../.env'
})
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});

async function geminiThink() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

async function gemini() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    }
  });
  console.log(response.text);
}

await gemini();