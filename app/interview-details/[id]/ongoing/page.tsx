import OngoingSetup from "./OngoingSetup";

const Ongoing = async ({ params }) => {
  const { id } = await params
  return <OngoingSetup interviewId={id} />;
};

export default Ongoing;