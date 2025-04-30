"use client";
import { useParams } from "next/navigation";
import OngoingSetup from "./OngoingSetup";
import { Suspense } from "react";

const Ongoing = () => {
  const params = useParams<{ id: string }>();
  
  if (!params?.id) {
    // Handle the case where id is missing
    return <div>Interview ID not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OngoingSetup interviewId={params.id} />
    </Suspense>
  );

};

export default Ongoing;