// app/page.tsx (Interview Setup Page)
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaClock, FaQuestion, FaChartLine, FaBuilding } from "react-icons/fa";
import { Accordion, AccordionItem, Input, Spinner } from "@heroui/react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Your Firebase configuration
import { useAuthContext } from "@/context/AuthContext";
import { InterviewDetails, Question } from "@/types/user";

interface InterviewPageProps {
    params: { id: string };
  }

const InterviewSetup = ({ params }: InterviewPageProps) => {
  const router = useRouter();
  const interviewId = params.id;
  const { user } = useAuthContext();
  
  const [interview, setInterview] = useState<InterviewDetails | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    const fetchInterview = async () => {
        console.log(interviewId, user?.uid);
      if (!interviewId || !user?.uid) return;

      try {
        setLoading(true);
        const colRef = collection(db, `users/${user.uid}/interviews`);
        const querySnapshot = await getDocs(colRef);
        
        querySnapshot.forEach((doc) => {
          console.log(doc.id, " => ", doc.data());
        });
        const docRef = doc(db, `users/${user.uid}/interviews/${interviewId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInterview(docSnap.data() as InterviewDetails);
          // setQuestions(docSnap.data().questions as Question[]);
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

  const handleJoinInterview = () => {
    if (!interviewId) return;
    
    // Store candidate details in session storage or pass as query params
    // const candidateDetails = { fullName, email, contact };
    // sessionStorage.setItem("candidateDetails", JSON.stringify(candidateDetails));

    const query = new URLSearchParams({
      fullName,
      email,
      contact,
    }).toString();
  
    router.push(`/interview-details/${interviewId}/ongoing?${query}`);
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

  if (!interview) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">No interview data found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">{interview.profile} Interview</h1>

      <div className="grid grid-cols-3 gap-4 text-gray-700">
        <div className="flex items-center gap-2">
          <FaClock className="text-white" />
          <span className="text-gray-400">{interview.duration} Minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <FaQuestion className="text-green-500" />
          <span className="text-gray-400">{interview.noOfQuestions} Questions</span>
        </div>
        <div className="flex items-center gap-2">
          <FaChartLine className="text-yellow-500" />
          <span className="text-gray-400 capitalize">{interview.level}</span>
        </div>
        {/* <div className="flex items-center gap-2">
          <FaBuilding className="text-purple-500" />
          <span className="text-gray-400">{interview.company || "Company"}</span>
        </div> */}
      </div>

      <Accordion variant="bordered">
        <AccordionItem key="1" aria-label="Job Description" title="Job Description">
          <p className="text-gray-300">
            {interview.description || "No description provided"}
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
          <li className="text-sm">Ensure you have a stable internet connection.</li>
          <li className="text-sm">Use headphones for better audio clarity.</li>
          <li className="text-sm">Find a quiet and well-lit environment.</li>
        </ul>
      </div>
      <div className="w-full flex justify-center items-center mt-4">
      <button
        onClick={handleJoinInterview}
        disabled={!fullName || !email}
        className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 mx-auto rounded shadow ${
          (!fullName || !email) ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Join Interview
      </button>

      </div>
    </div>
  );
};

export default InterviewSetup;