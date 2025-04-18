import { google } from "@ai-sdk/google";
import { generateText, type CoreMessage } from "ai";

interface Message {
  role: "user" | "assistant";
  content: string;
}
const model = google("gemini-1.5-flash");

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await generateText({
    model: model,
    messages,
  });
  console.log("Gemini response:", JSON.stringify(result.text, null, 2));

  return new Response(JSON.stringify({ text: result.text }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
