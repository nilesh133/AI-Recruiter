import InterviewSetup from "./InterviewSetup";

const InterviewSetupPage = async ({ params }) => {
  const { id } = await params
  return <InterviewSetup interviewId={id} />;
};

export default InterviewSetupPage;
