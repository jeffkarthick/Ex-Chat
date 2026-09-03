import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, exName, chatText } = body || {};

    if (!message || !message.trim()) {
      return Response.json({ error: "Message is empty" }, { status: 400 });
    }

    const apiKey = process.env.Gemini_API_Key_2 || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Gemini API key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatContext = chatText ? chatText.slice(0, 6000) : "No chat history available.";

    const prompt = `
You are roleplaying as ${exName || "the ex-partner"} in a fictional chat simulation.
Use the following previous WhatsApp conversation to understand the person's texting personality.

CHAT HISTORY:
${chatContext}

RULES:
- Reply as ${exName || "the person"}.
- Match their texting style and language (use Tanglish if they use it).
- Keep replies short (1-3 sentences).
- Sound natural and casual. Do not say you are an AI.
- Return ONLY the chat reply.

USER:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text()?.trim();

    if (!reply) {
      return Response.json({ error: "Gemini returned an empty response" }, { status: 502 });
    }

    return Response.json({ reply, message: reply }, { status: 200 });

  } catch (error) {
    console.error("FULL GEMINI ERROR:", error);
    return Response.json({ error: error?.message || "Gemini request failed", reply: "" }, { status: 500 });
  }
}
