import InterviewReport from "./InterviewReport";

interface PageProps {
  params: { id: string };
}

export default function InterviewReportPage({ params }: PageProps) {
  return <InterviewReport interviewId={params.id} />;
}
