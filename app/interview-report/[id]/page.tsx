"use client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Accordion,
  AccordionItem,
  Spinner,
} from "@heroui/react";
import { Avatar, Button } from "@heroui/react";
import { FaClock, FaChartLine, FaLaptop } from "react-icons/fa";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InterviewDetails, Question } from "@/types/interview";
import { useAuthContext } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { Attendees } from "@/types/interview";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import moment from "moment";

// interface InterviewPageProps {
//   params: { id: string };
// }

export default function InterviewReport() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params?.id as string;
  console.log(interviewId)

  const { user } = useAuthContext();

  const [interview, setInterview] = useState<InterviewDetails | null>(null);
  const [attendees, setAttendees] = useState<Attendees[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchInterview = async () => {
      console.log(interviewId, user?.uid);
      if (!interviewId || !user?.uid) return;

      try {
        debugger
        setLoading(true);
        const colRef = collection(db, `/interviews/${interviewId}/attendees`);
        const querySnapshot = await getDocs(colRef);

        const attendeesData: Attendees[] = [];
        querySnapshot.forEach((doc) => {
          attendeesData.push({ id: doc.id, ...doc.data() } as Attendees);
          console.log(doc.id, " => ", doc.data());
        });
        const docRef = doc(db, `/interviews/${interviewId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInterview(docSnap.data() as InterviewDetails);
          setQuestions(docSnap.data().questions as Question[]);
          setAttendees(attendeesData);
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
      <div className="max-w-6xl mx-auto p-6 space-y-10 min-w-[70%]">
        <h1 className="text-3xl font-semibold text-white text-center">
          Interview Details
        </h1>
        {/* Interview Info Card */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-xl min-w-[70%]">
          <CardHeader className="text-2xl font-semibold border-b border-zinc-700 pb-2">
            {interview?.profile}
          </CardHeader>
          <CardBody className="space-y-6">
            {/* <div className="flex flex-wrap gap-6 text-gray-300 text-base w-full">
              <div className="flex items-center gap-2">
                <FaClock className="text-white text-xl" />
                <span>{interview?.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaChartLine className="text-yellow-400 text-xl" />
                <span>{interview?.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaLaptop className="text-green-400 text-xl" />
                <span>Online</span>
              </div>
            </div> */}
            <div>
              <h3 className="text-xl font-semibold mb-1">Job Description</h3>
              <p className="text-gray-400 leading-relaxed">
                {interview?.description || "No description available."}
              </p>
            </div>
            <div>
              {/* <h3 className="text-xl font-semibold mb-2">Interview Questions</h3> */}
              <Accordion variant="bordered">
                <AccordionItem title="Interview Questions">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions?.map((question, index) => (
                      <div
                        key={index}
                        className="bg-zinc-700 p-4 rounded-md text-gray-200"
                      >
                        <span className="font-semibold">Q{index + 1}:</span>{" "}
                        {question.question}
                        <br />
                        <span className="font-semibold text-blue-500"></span>Type:{" "}
                        {question.type}
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </CardBody>
        </Card>
        {/* Attendees Card */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-xl min-w-[70%]">
          <CardHeader className="text-2xl font-semibold border-b border-zinc-700 pb-2">
            Attendees
          </CardHeader>
          <CardBody className="space-y-6">
            {attendees.map((user, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-zinc-700 pb-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar src={""} size="lg" radius="full" />
                  <div>
                    <p className="font-semibold text-[16px]">{user.fullName}</p>
                    <p className="text-gray-400 text-sm">
                      Interviewed on{" "}
                      {
                        moment(new Date(user?.createdAt)).format(
                          "MMMM Do YYYY, h:mm:ss a")
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-blue-400">
                    {JSON.parse(user?.data)?.overall_score}/10
                  </span>
                  <Button
                    onPress={() => {
                      router.push(
                        `/interview-report/${interviewId}/userreport/${user.id}`
                      );
                    }}
                    className="hover:bg-blue-600 text-white duration-300 ease-in transition-all"
                    color="primary"
                    variant="bordered"
                    size="md"
                  >
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
