import UserInterviewReport from "./UserInterviewReport";


interface PageProps {
  params: { id: string, reportid: string };
}

export default async function InterviewReportPage({ params }) {
  const { id, reportid } = await params
  return <UserInterviewReport interviewId={id} reportId={reportid} />;
}

