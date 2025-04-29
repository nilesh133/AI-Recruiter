import InterviewSetup from "./InterviewSetup";

interface Props {
  params: { id: string };
}

const InterviewSetupPage = async ({ params }: Props) => {
  const { id } = await params
  return <InterviewSetup interviewId={id} />;
};

export default InterviewSetupPage;
