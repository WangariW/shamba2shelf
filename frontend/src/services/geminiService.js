export async function askGemini(message, userRole) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const MODELS = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash"
  ];

  const roleInstruction =
    userRole === "farmer"
      ? `You are assisting a COFFEE FARMER on Shamba2Shelf.
- Give practical, actionable guidance about coffee farming, drying, processing, pests, fermentation, pricing strategies, and yield improvement.
- ALWAYS answer directly. Provide steps and clear details.
- NEVER say phrases like: "I will connect you", "I will transfer you", "Let me check that", "I'm a chatbot", "Contact support".
- Keep your tone practical, helpful, and farm-focused.`
      : `You are assisting a COFFEE BUYER on Shamba2Shelf.
- Give **clear product recommendations** based on flavor notes, processing (washed vs natural), roast levels, origins, and brew methods.
- ALWAYS answer directly. NO vague responses, NO call-center phrases.
- For questions like "Should I buy washed or natural beans?", COMPARE options and then give a specific recommendation.
- NEVER say: "I'll connect you soon", "Let me check", "I'll transfer you", "contact support".
- Keep your tone friendly, expert, and coffee-product focused.`;

  async function callModel(modelName) {
    const url =
      "https://generativelanguage.googleapis.com/v1/" +
      modelName +
      ":generateContent?key=" + apiKey;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  `You are the Shamba2Shelf AI Assistant.\n${roleInstruction}\n\nNow answer the user's question clearly and helpfully.`
              }
            ]
          },
          {
            role: "user",
            parts: [{ text: message }]
          }
        ]
      })
    });

    const data = await response.json();
    console.log(`GEMINI (${modelName}) RAW RESPONSE:`, data);

    if (data.error?.status === "UNAVAILABLE") {
      throw new Error("Model Overloaded");
    }

    if (data.error) {
      throw new Error(data.error.message || "Gemini Error");
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI.";

    return reply;
  }

  for (const model of MODELS) {
    try {
      return await callModel(model);
    } catch (err) {
      console.warn(`Model failed: ${model}. Reason: ${err.message}`);
    }
  }

  return "The AI service is temporarily busy. Please try again.";
}
