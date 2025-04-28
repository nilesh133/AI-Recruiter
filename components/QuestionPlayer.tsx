"use client";
import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

const agent = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate’s questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.

- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

type Props = {
  questions: string[];
};

const QuestionPlayer = ({ questions }: Props) => {
  const vapiRef = useRef<Vapi | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [interviewEnded, setInterviewEnded] = useState(false);

  useEffect(() => {
    const formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    vapiRef.current = vapi;

    // Start the interview
    vapi.start(agent, {
      variableValues: {
        questions: formattedQuestions,
      },
    });

    // Listen for transcript updates
    vapi.on("message", (data) => {
     console.log("Transcript:", data);
    });

    return () => {
      vapi.stop();
    };
  }, [questions]);

  const handleEndInterview = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      setInterviewEnded(true);

      // Print or send transcript data
      console.log("Full Transcript:", transcript);
    }
  };

  return (
    <div className="p-4">
      <p className="text-xl mb-4">Interview in Progress...</p>

      {!interviewEnded && (
        <button
          onClick={handleEndInterview}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          End Call
        </button>
      )}

      {interviewEnded && (
        <div className="mt-4">
          <p className="text-green-600 font-semibold">Interview Ended.</p>
          <h3 className="mt-2 font-bold">Transcript:</h3>
          <ul className="list-disc pl-6 text-sm text-gray-700">
            {transcript.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuestionPlayer;
