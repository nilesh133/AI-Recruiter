// app/api/generateQuestions/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  const { PROMPT } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  // const prompt = `Generate ${10} difficulty-level interview questions on the following profile: ${description}. Only return the questions as a plain list.`;

  const body = JSON.stringify({ contents: [{ parts: [{ text: PROMPT }] }] });
  console.log("Sending body:", body);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );

  const data = await res.json();
  console.log("Data:", data);
  const lines = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const fullText = Array.isArray(lines) ? lines.join("\n") : lines;

  const cleaned = fullText
    .replace(/^```json\s*/, '')
    .replace(/^```\s*/, '')
    .replace(/```$/, '')
    .trim();

  let questions = [];
  try {
    questions = JSON.parse(cleaned);
  } catch (err) {
    console.error("Error parsing Gemini response:", err);
  }

  return NextResponse.json({ questions });

}