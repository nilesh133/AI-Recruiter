import InterviewSetup from "./InterviewSetup";

interface Props {
  params: { id: string };
}

const InterviewSetupPage = async ({ params }: Props) => {
  const { id } = params
  return <InterviewSetup interviewId={id} />;
};

export default InterviewSetupPage;
