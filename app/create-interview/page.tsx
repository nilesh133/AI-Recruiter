"use client";

import CreateInterviewMainAccordion from "@/components/CreateInterview/CreateInterviewMainAccordion";
import React, { useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const CreateInterview = () => {

  return (
    <ProtectedRoute>
      <div className="w-full h-screen">
        <div className="py-6 text-center sticky top-0 bg-black z-10 rounded-lg shadow-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Create Your Interview
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base max-w-xl mx-auto">
            Set up and customize your interview in just a few steps. Provide the
            required details, review the generated questions, and get your
            unique interview link ready to share.
          </p>
        </div>

        <div className="w-[90%] md:w-[70%] mx-auto py-10">
          <CreateInterviewMainAccordion />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateInterview;
