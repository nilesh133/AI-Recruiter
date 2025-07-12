import { ProtectedRoute } from '@/components/ProtectedRoute'
import React from 'react'
import CreateMcqInterview from '@/components/CreateMcqInterview/CreateMcqInterview';

const CreateMcqInterviewPage = () => {
  return (
    <ProtectedRoute>
      <div className="w-full h-screen">

        <div className="w-[90%] md:w-[70%] mx-auto py-10">
          <CreateMcqInterview />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default CreateMcqInterviewPage