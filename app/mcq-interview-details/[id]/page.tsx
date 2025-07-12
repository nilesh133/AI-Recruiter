"use client";
import McqInterviewSetup from "@/components/McqInterviewSetup/McqInterviewSetup";
import { useParams } from "next/navigation";
import React from "react";

const McqInterviewDetails = () => {
  const params = useParams<{ id: string }>();

  return <McqInterviewSetup interviewId={params?.id || ""} />;
};

export default McqInterviewDetails;
