"use client";

import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { McqInterviewDetails, MCQQuestion } from "@/types/interview";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import { useInterview } from "@/hooks/useInterview";
import { FaCheckCircle, FaClock } from "react-icons/fa";

const OngoingMcqInterviewPage = ({
  interviewId,
  user_id,
}: {
  interviewId: string;
  user_id: string;
}) => {
  const { user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { submitMcqInterview } = useInterview();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>([]);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answersData, setAnswersData] = useState<any[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [interviewDuration, setInterviewDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = selectedOptions.filter((idx) => idx !== null).length;
  const remainingCount = totalQuestions - answeredCount;
  const getSelected = selectedOptions[currentQuestionIndex];

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return;

      try {
        setLoading(true);
        const docRef = doc(db, "mcqInterviews", interviewId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as McqInterviewDetails;
          setQuestions(data.questions);
          setSelectedOptions(Array(data.questions.length).fill(null));
          let durationSec = 1800;
          if (data.duration && !isNaN(Number(data.duration))) {
            durationSec = Math.max(1, Number(data.duration)) * 60;
          }
          setInterviewDuration(durationSec);
          setTimeLeft(durationSec);
        } else {
          setError("Interview not found.");
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError("Failed to load interview.");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [interviewId]);

  useEffect(() => {
    const checkAttendee = async () => {
      if (!interviewId || !user_id) return;
      try {
        const attendeeRef = doc(db, `mcqInterviews/${interviewId}/attendees/${user_id}`);
        const attendeeSnap = await getDoc(attendeeRef);
        if (attendeeSnap.exists()) {
          const attendeeData = attendeeSnap.data();
          if (attendeeData.hasAttempted) {
            setHasAttempted(true);
            return;
          }
        }
        setHasAttempted(false);
      } catch (err) {
        setHasAttempted(false);
      }
    };
    checkAttendee();
  }, [interviewId, user_id]);

  useEffect(() => {
    if (loading || isSubmitted || timeLeft === null) return;
    if (timeLeft <= 0) {
      setTimeLeft(0);
      handleFinish();
      return;
    }
    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, loading, isSubmitted]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleOptionClick = (optionIndex: number) => {
    const answeredAt = new Date().toISOString();
    const questionId = currentQuestion.id ?? `q${currentQuestionIndex + 1}`;
    const selectedOption = currentQuestion.options[optionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;

    setSelectedOptions((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = optionIndex;
      return updated;
    });

    setAnswersData((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = {
        questionId,
        selectedOption,
        isCorrect,
        answeredAt,
      };
      return updated;
    });
  };

  const calculateScore = () => {
    const correctAnswers = answersData.filter((ans) => ans?.isCorrect).length;
    return correctAnswers;
  };

  const handleFinish = async () => {
    setLoading(true);
    const submittedAt = new Date().toISOString();
    const score = calculateScore();

    try {
      const attendeeRef = doc(db, `mcqInterviews/${interviewId}/attendees/${user_id}`);
      await setDoc(attendeeRef, { hasAttempted: true }, { merge: true });
      await submitMcqInterview(
        interviewId,
        user_id,
        answersData,
        totalQuestions,
        score,
        (res) => {
          setIsSubmitted(true);
          setTimeout(() => {
            router.push(`/mcq-interview-details/${interviewId}`);
          }, 3000);
        }
      );
    } catch (error) {
      console.error("Error submitting interview:", error);
      setError("Failed to submit interview.");
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (hasAttempted === true) {
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

  if (isSubmitted) {
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <div className="bg-green-900/20 border border-green-600 rounded-xl p-6 md:p-8 text-center shadow-lg max-w-md w-full mx-auto animate-fade-in">
          <FaCheckCircle className="text-green-400 text-4xl md:text-5xl mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
            Interview Submitted
          </h2>
          <p className="text-green-300 text-sm md:text-base">
            Thank you! Your interview has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center px-4">
        <p className="text-red-500 text-lg text-center max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center px-4 py-6 md:py-8">
      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 md:px-5 md:py-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm md:text-[15px] text-zinc-300 font-medium">
            <span className="text-white font-semibold">
              Question {currentQuestionIndex + 1}
            </span>
            <span className="text-zinc-400">/ {totalQuestions}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <div className="flex items-center gap-1 bg-blue-700/20 text-blue-400 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-[13px] font-semibold">
              <FaClock className="text-xs" />
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-1 bg-green-700/20 text-green-400 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-[13px] font-semibold">
              ✅ {answeredCount} Answered
            </div>
            <div className="flex items-center gap-1 bg-yellow-700/20 text-yellow-400 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-[13px] font-semibold">
              ⏳ {remainingCount} Remaining
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-center mb-6 px-2">
            {currentQuestion.question}
          </h1>

          {/* Options */}
          <div className="w-full max-w-xl flex flex-col gap-3 md:gap-4">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = getSelected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className={`w-full text-left px-4 py-3 md:px-5 md:py-3 rounded-lg font-medium border transition-all duration-200 text-sm md:text-base
                  ${
                    isSelected
                      ? "bg-green-600/90 border-green-700 text-white"
                      : "bg-zinc-800/80 border-zinc-600 text-zinc-200 hover:bg-zinc-700/80"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="w-full max-w-xl flex justify-between mt-6 md:mt-8 gap-4">
            <Button
              onPress={goToPrevious}
              isDisabled={currentQuestionIndex === 0}
              className="flex-1 sm:flex-none px-4 py-2"
              color="default"
            >
              Back
            </Button>

            <Button
              onPress={goToNext}
              isDisabled={
                currentQuestionIndex === totalQuestions - 1 &&
                selectedOptions.filter((opt) => opt !== null).length === 0
              }
              isLoading={loading}
              className="flex-1 sm:flex-none px-4 py-2"
              color="primary"
            >
              {currentQuestionIndex === totalQuestions - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OngoingMcqInterviewPage;