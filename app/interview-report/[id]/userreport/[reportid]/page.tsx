"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { Attendees } from "@/types/interview";
import { InterviewDetails } from "@/types/user";
import {
  Card,
  CardHeader,
  CardBody,
  Accordion,
  AccordionItem,
  Progress,
  Avatar,
  Spinner,
} from "@heroui/react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { Accordion, AccordionItem } from "@heroui/react";


export default function UserInterviewReport() {
  const router = useRouter();
  const params = useParams()
  const interviewId = params?.id as string;
  const reportId = params?.reportid as string;

  const { user: userData } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReport, setUserReport] = useState<any>(null);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId || !userData?.uid || !reportId) return;

      try {
        setLoading(true);
        debugger;
        const docRef = doc(
          db,
          `/interviews/${interviewId}/attendees/${reportId}`
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const parsedObject = JSON.parse(docSnap.data().data);
          setUserReport({ ...parsedObject, ...docSnap?.data() });
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
  }, [interviewId, userData?.uid, reportId]);

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
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6 space-y-10 text-white bg-zinc-900 min-w-[70%]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar
              src={""}
              size="lg"
              radius="full"
            />
            <h1 className="text-3xl font-bold text-white">
              {userReport?.fullName}
            </h1>
          </div>
          <span className="text-2xl font-bold text-blue-400">
            Score: {userReport?.overall_score}/10
          </span>
        </div>
        <Card className="bg-zinc-800 text-white">
          <CardHeader className="text-xl font-semibold border-b border-zinc-700">
            Skill Scores
          </CardHeader>
          <CardBody>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div className="flex-1">
                <p className="mb-1">Technical Skills</p>
                <Progress
                  value={
                    userReport?.skills_score["technical_knowledge"]?.score * 10
                  }
                  max={100}
                  color="primary"
                />
              </div>
              <div className="flex-1">
                <p className="mb-1">Communication</p>
                <Progress
                  value={userReport?.skills_score["communication"]?.score * 10}
                  max={100}
                  color="secondary"
                />
                {/* 
                <Progress
                  value={user.communication * 10}
                  max={100}
                  color="secondary"
                /> */}
              </div>
              <div className="flex-1">
                <p className="mb-1">Problem Solving</p>
                <Progress
                  value={userReport?.skills_score["problem_solving"]?.score * 10}
                  max={100}
                  color="success"
                />

                {/* <Progress
                  value={user.problemSolving * 10}
                  max={100}
                  color="success"
                /> */}
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-zinc-800 text-white">
          <CardHeader className="text-xl font-semibold border-b border-zinc-700">
            Interview Questions
          </CardHeader>
          <CardBody>
            {userReport?.question_score?.length > 0 ? (
              <Accordion variant="bordered" className="w-full">
                <AccordionItem
                  title="View Questions & Answers"
                  className=" text-white"
                >
                  <div className="space-y-6">
                    {userReport?.question_score?.map((q, index) => (
                      <div
                        key={index}
                        className="bg-zinc-800 p-4 rounded-lg shadow-md"
                      >
                        <p className="font-semibold text-white mb-2">
                          Q{index + 1}: {q.question}
                        </p>
                        <p className="text-sm text-gray-300 mb-1">
                          <span className="font-semibold text-white">
                            Answer:
                          </span>{" "}
                          {q.user_answer}
                        </p>
                        <p className="text-sm text-blue-400">
                          <span className="font-semibold">Score:</span> {q.score}
                          /10
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>
            ) : (
              <p className="text-gray-400">No questions available.</p>
            )}
          </CardBody>
        </Card>

      

        <Card className="bg-zinc-800 text-white">
          <CardHeader className="text-xl font-semibold border-b border-zinc-700">
            Performance Summary
          </CardHeader>
          <CardBody>
            <p className="text-gray-300">
              {userReport?.overall_feedback ||
                "No performance summary available."}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-zinc-800 text-white">
          <CardHeader className="text-xl font-semibold border-b border-zinc-700">
            Final Verdict
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <span
                className={`text-2xl font-bold ${
                  userReport?.should_hire_or_not === "Yes"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {userReport?.should_hire_or_not === "Yes"
                  ? "Hire"
                  : "Do Not Hire"}
              </span>
              <p className="text-gray-300">{userReport?.overall_feedback}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
