"use client";

import Header from "@/components/Header";
import { FaNetworkWired } from "react-icons/fa";
import { CiReceipt } from "react-icons/ci";
import { FaBarsProgress } from "react-icons/fa6";
import { Button } from "@heroui/react"; // HeroUI Button
import { FaUserPlus, FaSignInAlt } from "react-icons/fa";
import {
  MdOutlineWorkOutline,
  MdOutlineShare,
  MdOutlineFeedback,
} from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";

const Home = () => {
  const { user } = useAuthContext();
  console.log(user);
  return (
    // <div className="flex flex-col items-center h-screen bg-cover bg-center">

    //   {/* header */}
    //   <Header/>

    //   {/* middle section */}
    //   <div className="flex flex-col items-center justify-center h-full">
    //     <h1 className="text-5xl font-semibold mb-4">Practice and Perfect Your</h1>
    //     <h1 className="text-5xl font-semibold mb-4">Interviews with AI</h1>
    //     <p className="text-2xl text-gray-500 font-medium">Get interview-ready with AI-powered practice sessions crafted for your specific job opportunities.</p>

    //     <div className="flex flex-col mt-8">
    //       <div className="flex items-center space-x-4 mt-8">
    //         <span>
    //           <FaNetworkWired className="icons"/>
    //         </span>
    //         <div className="flex flex-col">
    //           <h3 className="text-lg font-semibold">
    //           Experience Realistic Mock Interviews
    //           </h3>
    //           <p className="text-gray-800">Have natural, role-specific conversations with AI designed to mirror real interviews.</p>
    //         </div>
    //       </div>
    //       <div className="flex items-center space-x-4 mt-8">
    //         <span>
    //           <CiReceipt className="icons"/>
    //         </span>
    //         <div className="flex flex-col">
    //           <h3 className="text-lg font-semibold">
    //           Get Immediate Performance Feedback
    //           </h3>
    //           <p className="text-gray-800">Access actionable insights to quickly strengthen your interview skills.</p>
    //         </div>
    //       </div>
    //       <div className="flex items-center space-x-4 mt-8">
    //         <span>
    //           <FaBarsProgress className="icons"/>
    //         </span>
    //         <div className="flex flex-col">
    //           <h3 className="text-lg font-semibold">
    //           Monitor Your Interview Progress
    //           </h3>
    //           <p className="text-gray-800">Record, review, and fine-tune your responses to continuously improve over time..</p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    // </div>
    <div className="flex flex-col mt-[5rem]">
      {/* Navbar */}

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-4">
        <h1 className="text-5xl font-bold mt-9 text-gray-200 leading-tight">
          Revolutionize Hiring with AI Interviews
        </h1>
        <p className="text-lg text-gray-600 mt-6 max-w-2xl">
          Create AI-powered interviews, share links, and get instant,
          intelligent feedback. Streamline your recruitment process like never
          before!
        </p>

        {/* Steps */}
        <div className="my-16 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl">
          {/* Step 1 */}
          <div className="flex flex-col items-center bg-gradient-to-br from-[#111111] to-[#000000] p-6 rounded-lg shadow-lg border border-[#575757]">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <FaUserPlus className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Register Yourself
            </h3>
            <p className="text-gray-500 text-sm">
              Create your recruiter account and get started instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center bg-gradient-to-br from-[#111111] to-[#000000] p-6 rounded-lg shadow-lg border border-[#575757]">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <MdOutlineWorkOutline className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Create Interview
            </h3>
            <p className="text-gray-500 text-sm">
              Use AI to generate smart, customized interviews effortlessly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center bg-gradient-to-br from-[#111111] to-[#000000] p-6 rounded-lg shadow-lg border border-[#575757]">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <MdOutlineShare className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Share Link
            </h3>
            <p className="text-gray-500 text-sm">
              Easily share interview links with potential candidates.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center bg-gradient-to-br from-[#111111] to-[#000000] p-6 rounded-lg shadow-lg border border-[#575757]">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <MdOutlineFeedback className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Get AI Feedback
            </h3>
            <p className="text-gray-500 text-sm">
              Receive detailed, AI-generated feedback to make decisions faster.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;


// ask-openai
// hooks/useAuth.ts
// interview-options
// interviewpage
// QuestionPlayer.tsx
// chat.ts


// Remaining work
// Minor UI changes
// Email verification for signup
// OAuth
// Credits system
// Stripe integration
// Interview details page for mcq interviews
// MCQ interview page
// Interview result page