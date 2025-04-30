"use client";

import { useParams } from "next/navigation";
import UserInterviewReport from "./UserInterviewReport";

export default function InterviewReportPage() {
  const params = useParams<{ id: string; reportid: string }>();
  
  if (!params?.id || !params?.reportid) {
    // Handle the case where either parameter is missing
    return (
      <div className="p-4 text-red-500">
        {!params?.id && !params?.reportid 
          ? "Interview ID and Report ID not found" 
          : !params?.id 
            ? "Interview ID not found" 
            : "Report ID not found"
        }
      </div>
    );
  }

  return (
    <UserInterviewReport 
      interviewId={params.id} 
      reportId={params.reportid} 
    />
  );
}