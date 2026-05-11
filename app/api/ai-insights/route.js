import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { dataSummary } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return Response.json({ 
        error: "AI engine not configured. Please set GEMINI_API_KEY in your .env.local file.",
        insights: [] 
      }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are a clinical data scientist analyzing clinic visit data.
      Here is a summary of recent symptom trends at our clinic:
      ${dataSummary}

      Based on this data, provide 4 concise, high-impact clinical insights for doctors.
      Focus on seasonality, potential outbreaks, and stock recommendations for medicines.
      Return exactly 4 bullet points, each on a new line. Do not use markdown formatting.
    `;

    // Retry logic for rate limiting
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the text into an array of strings
        const insights = text.split('\n').filter(line => line.trim().length > 0).slice(0, 4);

        return Response.json({ insights });
      } catch (e) {
        lastError = e;
        if (e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('rate')) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        throw e; // Non-retryable error
      }
    }
    throw lastError; // All retries exhausted
  } catch (error) {
    console.error("AI Insight Error:", error);
    let errorMessage = "Failed to generate insights.";
    if (error.message?.includes('API_KEY')) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in .env.local.";
    } else if (error.message?.includes('429') || error.message?.includes('quota')) {
      errorMessage = "API rate limit exceeded. Please wait a moment and try again.";
    } else if (error.message) {
      errorMessage = `AI engine error: ${error.message}`;
    }
    return Response.json({ error: errorMessage, insights: [] }, { status: 500 });
  }
}
