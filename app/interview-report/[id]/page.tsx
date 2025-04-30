"use client";

import { useParams } from "next/navigation";
import InterviewReport from "./InterviewReport";
// interface PageProps {
//   params: { id: string};
// }

export default function InterviewReportPage() {
  const params = useParams<{ id: string; }>()
  const { id } = params
  return <InterviewReport interviewId={id} />;
}
