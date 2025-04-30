"use client";
import { useParams } from "next/navigation";
import OngoingSetup from "./OngoingSetup";

const Ongoing = () => {
  const params = useParams<{ id: string }>();
  
  if (!params?.id) {
    // Handle the case where id is missing
    return <div>Interview ID not found</div>;
  }

  return <OngoingSetup interviewId={params.id} />;
};

export default Ongoing;