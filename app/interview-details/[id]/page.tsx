"use client";
import { useParams } from "next/navigation";
import InterviewSetup from "./InterviewSetup";

// interface Props {
//   params: { id: string };
// }

const InterviewSetupPage = () => {
  const params = useParams<{ id: string; }>()
  const { id } = params
  return <InterviewSetup interviewId={id} />;
};

export default InterviewSetupPage;
