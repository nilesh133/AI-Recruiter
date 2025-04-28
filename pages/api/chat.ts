import { NextRequest, NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
});
const openai = new OpenAIApi(config);

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful and strict technical interviewer.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  const data = await response.json();
  const aiReply = data.choices[0].message.content;

  return NextResponse.json({ result: aiReply });
}
