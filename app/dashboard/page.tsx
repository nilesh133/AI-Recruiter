"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@heroui/react"; // HeroUI Button
import { FaMicrophoneAlt, FaCode, FaListAlt } from "react-icons/fa";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FaTools, FaBrain, FaComments, FaBolt } from "react-icons/fa"; // Icons
import { useToast } from "@/hooks/useToast";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { addToastHandler } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean | null>(null); // Assuming useAuth returns loading state
  const [allInterviews, setAllInterviews] = useState([]); // Assuming you want to fetch all interviews
  const [error, setError] = useState<string | null>(null); // Error state

  // useEffect(() => {
  //   debugger;
  //   if (loading == false && !user?.uid) {
  //     console.log(loading, user, "user is null and loading is false");
  //     router.push("/login"); // redirect only if loading is complete and user is still null
  //   }
  // }, [user, loading]);

  // if (!user) return null; // optional: show spinner/loading

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  useEffect(() => {
    setLoading(true);
    const fetchAllInterviews = async () => {
      try {
        const collectionRef = collection(db, `users/${user.uid}/interviews`);
        const querySnapshot = await getDocs(collectionRef);

        const interviews: any[] = [];
        querySnapshot.forEach((doc) => {
          console.log(doc);
          interviews.push({ id: doc.id, ...doc.data() });
        });

        setAllInterviews(interviews);
      } catch (error) {
        console.error("Error fetching interviews:", error);
        setError("Failed to fetch interviews");
        addToastHandler({
          title: "Error while fetching interviews. Please try again.",
          description: "",
          color: "error",
          timeout: 3000,
          variant: "error",
          shouldShowTimeoutProgress: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllInterviews();
  }, [user?.uid]);

  console.log(allInterviews, user?.uid, "all interviews");

  return (
    <ProtectedRoute>
      <div className="flex flex-col bg-gradient-to-br from-[#111111] to-[#000000] text-white">
        {/* Navbar */}

        {/* Main Section */}
        <main className="flex flex-col flex-grow px-8 py-6">
          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Card 1 - Create Voice Interview */}
            <div className="border border-[#575757] rounded-xl p-6 flex flex-col items-center bg-[#1a1a1a] hover:shadow-lg transition">
              <FaMicrophoneAlt className="text-4xl text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4">
                Create Voice Interview
              </h3>
              <Button
                variant="default"
                className="bg-indigo-500 hover:bg-indigo-600 w-full"
                onPress = {() => {
                  router.push('/create-interview')
                }}
              >
                Create
              </Button>
            </div>

            {/* Card 2 - Create Coding Interview */}
            <div className="border border-[#575757] rounded-xl p-6 flex flex-col items-center bg-[#1a1a1a] opacity-70 cursor-not-allowed">
              <FaCode className="text-4xl text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4">
                Create Coding Interview
              </h3>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </div>

            {/* Card 3 - Create MCQ Interview */}
            <div className="border border-[#575757] rounded-xl p-6 flex flex-col items-center bg-[#1a1a1a] opacity-70 cursor-not-allowed">
              <FaListAlt className="text-4xl text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Create MCQ Interview</h3>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Heading for Created Interviews */}
          <h2 className="text-3xl font-bold mb-6">Your Created Interviews</h2>

          {/* Here you can map and list interviews */}
          <div className="text-gray-400">
            {/* For now placeholder */}
            {/* {allInterviews?.length == 0 ? (
              " No interviews created yet."
            ) : ( */}
            <div className="overflow-x-auto h-[42vh]">
              <table className="min-w-full border border-[#575757] rounded-xl overflow-hidden">
                <thead className="bg-[#1f1f1f] sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-6 text-left font-semibold text-gray-300 border-b border-[#575757]">
                      Profile
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-gray-300 border-b border-[#575757]">
                      Start Date
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-gray-300 border-b border-[#575757]">
                      Level
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-gray-300 border-b border-[#575757]">
                      No. of Questions
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-gray-300 border-b border-[#575757]">
                      Type
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-gray-300 border-b border-[#575757]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {allInterviews.map((interview) => (
                    <tr
                      key={interview.id}
                      className="hover:bg-[#2a2a2a] transition text-sm"
                    >
                      <td className="py-3 px-6 border-b border-[#575757]">
                        {interview?.profile}
                      </td>
                      <td className="py-3 px-6 border-b border-[#575757]">
                        {interview?.start_date}
                      </td>
                      <td className="py-3 px-6 border-b border-[#575757]">
                        {interview?.level}
                      </td>
                      <td className="py-3 px-6 border-b border-[#575757]">
                        {interview?.noOfQuestions}
                      </td>
                      <td className="py-3 px-6 border-b border-[#575757]">
                        <div className="flex items-center">
                          <div className="relative flex">
                            {interview?.types?.map((type, index) => {
                              let icon = null;
                              let bgColor = "";

                              switch (type) {
                                case "Technical":
                                  icon = <FaTools />;
                                  bgColor = "bg-indigo-500";
                                  break;
                                case "Problem Solving":
                                  icon = <FaBrain />;
                                  bgColor = "bg-yellow-500";
                                  break;
                                case "Behavioral":
                                  icon = <FaComments />;
                                  bgColor = "bg-purple-500";
                                  break;
                                case "Mixed":
                                  icon = <FaBolt />;
                                  bgColor = "bg-pink-500";
                                  break;
                                default:
                                  break;
                              }

                              return (
                                <div
                                  key={index}
                                  className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-sm ${
                                    index !== 0 ? "-ml-3" : ""
                                  }`}
                                >
                                  {icon}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 border-b border-[#575757]">
                        <Button
                          onPress={() =>
                            router.push(`/interview-report/${interview.id}`)
                          }
                          variant="bordered"
                          className="border-indigo-400 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {loading && (
                    <tr className="">
                      <td className="align-center py-3 px-6 text-left font-semibold text-gray-300 border-b border-[#575757]" colSpan={6}>
                        Please wait while we fetch interviews
                      </td>
                    </tr>
                  )}

                  {loading == false && allInterviews?.length == 0 && (
                    <td className="align-center py-3 px-6 text-left font-semibold text-gray-300 border-b border-[#575757]" colSpan={6}>No interviews created</td>
                  )}
                </tbody>
              </table>
            </div>
            {/* )} */}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
