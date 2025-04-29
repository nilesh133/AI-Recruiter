import UserInterviewReport from "./UserInterviewReport";


interface PageProps {
  params: { id: string, reportid: string };
}

export default function InterviewReportPage({ params }: PageProps) {
  return <UserInterviewReport interviewId={params.id} reportId={params.reportid} />;
}

