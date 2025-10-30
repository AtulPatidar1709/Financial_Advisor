// netlify/functions/getAdvice.js
const FINANCIAL_ADVISOR_RULES = process.env.FINANCIAL_ADVISOR_RULES;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const payload = JSON.parse(event.body);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: FINANCIAL_ADVISOR_RULES },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenRouter API error");
    }

    const advice =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "No advice returned";

    return {
      statusCode: 200,
      body: JSON.stringify({ advice }),
    };
  } catch (error) {
    console.error("Error in getAdvice function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
