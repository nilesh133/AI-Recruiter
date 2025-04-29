import UserInterviewReport from "./UserInterviewReport";


interface PageProps {
  params: { id: any, reportid: any };
}

export default async function InterviewReportPage({ params }: PageProps) {
  const { id, reportid } = await params
  return <UserInterviewReport interviewId={id} reportId={reportid} />;
}

