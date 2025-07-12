"use client";

import { FaClock } from "react-icons/fa";
import { Card, CardHeader, CardBody, Avatar, Button, Spinner } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { InterviewDetails, Question } from "@/types/interview";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import Vapi from "@vapi-ai/web";
import { useInterview } from "@/hooks/useInterview";
import { useToast } from "@/hooks/useToast";

const agent: any = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram" as const,
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs" as const,
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai" as const,
    model: "gpt-4",
    messages: [
      {
        role: "system" as const,
        content: "You are a professional job interviewer conducting a real-time voice interview with a candidate. Follow the structured flow. Engage naturally. Keep answers short and polite.",
      },
    ],
  },
};

export default function OngoingInterviewPage({ interviewId, userid }: { interviewId: string, userid: string }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { generateFeedBack } = useInterview();
  const vapiRef = useRef<Vapi | null>(null);
  const params = useParams();
  const { addToastHandler } = useToast();

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
  const [fullName, setFullName] = useState<string>("");
  const [interviewDuration, setInterviewDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return;
      try {
        setLoading(true);
        const docRef = doc(db, `/interviews/${interviewId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as InterviewDetails;
          setQuestions(data.questions as Question[]);
          let durationSec = 1800;
          if (data.duration && !isNaN(Number(data.duration))) {
            durationSec = Math.max(1, Number(data.duration)) * 60;
          }
          setInterviewDuration(durationSec);
          setTimeLeft(durationSec);
          
          const attendeeRef = doc(db, `/interviews/${interviewId}/attendees/${userid}`);
          const attendeeSnap = await getDoc(attendeeRef);
          if (attendeeSnap.exists()) {
            setFullName(attendeeSnap.data().fullName);
            if (attendeeSnap.data().hasAttempted) {
              setHasAttempted(true);
              return;
            }
          }
          setHasAttempted(false);
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
  }, [interviewId, user?.uid, userid]);

  useEffect(() => {
    if (loading || interviewEnded || timeLeft === null || hasAttempted) return;
    if (timeLeft <= 0) {
      setTimeLeft(0);
      handleEndInterview();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, loading, interviewEnded, hasAttempted]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!questions.length || hasAttempted) return;

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

    vapi.on("error", (error) => {
      console.log("Error while generating interview", error);
      addToastHandler({
        title: "Error while generating interview. Redirecting to interview details.",
        description: "",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
      router.push(`/interview-details/${interviewId}`);
    });

    return () => {
      vapi.stop();
    };
  }, [questions]);

  const handleGenerateReport = async (data: any) => {
    try {
      await generateFeedBack(
        data,
        interviewId,
        userid,
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

      const attendeeRef = doc(db, `/interviews/${interviewId}/attendees/${userid}`);
      await setDoc(attendeeRef, { hasAttempted: true }, { merge: true });

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
        handleGenerateReport(data.reportText);
      } catch (error) {
        addToastHandler({
          title: "Error while saving interview. Please try again.",
          description: "",
          color: "error",
          timeout: 3000,
          variant: "error",
          shouldShowTimeoutProgress: true,
        });
      } finally {
        setGenerating(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (hasAttempted === true) {
    vapiRef.current?.stop();
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <div className="bg-red-900/20 border border-red-600 rounded-xl p-6 md:p-8 text-center shadow-lg max-w-md w-full mx-auto animate-fade-in">
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
            Interview Already Attempted
          </h2>
          <p className="text-red-300 text-sm md:text-base">
            You have already attempted this interview. Only one attempt is allowed.
          </p>
        </div>
      </div>
    );
  }

  if (interviewEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white flex flex-col justify-center items-center p-4">
        <div className="bg-zinc-800/50 p-6 md:p-10 rounded-2xl shadow-2xl text-center animate-fadeIn max-w-md w-full mx-4">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-4 md:mb-6 text-indigo-400 animate-pulse">
            Interview Completed 🎉
          </h1>
          <p className="text-base md:text-lg mb-4 text-gray-300">
            Thank you for participating in the interview process!
          </p>
          {generating ? (
            <p className="text-sm md:text-md text-red-400 animate-pulse">
              Your feedback is being generated. Do not close the window.
            </p>
          ) : (
            <p className="text-sm md:text-md text-gray-400">
              Your feedback is generated. Someone will get back to you soon.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col p-4 md:p-6 relative">
      {/* Fixed Timer in Top Right */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 bg-zinc-800/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 z-50 border border-zinc-700 shadow-lg">
        <FaClock className="text-indigo-400 text-lg" />
        <span className="font-medium text-white text-sm md:text-base">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center mt-12 md:mt-0">
        {/* Cards Container */}
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-10 items-center mb-6 md:mb-10">
          {/* Interviewer Card */}
          <Card
            className={`w-full md:w-[45%] max-w-md h-64 md:h-80 ${
              activeSpeaker === "Interviewer" ? "bg-indigo-500" : "bg-zinc-800"
            } transition-colors duration-300`}
          >
            <CardHeader className="text-center text-lg md:text-xl font-semibold">
              Interviewer
            </CardHeader>
            <CardBody className="flex flex-col items-center justify-center gap-3 md:gap-4">
              <Avatar
                src=""
                size="lg"
                radius="full"
                className="w-16 h-16 md:w-20 md:h-20"
              />
              <p className="text-base md:text-lg font-medium text-gray-300">AI Interviewer</p>
            </CardBody>
          </Card>

          {/* Candidate Card */}
          <Card
            className={`w-full md:w-[45%] max-w-md h-64 md:h-80 ${
              activeSpeaker === "Candidate" ? "bg-indigo-500" : "bg-zinc-800"
            } transition-colors duration-300`}
          >
            <CardHeader className="text-center text-lg md:text-xl font-semibold">
              You
            </CardHeader>
            <CardBody className="flex flex-col items-center justify-center gap-3 md:gap-4">
              <Avatar
                src=""
                size="lg"
                radius="full"
                className="w-16 h-16 md:w-20 md:h-20"
              />
              <p className="text-base md:text-lg font-medium text-gray-300">
                {fullName}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Conversation Display */}
        <div className="w-full max-w-4xl mx-auto bg-zinc-800 p-4 rounded-lg mb-6 md:mb-10 min-h-20">
          {currentLine ? (
            <div className="flex flex-col md:flex-row gap-1 md:gap-2 items-start md:items-center">
              <p className="text-indigo-400 text-sm md:text-base font-medium">
                {currentLine.role}:
              </p>
              <p className="text-white text-sm md:text-base">{currentLine.content}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center">Waiting for conversation to start...</p>
          )}
        </div>

        {/* End Call Button */}
        <div className="flex justify-center pb-6 md:pb-0">
          <Button 
            color="danger" 
            size="lg" 
            onPress={handleEndInterview}
            className="w-full md:w-auto px-8 py-3 text-sm md:text-base"
            isDisabled={generating}
          >
            {generating ? <Spinner size="sm" /> : "End Call"}
          </Button>
        </div>
      </div>
    </div>
  );
}