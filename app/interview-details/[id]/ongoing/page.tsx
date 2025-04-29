import OngoingSetup from "./OngoingSetup";

interface PageProps {
  params: { id: any };
}

const Ongoing = async ({ params }: PageProps) => {
  const { id } = await params
  return <OngoingSetup interviewId={id} />;
};

export default Ongoing;