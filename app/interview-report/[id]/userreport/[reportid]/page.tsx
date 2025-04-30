import UserInterviewReport from "./UserInterviewReport";


interface PageProps {
  params: { id: string, reportid: string };
}

export default async function InterviewReportPage({ params }: PageProps) {
  const { id, reportid } = params
  return <UserInterviewReport interviewId={id} reportId={reportid} />;
}

