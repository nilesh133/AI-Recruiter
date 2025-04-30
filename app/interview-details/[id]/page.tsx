"use client";
import { useParams } from "next/navigation";
import InterviewSetup from "./InterviewSetup";

const InterviewSetupPage = () => {
  const params = useParams<{ id: string }>();
  
  if (!params?.id) {
    return (
      <div className="p-4 text-red-500">
        Interview ID not found
      </div>
    );
  }

  return <InterviewSetup interviewId={params.id} />;
};

export default InterviewSetupPage;