"use client";

import { useParams } from "next/navigation";
import UserInterviewReport from "./UserInterviewReport";

// interface PageProps {
//   params: { id: string, reportid: string };
// }

export default async function InterviewReportPage() {
  const params = useParams<{ id: string; reportid: string }>()
  const { id, reportid } = params
  return <UserInterviewReport interviewId={id} reportId={reportid} />;
}

