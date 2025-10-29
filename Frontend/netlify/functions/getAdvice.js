// netlify/functions/getAdvice.js

const FINANCIAL_ADVISOR_RULES = process.env.FINANCIAL_ADVISOR_RULES;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log("ENV CHECK", !!OPENAI_API_KEY, !!FINANCIAL_ADVISOR_RULES);

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
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
        model: "openai/gpt-oss-20b:free",
        messages: [
          { role: "system", content: FINANCIAL_ADVISOR_RULES },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });

    const data = await response.json();
    const advice =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "";

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
