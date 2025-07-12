"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Accordion,
  AccordionItem,
  Avatar,
  Spinner,
} from "@heroui/react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import moment from "moment";
import { McqInterviewDetails } from "@/types/interview";

interface Attendee {
  id: string;
  fullName: string;
  createdAt: string;
  answers: { questionId: string; selectedOption: string }[];
}

const McqInterviewReport = ({ interviewId }: { interviewId: string }) => {
  const [interview, setInterview] = useState<McqInterviewDetails | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviewData = async () => {
    try {
      setLoading(true);

      // Fetch interview
      const interviewRef = doc(db, "mcqInterviews", interviewId);
      const interviewSnap = await getDoc(interviewRef);
      if (!interviewSnap.exists()) {
        setError("Interview not found");
        return;
      }
      setInterview(interviewSnap.data() as McqInterviewDetails);

      // Fetch attendees
      const attendeesRef = collection(
        db,
        `mcqInterviews/${interviewId}/attendees`
      );
      const attendeesSnap = await getDocs(attendeesRef);
      const attendeeList: Attendee[] = [];
      attendeesSnap.forEach((doc) => {
        const data = doc.data();
        attendeeList.push({
          id: doc.id,
          fullName: data.fullName,
          createdAt: data.createdAt,
          answers: data.answers,
        });
      });
      setAttendees(attendeeList);
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId) {
      fetchInterviewData();
    }
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <p className="text-red-500 text-lg">{error || "Interview not found"}</p>
      </div>
    );
  }

  const questions = interview?.questions || [];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-10">
      {/* Page Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-center text-white">
        Interview Summary
        <p className="text-zinc-400 text-sm leading-relaxed">
          {`https://ai-recruiter-mauve.vercel.app/mcq-interview-details/${interviewId}`}
        </p>
      </h1>

      {/* Interview Info */}
      <Card className="bg-zinc-900 text-white border border-zinc-700 rounded-lg shadow">
        <CardHeader className="text-lg md:text-xl font-semibold border-b border-zinc-700 pb-3">
          {interview.profile} Interview
        </CardHeader>
        <CardBody className="space-y-4">
          <section>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {"No description available."}
            </p>
          </section>

          <hr className="border-zinc-700" />

          <section>
            <p className="text-base md:text-lg font-medium text-white mb-2">
              Questions Overview
            </p>
            <Accordion variant="bordered">
              <AccordionItem title="View All Questions">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-zinc-800 p-4 rounded-lg text-sm border border-zinc-700 hover:border-blue-500 transition"
                    >
                      <p className="font-medium text-blue-400 mb-1">
                        Q{idx + 1}: {q.question}
                      </p>
                      <ul className="list-disc pl-5 text-zinc-300 space-y-0.5">
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                      <p className="text-green-400 mt-2">
                        Correct Answer:{" "}
                        <span className="text-white">{q.answer}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          </section>
        </CardBody>
      </Card>

      {/* Attendee Reports */}
      <Card className="bg-zinc-900 text-white border border-zinc-700 rounded-lg shadow">
        <CardHeader className="text-lg md:text-xl font-semibold border-b border-zinc-700 pb-3">
          Candidate Reports
        </CardHeader>
        <CardBody className="space-y-6">
          {attendees.map((user) => {
            console.log(user);
            const correctAnswers = user?.answers?.filter(
              (ans) =>
                questions.find((q) => String(q.id) === String(ans.questionId))?.answer ===
                ans.selectedOption
            ).length;

            return (
              <Accordion key={user.id} variant="bordered">
                <AccordionItem
                  title={
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {moment(new Date(user?.createdAt || "")).format(
                            "MMMM Do YYYY, h:mm:ss a"
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-blue-400">
                        {correctAnswers}/{questions.length}
                      </span>
                    </div>
                  }
                >
                  <div className="space-y-3 mt-3">
                    {questions.map((q, idx) => {
                      const userAnswer =
                        user?.answers?.find((ans) => String(ans.questionId) === String(q.id))
                          ?.selectedOption || "Not Answered";
                      const isCorrect = userAnswer === q.answer;

                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded border text-sm ${
                            isCorrect
                              ? "border-green-500/60 bg-green-900/20"
                              : "border-red-500/60 bg-red-900/20"
                          }`}
                        >
                          <p className="text-blue-400 font-medium mb-0.5">
                            Q{idx + 1}: {q.question}
                          </p>
                          <p className="text-zinc-300">
                            <span className="text-green-400 font-medium">
                              Correct:
                            </span>{" "}
                            {q.answer}
                          </p>
                          <p className="text-zinc-300">
                            <span
                              className={`font-medium ${
                                isCorrect ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              Candidate:
                            </span>{" "}
                            {userAnswer}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </AccordionItem>
              </Accordion>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
};

export default McqInterviewReport;
