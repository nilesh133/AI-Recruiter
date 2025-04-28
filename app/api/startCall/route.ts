// app/api/startCall/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { questions } = await req.json();

  const agent = {
    name: "Interviewer",
    firstMessage: "Hello! Thank you for taking the time to speak with me today.",
    transcriber: {
      provider: "deepgram",
      model: "base",
      language: "en",
    },
    voice: {
      provider: "playht",
      voiceId: "s3://mockingbird/ryan",
    },
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a job interviewer. Use this structure:\n\n{{questions}}\n\nBe natural, polite, and concise.`,
        },
      ],
    },
  };

  const formattedQuestions = questions.map((q: string) => `- ${q}`).join("\n");

  const res = await fetch("https://api.vapi.ai/call/web", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
    },
    body: JSON.stringify({
      agent,
      variableValues: { questions: formattedQuestions },
    }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
