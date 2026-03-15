import dotenv from 'dotenv';

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct";

export class HFService {
  static async chat(prompt: string, systemPrompt: string = "You are a helpful AI assistant.") {
    if (!HF_TOKEN) {
      console.warn("HF_TOKEN is not defined in .env. AI features will not work.");
      return "AI service is currently unavailable (HF_TOKEN missing).";
    }

    try {
      // Using the new router endpoint with OpenAI-compatible format
      const response = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(`Hugging Face API error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      
      if (result.choices && result.choices[0]?.message?.content) {
        return result.choices[0].message.content.trim();
      }
      
      return JSON.stringify(result);
    } catch (error) {
      console.error("HFService Error:", error);
      return "Sorry, I encountered an error while processing your request.";
    }
  }
}
