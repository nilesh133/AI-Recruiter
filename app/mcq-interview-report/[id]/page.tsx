"use client";
import React from 'react'
import McqInterviewReport from '@/components/McqInterviewReport/McqInterviewReport'
import { useParams } from 'next/navigation';

const McqInterviewReportPage = () => {
  const params = useParams<{ id: string }>();

  return (
    <div>
        <McqInterviewReport interviewId={params?.id || ""} />
    </div>
  )
}

export default McqInterviewReportPage