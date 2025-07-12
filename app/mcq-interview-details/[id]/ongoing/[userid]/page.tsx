"use client";
import OngoingMcqInterviewPage from "@/components/OngoingMcqInterviewPage/OngoingMcqInterviewPage";
import { useParams } from "next/navigation";
import { Suspense } from "react";

const OngoingMcqInterview = () => {
  const params = useParams<{ id: string, userid: string }>();
  console.log(params)
  
  if (!params?.id) {
    return <div>Interview ID not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OngoingMcqInterviewPage interviewId={params.id} user_id={params.userid} />
    </Suspense>
  );

};

export default OngoingMcqInterview;