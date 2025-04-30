import InterviewReport from "./InterviewReport";
interface PageProps {
  params: { id: string};
}

export default async function InterviewReportPage({ params }: PageProps) {
  const { id } = params
  return <InterviewReport interviewId={id} />;
}
