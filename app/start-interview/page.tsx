'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StartInterviewPage() {
  const router = useRouter();
  const [tech, setTech] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [count, setCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tech) {
      alert('Please enter a technology!');
      return;
    }
    router.push(`/interview?tech=${encodeURIComponent(tech)}&difficulty=${encodeURIComponent(difficulty)}&count=${count}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Setup Your Interview</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Technology</label>
            <input
              type="text"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="e.g., React, Node.js"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Number of Questions</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full mt-1 p-2 border rounded-md"
              min={1}
              max={20}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Start Interview
          </button>
        </form>
      </div>
    </div>
  );
}
