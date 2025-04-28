"use client";

import { FaClock } from "react-icons/fa";
import { Card, CardHeader, CardBody, Avatar, Button } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { InterviewDetails, Question } from "@/types/user";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import Vapi from "@vapi-ai/web";
import { useInterview } from "@/hooks/useInterview";

interface InterviewPageProps {
  params: { id: string };
}

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
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Follow the structured flow. Engage naturally. Keep answers short and polite.`,
      },
    ],
  },
};

export default function Ongoing({ params }: InterviewPageProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { generateFeedBack } = useInterview();
  const vapiRef = useRef<Vapi | null>(null);

  const interviewId = params.id;
  const searchParams = useSearchParams();
  const fullName = searchParams.get("fullName");
  const email = searchParams.get("email");
  const contact = searchParams.get("contact");

  const [time, setTime] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState<{
    role: "Interviewer" | "Candidate";
    content: string;
  } | null>(null);
  const [finalConversation, setFinalConversation] = useState<any[]>([]);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<
    "Interviewer" | "Candidate" | null
  >(null);

  useEffect(() => {
    const timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId || !user?.uid) return;
      try {
        setLoading(true);
        const docRef = doc(db, `users/${user.uid}/interviews/${interviewId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setQuestions(docSnap.data().questions as Question[]);
        } else {
          setError("Interview not found");
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError("Failed to load interview");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, user?.uid]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    if (!questions.length) return;

    const formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    vapiRef.current = vapi;

    vapi.start(agent, {
      variableValues: {
        questions: formattedQuestions,
      },
    });

    vapi.on("message", (message) => {
      if (message && message.conversation) {
        setFinalConversation(message.conversation);

        const lastMessage =
          message.conversation[message.conversation.length - 1];
        if (lastMessage) {
          if (lastMessage.role === "assistant") {
            setCurrentLine({
              role: "Interviewer",
              content: lastMessage.content,
            });
            setActiveSpeaker("Interviewer");
          } else if (lastMessage.role === "user") {
            setCurrentLine({ role: "Candidate", content: lastMessage.content });
            setActiveSpeaker("Candidate");
          }
        }
      }
    });

    return () => {
      vapi.stop();
    };
  }, [questions]);

  const handleGenerateReport = async (data: any) => {
    debugger;
    try {
      await generateFeedBack(
        data,
        interviewId,
        user?.uid,
        fullName,
        contact,
        email,
        (res) => {
          console.log("Feedback Generated Successfully", res);
        }
      );
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const handleEndInterview = async () => {
    setGenerating(true);
    if (vapiRef.current) {
      vapiRef.current.stop();
      setInterviewEnded(true);

      const PROMPT = `Based on the following interview conversation: ${JSON.stringify(
        finalConversation
      )},
generate a detailed JSON report with the following structure only (DO NOT add any extra text outside JSON):

{
  "overall_feedback": "A short paragraph summarizing the candidate's overall performance.",
  "overall_score": A number between 1 to 10 representing overall performance,
  "should_hire_or_not": "Yes" or "No" based on the performance,
  "question_score": [
    {
      question: "",
      user_answer: "",
      "score": A number between 1 to 10,  
    }
  ]
  "skills_score": {
      "problem_solving": {
        "score": A number between 1 to 10,
        "feedback": "Feedback on problem solving skills"
      },
      "communication": {
        "score": A number between 1 to 10,
        "feedback": "Feedback on communication skills"
      },
      "technical_knowledge": {
        "score": A number between 1 to 10,
        "feedback": "Feedback on technical knowledge"
    },
      "confidence_level": {
        "score": A number between 1 to 10,
        "feedback": "Feedback on the candidate's confidence during the interview"
      }
    }
}

Make sure the response is valid JSON only, without any explanations.`;

      try {
        const res = await fetch("/api/generateFeedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ PROMPT }),
        });
        const data = await res.json();
        handleGenerateReport(data.reportText); // Pass the generated report
      } catch (error) {
      } finally {
        setGenerating(false);
      }
    }
  };

  if (interviewEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white flex flex-col justify-center items-center p-6">
        <div className="bg-zinc-800/50 p-10 rounded-2xl shadow-2xl text-center animate-fadeIn">
          <h1 className="text-4xl font-extrabold mb-6 text-indigo-400 animate-pulse">
            Interview Completed 🎉
          </h1>
          <p className="text-lg mb-4 text-gray-300">
            Thank you for participating in the interview process!
          </p>
          {generating ? (
            <p className="text-md text-gray-400 animate-pulse">
              Your feedback is being generated. Do not close the window.
            </p>
          ) : (
            <p className="text-md text-gray-400">
              Your feedback is generated. Someone will get back to you soon.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col justify-center gap-8 p-6">
      {/* Timer */}
      {/* <div className="text-center text-xl font-bold mb-6 absolute top-8 right-8 flex gap-2 items-center">
        <span><FaClock /></span>
        <span>{formatTime(time)}</span>
      </div> */}

      {/* Cards */}
      <div className="flex justify-center gap-10 flex-wrap items-center">
        {/* Interviewer Card */}
        <Card
          className={`w-[40%] h-80 ${
            activeSpeaker === "Interviewer" ? "bg-indigo-500" : "bg-zinc-800"
          } flex flex-col justify-center items-center`}
        >
          <CardHeader className="text-center text-xl font-semibold text-white">
            Interviewer
          </CardHeader>
          <CardBody className="flex flex-col items-center justify-center gap-4">
            <Avatar
              src="https://i.pravatar.cc/150?img=1"
              size="lg"
              radius="full"
              className="w-20 h-20"
            />
            <p className="text-lg font-medium text-gray-300">AI Interviewer</p>
          </CardBody>
        </Card>

        {/* Candidate Card */}
        <Card
          className={`w-[40%] h-80 ${
            activeSpeaker === "Candidate" ? "bg-indigo-500" : "bg-zinc-800"
          } flex flex-col justify-center items-center`}
        >
          <CardHeader className="text-center text-xl font-semibold text-white">
            You
          </CardHeader>
          <CardBody className="flex flex-col items-center justify-center gap-4">
            <Avatar
              src="https://i.pravatar.cc/150?img=3"
              size="lg"
              radius="full"
              className="w-20 h-20"
            />
            <p className="text-lg font-medium text-gray-300">
              {fullName ?? "Candidate"}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* End Call Button */}
      <div className="flex justify-center mt-6">
        <Button color="danger" size="lg" onPress={handleEndInterview}>
          End Call
        </Button>
      </div>

      {/* Single Line Display */}
      <div className="mt-6 max-w-4xl mx-auto bg-zinc-800 p-2 rounded-lg text-center text-2xl font-semibold flex items-center justify-center">
        {currentLine ? (
          <div className="flex">
            <p className="text-gray-400 text-[16px] mb-2 text-indigo-500">
              {currentLine.role}:{" "}
            </p>
            <p className="text-[16px]">{currentLine.content}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Waiting for conversation...</p>
        )}
      </div>
    </div>
  );
}
