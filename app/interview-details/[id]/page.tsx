"use client";
import { useParams } from "next/navigation";
import InterviewSetup from "@/components/InterviewSetup/InterviewSetup";

const InterviewSetupPage = () => {
  const params = useParams<{ id: string }>();

  return <InterviewSetup interviewId={params?.id || ""} />;
};

export default InterviewSetupPage;