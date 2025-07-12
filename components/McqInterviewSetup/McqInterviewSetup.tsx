"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import {
  FaClock,
  FaQuestion,
  FaChartLine,
  FaCalendarTimes,
} from "react-icons/fa";
import { Button, Input, Spinner } from "@heroui/react";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { Attendees, McqInterviewDetails } from "@/types/interview";
import { useInterview } from "@/hooks/useInterview";
import { useToast } from "@/hooks/useToast";

interface Props {
  interviewId: string;
}

const McqInterviewSetup = ({ interviewId }: Props) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const [interview, setInterview] = useState<McqInterviewDetails | null>(null);
  const [attendees, setAttendees] = useState<Attendees[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registerCandidateForMcqInterview } = useInterview();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");

  const { addToastHandler } = useToast();

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return;

      try {
        setLoading(true);
        const docRef = doc(db, "mcqInterviews", interviewId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInterview(docSnap.data() as McqInterviewDetails);
          const attendeesRef = collection(
            db,
            "mcqInterviews",
            interviewId,
            "attendees"
          );
          const attendeesSnap = await getDocs(attendeesRef);
          setAttendees(
            attendeesSnap.docs.map((doc) => doc.data() as Attendees)
          );
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

  const handleJoinInterview = async () => {
    let isAlreadyRegistered = false;
    if (attendees) {
      isAlreadyRegistered = attendees.some(
        (attendee: Attendees) => attendee.email === email
      );
    }
    if (isAlreadyRegistered) {
      addToastHandler({
        title: "You have attempted to join this interview before",
        description: "Only one attempt is allowed",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
      return;
    }
    await registerCandidateForMcqInterview(
      interviewId,
      fullName,
      contact,
      email,
      (res: any) => {
        router.push(`/mcq-interview-details/${interviewId}/ongoing/${res}`);
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  if (!interviewId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">No interview data found</p>
      </div>
    );
  }

  if (
    interview?.start_date &&
    interview?.start_time &&
    interview?.expiry_date &&
    interview?.expiry_time
  ) {
    const startDate = new Date(interview?.start_date);
    const [startHours, startMinutes] = interview?.start_time
      .split(":")
      .map(Number);
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const expiryDate = new Date(interview?.expiry_date);
    const [expiryHours, expiryMinutes] = interview?.expiry_time
      .split(":")
      .map(Number);
    const expiryDateTime = new Date(expiryDate);
    expiryDateTime.setHours(expiryHours, expiryMinutes, 0, 0);

    const currentDate = new Date();

    if (currentDate < startDateTime) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center shadow-lg max-w-md mx-auto">
            <FaClock className="text-blue-500 text-4xl mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-semibold text-white mb-2">
              Interview Not Started
            </h2>
            <p className="text-zinc-400">
              This interview is scheduled to start on{" "}
              <span className="text-white font-medium">
                {startDate.toLocaleDateString()} at {interview?.start_time}
              </span>
              . Please check back later.
            </p>
          </div>
        </div>
      );
    }

    if (currentDate > expiryDateTime) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center shadow-lg max-w-md mx-auto">
            <FaCalendarTimes className="text-red-500 text-4xl mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-semibold text-white mb-2">
              Interview Expired
            </h2>
            <p className="text-zinc-400">
              This interview expired on{" "}
              <span className="text-white font-medium">
                {expiryDate.toLocaleDateString()} at {interview?.expiry_time}
              </span>
              . Please contact support if you think this is a mistake.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      {interview && (
        <div className="max-w-2xl min-w-[50%] mx-auto p-6 space-y-8">
          {/* Interview Header */}
          <div className="bg-zinc-900 text-white rounded-xl shadow border border-zinc-700 p-6 space-y-3 w-full max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {interview?.profile} Interview
            </h1>
            {/* <p className="text-zinc-400 text-sm sm:text-base">
              You're about to begin an MCQ-based round. Read the instructions,
              fill in your details, and get started!
            </p> */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-6 text-sm sm:text-base text-gray-300 mt-4">
              <div className="bg-zinc-800/70 rounded-lg px-4 py-2 w-full text-center">
                <p className="font-medium text-white">Duration</p>
                <p className="text-indigo-400 font-semibold">
                  {interview?.duration} Minutes
                </p>
              </div>
              <div className="bg-zinc-800/70 rounded-lg px-4 py-2 w-full text-center">
                <p className="font-medium text-white">Questions</p>
                <p className="text-green-400 font-semibold">
                  {interview?.noOfQuestions}
                </p>
              </div>
              <div className="bg-zinc-800/70 rounded-lg px-4 py-2 w-full text-center">
                <p className="font-medium text-white">Level</p>
                <p className="text-yellow-400 font-semibold capitalize">
                  {interview?.level}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-zinc-800 border border-blue-600 p-5 rounded-lg space-y-3">
            <h2 className="text-lg font-semibold text-blue-400">
              📘 MCQ Interview Instructions
            </h2>
            <ul className="list-disc list-inside text-sm text-blue-300 space-y-1">
              <li>Each question has one correct answer.</li>
              <li>All answers are final once submitted.</li>
              <li>Avoid refreshing or closing the tab during the test.</li>
              <li>Ensure your contact information is accurate.</li>
            </ul>
          </div>

          {/* Candidate Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              👤 Candidate Details
            </h2>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              isRequired
            />
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              isRequired
            />
            <Input
              type="tel"
              label="Contact No"
              placeholder="Enter your contact number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              fullWidth
            />
          </div>

          {/* Join Button */}
          <div className="w-full flex justify-center items-center mt-6">
            <Button
              onPress={handleJoinInterview}
              disabled={!fullName || !email}
              color="primary"
              isLoading={loading}
            >
              Start MCQ Interview
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default McqInterviewSetup;
