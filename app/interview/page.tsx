'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Configuration, OpenAIApi } from 'openai-edge';

export default function InterviewPage() {
  const searchParams: any = useSearchParams();
  const tech = searchParams.get('tech') || 'React';
  const difficulty = searchParams.get('difficulty') || 'Easy';
  const questionCount = Number(searchParams.get('count') || 5);

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewOver, setInterviewOver] = useState(false);

  // 🔊 Function to Speak the Question
  function speak(text: string, callback?: () => void) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  // 🎤 Function to Listen to User Answer
  function listenForAnswer(): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
  
      recognition.start();
      setIsListening(true);
  
      recognition.onresult = (event: any) => {
        const userAnswer = event.results[0][0].transcript;
        console.log('User Answer:', userAnswer);
        setIsListening(false);
        resolve(userAnswer);
      };
  
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        reject(event.error);
      };
    });
  }
  

  // 🧠 Function to Ask Next Question from OpenAI
  async function askNextQuestion(userPreviousAnswer?: string) {
    if (questionsAsked >= questionCount) {
      setInterviewOver(true);
      return;
    }
  
    try {
      const prompt = userPreviousAnswer
        ? `Given the previous answer "${userPreviousAnswer}", ask a follow-up question in ${tech} technology at ${difficulty} level.`
        : `Ask a ${difficulty} level interview question in ${tech} technology.`;
  
      const response = await fetch('/api/ask-openai', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
  
      const data = await response.json();
  
      const aiQuestion = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate a question.';
  
      setCurrentQuestion(aiQuestion);
      setQuestionsAsked(prev => prev + 1);
  
      // ✅ Speak the question first, then listen
      speak(aiQuestion, async () => {
        try {
          const userAnswer = await listenForAnswer();  // ⏳ Wait for user's voice
          await askNextQuestion(userAnswer);            // 🔁 Continue after user's response
        } catch (error) {
          console.error('Listening failed:', error);
          await askNextQuestion(); // Even if listening fails, continue
        }
      });
  
    } catch (error) {
      console.error('Failed to fetch question:', error);
    }
  }
  
  
  

  useEffect(() => {
    askNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (interviewOver) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Interview Completed 🎉</h1>
        <p>Good job! You answered {questionCount} questions.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">AI Mock Interview 🎤</h1>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl text-center">
        <h2 className="text-xl font-semibold mb-4">Current Question:</h2>
        <p className="text-gray-800 mb-6">{currentQuestion || 'Loading...'}</p>

        {isListening && <p className="text-green-600">🎤 Listening for your answer...</p>}
        {isSpeaking && <p className="text-blue-600">🗣️ Speaking the question...</p>}
      </div>
    </div>
  );
}