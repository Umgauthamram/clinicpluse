import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { clinicalNotes } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return Response.json({ 
        error: "AI engine not configured. Please set GEMINI_API_KEY in your .env.local file.",
        symptoms: [],
        predictions: []
      }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an expert medical AI diagnostic assistant. 
      Read the following clinical notes. 
      1. Extract all discrete medical symptoms mentioned.
      2. Based ONLY on the extracted symptoms, provide your top 3 most likely medical diagnoses along with a confidence percentage for each.
      
      Clinical Notes:
      ${clinicalNotes}

      Return the exact output as a JSON object strictly following this structure. Do not include any markdown formatting, backticks, or other text:
      {
        "symptoms": ["headache", "fever", "nausea"],
        "predictions": [
          {"disease": "Malaria", "probability": 85.5},
          {"disease": "Dengue", "probability": 42.1},
          {"disease": "Common Cold", "probability": 15.0}
        ]
      }
    `;

    // Retry logic for rate limiting
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // Clean up potential markdown formatting
        if (text.startsWith('```json')) {
          text = text.slice(7, -3).trim();
        } else if (text.startsWith('```')) {
          text = text.slice(3, -3).trim();
        }

        let parsedData = { symptoms: [], predictions: [] };
        try {
          parsedData = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse Gemini output as JSON:", text);
          parsedData.symptoms = text.replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
        }

        return Response.json(parsedData);
      } catch (e) {
        lastError = e;
        if (e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('rate')) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        throw e;
      }
    }
    throw lastError;
  } catch (error) {
    console.error("AI Extraction Error:", error);
    
    // Surface specific error messages
    let errorMessage = "Failed to extract symptoms.";
    if (error.message?.includes('API_KEY')) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in .env.local.";
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorMessage = "API rate limit exceeded. Please wait a moment and try again.";
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorMessage = "AI model not available. Please check the model configuration.";
    } else if (error.message) {
      errorMessage = `AI engine error: ${error.message}`;
    }
    
    return Response.json({ 
      error: errorMessage, 
      symptoms: [], 
      predictions: [] 
    }, { status: 500 });
  }
}
