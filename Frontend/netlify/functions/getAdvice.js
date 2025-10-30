const FINANCIAL_ADVISOR_RULES = process.env.FINANCIAL_ADVISOR_RULES;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

<<<<<<< HEAD
console.log("FINANCIAL_ADVISOR_RULES ", FINANCIAL_ADVISOR_RULES);
console.log("OPENAI_API_KEY ", OPENAI_API_KEY);

export async function handler(event, context) {
=======
export default async function handler(event, context) {
>>>>>>> f608752d1b59d3d2249dc738024c9ae4e0e7b690
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("✅ Function started");

    if (!OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY in environment." }),
      };
    }

    const payload = JSON.parse(event.body);
    console.log("📦 Payload:", payload);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: FINANCIAL_ADVISOR_RULES || "You are a financial advisor bot." },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });

    console.log("📡 OpenRouter Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ OpenRouter API Error:", text);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "AI API Error", details: text }),
      };
    }

    const data = await response.json();
    console.log("✅ OpenRouter Response JSON:", data);

    const advice =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "⚠ No valid AI response.";

    return {
      statusCode: 200,
      body: JSON.stringify({ advice }),
    };
  } catch (error) {
    console.error("💥 Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
