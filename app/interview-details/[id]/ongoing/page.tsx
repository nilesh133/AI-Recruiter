"use client";
import { useParams } from "next/navigation";
import OngoingSetup from "./OngoingSetup";

// interface PageProps {
//   params: { id: string };
// }

const Ongoing = () => {
  const params = useParams<{ id: string; }>()
  const { id } = params
  return <OngoingSetup interviewId={id} />;
};

export default Ongoing;