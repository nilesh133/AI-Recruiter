"use client";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import OngoingInterviewPage from "@/components/OngoingInterviewPage/OngoingInterviewPage";

const Ongoing = () => {
  const params = useParams<{ id: string, userid: string }>();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OngoingInterviewPage interviewId={params?.id || ""} userid={params?.userid || ""} />
    </Suspense>
  );

};

export default Ongoing;