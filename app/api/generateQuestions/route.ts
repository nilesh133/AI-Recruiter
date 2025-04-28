// app/api/generateQuestions/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    
  const { PROMPT } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  // const prompt = `Generate ${10} difficulty-level interview questions on the following profile: ${description}. Only return the questions as a plain list.`;
  

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: PROMPT }] }] }),
    }
  );

  const data = await res.json();
const lines = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

// Step 1: Join all lines
const fullText = Array.isArray(lines) ? lines.join("\n") : lines;

// Step 2: Strip the code block if it exists
const cleaned = fullText
  .replace(/^```json\s*/, '')  // Remove starting ```json (if present)
  .replace(/^```\s*/, '')      // Or plain ```
  .replace(/```$/, '')         // Remove trailing ```
  .trim();

let questions = [];
try {
  questions = JSON.parse(cleaned); // Parse the cleaned JSON
} catch (err) {
  console.error("Error parsing Gemini response:", err);
}

return NextResponse.json({ questions });

}