import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { dataSummary } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return Response.json({ 
        insights: [
          "Please configure your GEMINI_API_KEY in the .env file to see real AI insights.",
          "Data shows peak influenza risk in Winter months.",
          "Allergy patterns are emerging in the current data stream."
        ] 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a clinical data scientist analyzing clinic visit data.
      Here is a summary of recent symptom trends at our clinic:
      ${dataSummary}

      Based on this data, provide 4 concise, high-impact clinical insights for doctors.
      Focus on seasonality, potential outbreaks, and stock recommendations for medicines.
      Return exactly 4 bullet points.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the text into an array of strings
    const insights = text.split('\n').filter(line => line.trim().length > 0).slice(0, 4);

    return Response.json({ insights });
  } catch (error) {
    console.error("AI Insight Error:", error);
    return Response.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
