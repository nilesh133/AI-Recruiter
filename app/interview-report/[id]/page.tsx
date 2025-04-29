import InterviewReport from "./InterviewReport";
interface PageProps {
  params: { id: any};
}

export default async function InterviewReportPage({ params }: PageProps) {
  const { id } = await params
  return <InterviewReport interviewId={id} />;
}
