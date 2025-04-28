// app/interview/page.tsx
"use client";
import { useEffect, useState } from "react";
import QuestionPlayer from "../../components/QuestionPlayer";

const InterviewPage = () => {
  const [questions, setQuestions] = useState<string[]>(['Explain the difference between a controlled and uncontrolled component in React. When would you use each?', 'Describe how you would optimize a React application for performance. Name at least 3 techniques and explain how they improve performance', 'What are the different lifecycle methods of a React component? Explain the use cases for `componentDidMount` and `componentWillUnmount`.']);

  // useEffect(() => {
  //   const stored = localStorage.getItem("interviewQuestions");
  //   if (stored) setQuestions(JSON.parse(stored));
  // }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h2 className="text-2xl font-bold mb-6">AI Interviewer</h2>
      {questions.length > 0 && <QuestionPlayer questions={questions} />}
    </div>
  );
};

export default InterviewPage;