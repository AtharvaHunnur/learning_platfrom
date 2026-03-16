import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct";

async function testAI() {
  console.log("Testing Hugging Face Integration...");
  console.log("Model:", MODEL_ID);
  console.log("Token length:", HF_TOKEN ? HF_TOKEN.length : 0);

  if (!HF_TOKEN) {
    console.error("Error: HF_TOKEN is missing in .env");
    return;
  }

  try {
    const response = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "user", content: "Hello, who are you?" }
        ],
        max_tokens: 50,
      }),
    });

    console.log("Status:", response.status);
    const result = await response.json();
    console.log("Response:", JSON.stringify(result, null, 2));

    if (response.status === 200) {
      console.log("SUCCESS: AI is responsive.");
    } else {
      console.log("FAILURE: API returned an error.");
    }
  } catch (error) {
    console.error("CATCH: Error during fetch:", error);
  }
}

testAI();
