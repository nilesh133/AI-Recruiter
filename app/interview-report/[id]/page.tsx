import InterviewReport from "./InterviewReport";

export default async function InterviewReportPage({ params }) {
  const { id } = await params
  return <InterviewReport interviewId={id} />;
}
