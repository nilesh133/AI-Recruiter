import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { PROMPT } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: PROMPT }] }] }),
    }
  );

  const data = await res.json();

  const cleaned = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const reportText = cleaned
  .replace(/^```json\s*|^```\s*/g, '')
  .replace(/```$/g, '')
  .trim();
  console.log("Report Text:", reportText);

  return NextResponse.json({ reportText });
}