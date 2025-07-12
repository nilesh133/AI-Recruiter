"use client";

import { useParams } from "next/navigation";
import InterviewReport from "./InterviewReport";

export default function InterviewReportPage() {
  const params = useParams<{ id: string }>();

  return <InterviewReport interviewId={params?.id || ""} />;
}