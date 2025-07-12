"use client"
import React, { useState } from 'react'
import McqStepHeader from './McqStepHeader';
import { Input, Button, DatePicker, TimeInput, Select, SelectItem, toast, Spinner } from '@heroui/react';
import { McqInterviewDetails, MCQQuestion } from '@/types/interview';
import {
    today,
    parseDate,
    parseTime,
    CalendarDateTime,
  } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useInterview } from "@/hooks/useInterview";
import { useToast } from "@/hooks/useToast";
import GeneratedQuestions from './GeneratedQuestions';
import { formatCalendarDateToDDMMYYYY, formatCalendarTime } from '@/helpers/clientLib';

const stepHeaders = [
  {
    heading: 'Choose the Interview Focus',
    subheading: 'Select the role or technology this interview round is meant to assess. Example: React Developer, Backend Engineer, Data Analyst, etc.'
  },
  {
    heading: 'Decide the Time Limit',
    subheading: 'Specify how long the candidate will have to complete the interview in minutes. Keep in mind the difficulty and number of questions.'
  },
  {
    heading: 'How Many Questions?',
    subheading: 'Define the number of MCQs you want the AI to generate. More questions may require more time and increase difficulty(Max 15 questions)'
  },
  {
    heading: 'Set the Difficulty Level',
    subheading: 'Choose the difficulty level for the interview. Easy, Medium, or Hard.'
  },
  {
    heading: 'Schedule the Interview',
    subheading: 'Set when the interview will start and expire. Candidates won\'t be able to access it before the start time or after the deadline.'
  },
  {
    heading: 'AI-Generated Interview Questions',
    subheading: 'These questions were crafted by our AI based on your selected criteria.'
  }  
];


const CreateMcqInterview = () => {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { addToastHandler } = useToast();
  const { user }: any = useAuthContext();
  const { addMcqInterview } = useInterview();
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const [interviewDetails, setInterviewDetails] = useState<McqInterviewDetails>({
    id: "",
    profile: "",
    duration: "",
    start_date: today("UTC"),
    start_time: parseTime("12:00"),
    expiry_date: today("UTC"),
    expiry_time: parseTime("12:00"),
    noOfQuestions: "5",
    level: "Easy",
    userId: user?.uid || "",
    createdAt: null,
  });
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);

  // Validation function
  const validateStep = (currentStep: number): boolean => {
    const errors: {[key: string]: string} = {};

    switch (currentStep) {
      case 1:
        if (!interviewDetails.profile?.trim()) {
          errors.profile = "Interview profile is required";
        }
        break;
      case 2:
        if (!interviewDetails.duration?.trim()) {
          errors.duration = "Duration is required";
        } else if (isNaN(Number(interviewDetails.duration)) || Number(interviewDetails.duration) <= 0) {
          errors.duration = "Duration must be a positive number";
        }
        break;
      case 3:
        if (!interviewDetails.noOfQuestions?.trim()) {
          errors.noOfQuestions = "Number of questions is required";
        } else if (isNaN(Number(interviewDetails.noOfQuestions)) || Number(interviewDetails.noOfQuestions) <= 0) {
          errors.noOfQuestions = "Number of questions must be a positive number";
        } else if (Number(interviewDetails.noOfQuestions) > 15) {
          errors.noOfQuestions = "Maximum 15 questions allowed";
        }
        break;
      case 4:
        if (!interviewDetails.level?.trim()) {
          errors.level = "Difficulty level is required";
        }
        break;
      case 5:
        if (!interviewDetails.start_date) {
          errors.start_date = "Start date is required";
        }
        if (!interviewDetails.start_time) {
          errors.start_time = "Start time is required";
        }
        if (!interviewDetails.expiry_date) {
          errors.expiry_date = "Expiry date is required";
        }
        if (!interviewDetails.expiry_time) {
          errors.expiry_time = "Expiry time is required";
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if current step is valid without updating state
  const isCurrentStepValid = (): boolean => {
    switch (step) {
      case 1:
        return !!interviewDetails.profile?.trim();
      case 2:
        return !!interviewDetails.duration?.trim() && 
               !isNaN(Number(interviewDetails.duration)) && 
               Number(interviewDetails.duration) > 0;
      case 3:
        return !!interviewDetails.noOfQuestions?.trim() && 
               !isNaN(Number(interviewDetails.noOfQuestions)) && 
               Number(interviewDetails.noOfQuestions) > 0 && 
               Number(interviewDetails.noOfQuestions) <= 15;
      case 4:
        return !!interviewDetails.level?.trim();
      case 5:
        return !!interviewDetails.start_date && 
               !!interviewDetails.start_time && 
               !!interviewDetails.expiry_date && 
               !!interviewDetails.expiry_time;
      default:
        return true;
    }
  };

  const nextStep = () => {
    try {
      if (!isCurrentStepValid()) {
        // Run validation to show errors
        validateStep(step);
        addToastHandler({
          title: "Please fix the errors before proceeding",
          description: "Check the form fields marked with errors",
          color: "warning",
          timeout: 4000,
          variant: "warning",
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      if (step === 5) {
        handleGenerateQuestions();
      } else {
        setStep((s) => Math.min(s + 1, stepHeaders.length));
        setValidationErrors({}); // Clear errors when moving to next step
      }
    } catch (error) {
      console.error("Error in nextStep:", error);
      addToastHandler({
        title: "Error navigating to next step",
        description: "Please try again",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    }
  }

  const prevStep = () => {
    try {
      if (step === 1) {
        router.push('/dashboard');
      } else {
        setStep((s) => Math.max(s - 1, 1));
        setValidationErrors({}); // Clear errors when going back
      }
    } catch (error) {
      console.error("Error in prevStep:", error);
      addToastHandler({
        title: "Error navigating to previous step",
        description: "Please try again",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    }
  };

  const handleGenerateQuestions = async () => {
    try {
      setGeneratingQuestions(true);
      setApiError(null);

      // Validate current step
      if (!isCurrentStepValid()) {
        // Run validation to show errors
        validateStep(step);
        addToastHandler({
          title: "Please fix the errors before generating questions",
          description: "Check the form fields marked with errors",
          color: "warning",
          timeout: 4000,
          variant: "warning",
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      const PROMPT = `
        Generate ${interviewDetails.noOfQuestions || 5} multiple-choice questions on the topic of "${interviewDetails.profile || 'General'}" at ${interviewDetails.level || 'Easy'} difficulty.

        Each question should have:
        - A clear and concise question statement.
        - Four answer options (A, B, C, D).
        - One correct answer.
        - Optionally, a short explanation for the correct answer.

        The output should be in JSON format like:
        [
        {
            "question": "What is the purpose of useEffect in React?",
            "options": ["To manage state", "To handle side effects", "To style components", "To fetch props"],
            "answer": "To handle side effects",
            "explanation": "useEffect is used to handle side-effects such as API calls, subscriptions, or manual DOM changes."
        },
        ]

      `;

      const response = await fetch('/api/generateQuestions', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PROMPT: PROMPT }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format from API");
      }

      console.log(data);
      setQuestions(data.questions.map((question: Omit<MCQQuestion, 'id'>) => ({
        ...question,
        id: question.question || `question_${Date.now()}`,
      })));
      setStep(step + 1);
      
      addToastHandler({
        title: "Questions generated successfully!",
        description: `Generated ${data.questions.length} questions`,
        color: "success",
        timeout: 3000,
        variant: "success",
        shouldShowTimeoutProgress: true,
      });

    } catch (error) {
      console.error('Error generating questions:', error);
      setApiError(error instanceof Error ? error.message : "Failed to generate questions");
      
      addToastHandler({
        title: "Error generating questions",
        description: "Please try again or check your internet connection",
        color: "error",
        timeout: 4000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setGeneratingQuestions(false);
    }
  }

  const handleAddMcqInterview = async () => {
    if (!user?.uid) {
      addToastHandler({
        title: "Authentication Error",
        description: "Please log in again",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    if (!questions || questions.length === 0) {
      addToastHandler({
        title: "No Questions Available",
        description: "Please generate questions first",
        color: "warning",
        timeout: 3000,
        variant: "warning",
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);

      const formattedStartDate = formatCalendarDateToDDMMYYYY(
        interviewDetails.start_date
      );
      const formattedExpiryDate = formatCalendarDateToDDMMYYYY(
        interviewDetails.expiry_date
      );
  
      const formattedStartTime = formatCalendarTime(
        interviewDetails?.start_time
      );
      const formattedExpiryTime = formatCalendarTime(
        interviewDetails?.expiry_time
      );
  
      const interviewData = {
        ...interviewDetails,
        start_date: formattedStartDate,
        expiry_date: formattedExpiryDate,
        start_time: formattedStartTime,
        expiry_time: formattedExpiryTime,
        userId: user.uid,
      };

      await addMcqInterview(interviewData, questions, user.uid, (res) => {
        console.log("Interview added successfully:", res);
        addToastHandler({
          title: "Interview created successfully!",
          description: "Your MCQ interview is ready to share",
          color: "success",
          timeout: 3000,
          variant: "success",
          shouldShowTimeoutProgress: true,
        });
        
        // Navigate to dashboard after successful creation
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      });
    } catch (error) {
      console.error("Error creating MCQ interview:", error);
      setApiError(error instanceof Error ? error.message : "Failed to create interview");
      
      addToastHandler({
        title: "Error creating interview",
        description: "Please try again or check your connection",
        color: "error",
        timeout: 4000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInputChange = (field: string, value: any) => {
    try {
      setInterviewDetails({ ...interviewDetails, [field]: value });
      
      // Clear validation error for this field when user starts typing
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  return (
    <div>
      <McqStepHeader
        step={step}
        heading={stepHeaders[step - 1]?.heading || "Step"}
        subheading={stepHeaders[step - 1]?.subheading || ""}
      />
      
      {/* API Error Display */}
      {apiError && (
        <div className="mx-auto max-w-lg mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            <strong>Error:</strong> {apiError}
          </p>
        </div>
      )}

      <div className={`mx-auto bg-zinc-900 p-6 rounded-lg shadow space-y-6 ${step === 6 ? 'max-w-full' : 'max-w-lg'}`}>
        {step === 1 && (
          <Input
            name="profile"
            value={interviewDetails.profile || ""}
            onChange={(e) => handleInputChange('profile', e.target.value)}
            placeholder="Enter the profile"
            variant="bordered"
            classNames={{ inputWrapper: 'text-white', input: 'text-white' }}
            isInvalid={!!validationErrors.profile}
            errorMessage={validationErrors.profile}
          />
        )}
        {step === 2 && (
          <Input
            type="number"
            name="duration"
            value={interviewDetails.duration || ""}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            placeholder="Enter the duration in minutes"
            variant="bordered"
            classNames={{ inputWrapper: 'text-white', input: 'text-white' }}
            isInvalid={!!validationErrors.duration}
            errorMessage={validationErrors.duration}
          />
        )}
        {step === 3 && (
          <Input
            type="number"
            name="noOfQuestions"
            placeholder="Enter the number of questions (max 15)"
            variant="bordered"
            classNames={{ inputWrapper: 'text-white', input: 'text-white' }}
            value={interviewDetails.noOfQuestions || ""}
            onChange={(e) => handleInputChange('noOfQuestions', e.target.value)}
            isInvalid={!!validationErrors.noOfQuestions}
            errorMessage={validationErrors.noOfQuestions}
            max={15}
            min={1}
          />
        )}
        {step === 4 && (
          <Select
            name="level"
            value={interviewDetails.level || ""}
            onChange={(e) => handleInputChange('level', e.target.value)}
            placeholder="Select difficulty level"
            variant="bordered"
            className="text-white"
            isInvalid={!!validationErrors.level}
            errorMessage={validationErrors.level}
          >
            {[
                  { key: "easy", label: "Easy" },
                  { key: "medium", label: "Medium" },
                  { key: "hard", label: "Hard" },
                ].map((level) => (
                  <SelectItem key={level?.key}>{level.label}</SelectItem>
                ))}
          </Select>
        )}
        {step === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <DatePicker
                name="startDate"
                value={interviewDetails.start_date || null}
                onChange={(date) => handleInputChange('start_date', date)}
                variant="bordered"
                classNames={{ inputWrapper: 'text-white', input: 'text-white' }}
              />
              {validationErrors.start_date && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.start_date}</p>
              )}
            </div>
            <div>
              <TimeInput
                name="startTime"
                value={interviewDetails.start_time || null}
                onChange={(time) => handleInputChange('start_time', time)}
                variant="bordered"
                classNames={{ inputWrapper: 'text-white', input: 'text-white' }}
              />
              {validationErrors.start_time && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.start_time}</p>
              )}
            </div>
            <div>
              <DatePicker
                name="expiryDate"
                value={interviewDetails.expiry_date || null}
                onChange={(date) => handleInputChange('expiry_date', date)}
                variant="bordered"
                classNames={{ inputWrapper: 'text-white', input: 'text-white' }}
              />
              {validationErrors.expiry_date && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.expiry_date}</p>
              )}
            </div>
            <div>
              <TimeInput
                name="expiryTime"
                value={interviewDetails.expiry_time || null}
                onChange={(time) => handleInputChange('expiry_time', time)}
                variant="bordered"
                classNames={{ inputWrapper: 'text-white', input: 'text-white' }}
              />
              {validationErrors.expiry_time && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.expiry_time}</p>
              )}
            </div>
          </div>
        )}
        {step === 6 && (
          <GeneratedQuestions questions={questions} />
        )}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 rounded bg-zinc-700 text-white disabled:opacity-50"
            variant="bordered"
            disabled={generatingQuestions && step === 5}
          >
            Back
          </Button>
          {step !== 5 && step !== 6 && (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!isCurrentStepValid()}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              color="primary"
            >
              Next
            </Button>
          )}
          {step === 5 && (
            <Button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={!isCurrentStepValid() || generatingQuestions}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              color="primary"
            >
              {generatingQuestions ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Generating Questions...
                </div>
              ) : (
                "Generate Questions"
              )}
            </Button>
          )}
          {step === 6 && (
            <Button
              type="button"
              onPress={handleAddMcqInterview}
              disabled={!questions || questions.length === 0}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              color="primary"
              isLoading={isSubmitting}
            >
              Create Interview
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateMcqInterview