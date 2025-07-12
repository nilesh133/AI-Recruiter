import React from "react";
import { MCQQuestion } from "@/types/interview";

type Props = {
  questions: MCQQuestion[];
};

const GeneratedQuestions: React.FC<Props> = ({ questions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {questions.map((q: MCQQuestion, idx: number) => (
        <div
          key={idx}
          className="relative bg-white dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl group"
        >
          {/* Decorative Accent Circle */}
          <div className="absolute -top-3 -right-3 h-8 w-8 bg-blue-600 dark:bg-blue-400 text-white text-sm font-bold flex items-center justify-center rounded-full shadow-md">
            {idx + 1}
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4 leading-snug">
            {q.question}
          </h3>

          {/* Options */}
          <ul className="space-y-2 mb-4">
            {q.options.map((opt: string, i: number) => (
              <li
                key={i}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg border border-transparent group-hover:border-blue-300 transition-colors"
              >
                {opt}
              </li>
            ))}
          </ul>

          {/* Answer */}
          <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-md text-sm font-medium mb-2 border border-green-300 dark:border-green-700">
            ✅ Correct Answer: <span className="font-semibold">{q.answer}</span>
          </div>

          {/* Explanation */}
          {q.explanation && (
            <div className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-4 py-3 rounded-md text-sm border border-zinc-200 dark:border-zinc-700 mt-2">
              💡 <span className="font-semibold">Explanation:</span>{" "}
              {q.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GeneratedQuestions;
