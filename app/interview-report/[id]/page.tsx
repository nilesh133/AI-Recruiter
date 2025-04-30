"use client";

import { useParams } from "next/navigation";
import InterviewReport from "./InterviewReport";

export default function InterviewReportPage() {
  const params = useParams<{ id: string }>();
  
  if (!params?.id) {
    // Handle the case where id is missing
    return <div>Interview ID not found</div>;
  }

  return <InterviewReport interviewId={params.id} />;
}