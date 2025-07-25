"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaClock, FaQuestion, FaChartLine } from "react-icons/fa";
import { Accordion, AccordionItem, Input, Spinner } from "@heroui/react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { Attendees, InterviewDetails } from "@/types/interview";
import { useInterview } from "@/hooks/useInterview";
import { useToast } from "@/hooks/useToast";

interface Props {
  interviewId: string;
}

const InterviewSetup = ({ interviewId }: Props) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const [interview, setInterview] = useState<InterviewDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Attendees[]>([]);
  const { addToastHandler } = useToast();
  const { registerCandidateForInterview } = useInterview();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return;

      try {
        setLoading(true);
        const docRef = doc(db, "interviews", interviewId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInterview(docSnap.data() as InterviewDetails);
          const attendeesRef = collection(
            db,
            "interviews",
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
        (attendee: Attendees) => attendee.email == email
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

    await registerCandidateForInterview(
      interviewId,
      fullName,
      contact,
      email,
      (res: any) => {
        router.push(`/interview-details/${interviewId}/ongoing/${res}`);
      }
    );
  };

  if (!interviewId)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">No interview data found</p>
      </div>
    );

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

  return (
    <>
      {interview && (
        <div className="max-w-2xl min-w-[50%] mx-auto p-6 space-y-6">
          <h1 className="text-3xl font-bold text-white">
            {interview?.profile} Interview
          </h1>

          <div className="w-full bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-800 rounded-xl p-3 shadow-lg border border-zinc-700">
            <div className="flex justify-around items-center text-gray-300 text-sm sm:text-base font-medium">
              {/* Duration */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Duration</span>
                <span>{interview?.duration} min</span>
              </div>

              <div className="w-[1px] h-8 bg-zinc-600 mx-2"></div>

              {/* Number of Questions */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Questions</span>
                <span>{interview?.noOfQuestions}</span>
              </div>

              <div className="w-[1px] h-8 bg-zinc-600 mx-2"></div>

              {/* Level */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Level</span>
                <span className="capitalize">{interview?.level}</span>
              </div>
            </div>
          </div>

          <Accordion variant="bordered">
            <AccordionItem
              key="1"
              aria-label="Job Description"
              title="Job Description"
              className="text-white border-white"
            >
              <p className="text-gray-300">
                {interview?.description || "No description provided"}
              </p>
            </AccordionItem>
          </Accordion>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Candidate Details</h2>
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

          <div className="space-y-1 bg-blue-300/10 rounded-lg border border-blue-500 p-3">
            <h2 className="text-[15px] font-semibold">Interview Guidelines</h2>
            <ul className="list-disc list-inside text-blue-500">
              <li className="text-sm">
                Ensure you have a stable internet connection.
              </li>
              <li className="text-sm">
                Use headphones for better audio clarity.
              </li>
              <li className="text-sm">
                Find a quiet and well-lit environment.
              </li>
            </ul>
          </div>

          <div className="w-full flex justify-center items-center mt-4">
            <button
              onClick={handleJoinInterview}
              disabled={!fullName || !email}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 mx-auto rounded shadow ${
                !fullName || !email ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Join Interview
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewSetup;
