// app/page.tsx (Main Setup Page)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const InterviewOptions = () => {
  const [technologies, setTechnologies] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    debugger
    e.preventDefault();
    const res = await fetch("/api/generateQuestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technologies, difficulty, numQuestions }),
    });
    const data = await res.json();
    localStorage.setItem("interviewQuestions", JSON.stringify(data.questions));
    router.push("/interviewpage");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center h-screen gap-4">
      <input
        type="text"
        placeholder="Technologies (comma separated)"
        value={technologies}
        onChange={(e) => setTechnologies(e.target.value)}
        className="border p-2 w-64"
      />
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="border p-2 w-64"
      >
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>
      <input
        type="number"
        value={numQuestions}
        onChange={(e) => setNumQuestions(Number(e.target.value))}
        className="border p-2 w-64"
        min={1}
        max={20}
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Start Interview
      </button>
    </form>
  );
};

export default InterviewOptions;