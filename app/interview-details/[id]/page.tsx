import InterviewSetup from "./InterviewSetup";

interface InterviewPageProps {
  params: { id: string };
}

const InterviewSetupPage = ({ params }: InterviewPageProps) => {
  return <InterviewSetup interviewId={params.id} />;
};

export default InterviewSetupPage;
