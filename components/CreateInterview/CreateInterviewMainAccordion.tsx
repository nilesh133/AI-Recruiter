"use client";
import React, { useCallback, useState } from "react";
import { Accordion, Select, SelectItem, Spinner } from "@heroui/react";
import CreateInterviewAccordionOne from "./CreateInterviewAccordionOne";
import {
  AccordionItem,
  Button,
  Chip,
  DatePicker,
  Input,
  Textarea,
  TimeInput,
  Tooltip,
} from "@heroui/react";
import { FaCode, FaUserTie, FaPuzzlePiece, FaLayerGroup } from "react-icons/fa";
import { MdChecklist, MdReplay } from "react-icons/md";
import {
  MdContentCopy,
  MdAccessTime,
  MdCalendarToday,
  MdDashboard,
  MdLink,
} from "react-icons/md";
import { InterviewDetails, Question } from "@/types/interview";
import {
  today,
  parseDate,
  parseTime,
  CalendarDateTime,
} from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useInterview } from "@/hooks/useInterview";
import { MdDone } from "react-icons/md";
import { CalendarDate } from "@internationalized/date";
import { useToast } from "@/hooks/useToast";
import { formatCalendarDateToDDMMYYYY, formatCalendarTime } from "@/helpers/clientLib";

const CreateInterviewMainAccordion = () => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(["1"]));
  const [interviewStage, setInterviewStage] = useState<number>(1); // 1: details, 2: questions, 3: summary
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const { addToastHandler } = useToast();

  // Error handling states
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [interviewDetails, setInterviewDetails] = useState<InterviewDetails>({
    id: "",
    profile: "",
    duration: "",
    description: "",
    types: [],
    start_date: today("UTC"),
    start_time: parseTime("12:00"),
    expiry_date: today("UTC"),
    expiry_time: parseTime("12:00"),
    noOfQuestions: "5",
    level: "Easy",
    userId: "",
    createdAt: null,
  });

  const { addInterview } = useInterview();
  const { user }: any = useAuthContext();
  const router = useRouter();

  const [flagGeneratingQuestions, setFlagGeneratingQuestions] = useState(false);
  const [generateQuestions, setGenerateQuestions] = useState<Question[]>([]);

  // Validation function
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!interviewDetails?.profile?.trim()) {
      errors.profile = "Interview profile is required";
    }

    if (!interviewDetails?.duration?.trim()) {
      errors.duration = "Duration is required";
    } else if (isNaN(Number(interviewDetails.duration)) || Number(interviewDetails.duration) <= 0) {
      errors.duration = "Duration must be a positive number";
    }

    if (!interviewDetails?.description?.trim()) {
      errors.description = "Job description is required";
    }

    if (!interviewDetails?.noOfQuestions?.trim()) {
      errors.noOfQuestions = "Number of questions is required";
    } else if (isNaN(Number(interviewDetails.noOfQuestions)) || Number(interviewDetails.noOfQuestions) <= 0) {
      errors.noOfQuestions = "Number of questions must be a positive number";
    }

    if (!interviewDetails?.level?.trim()) {
      errors.level = "Interview level is required";
    }

    if (!interviewDetails?.types || interviewDetails.types.length === 0) {
      errors.types = "At least one interview type must be selected";
    }

    if (!interviewDetails?.start_date) {
      errors.start_date = "Start date is required";
    }

    if (!interviewDetails?.start_time) {
      errors.start_time = "Start time is required";
    }

    if (!interviewDetails?.expiry_date) {
      errors.expiry_date = "Expiry date is required";
    }

    if (!interviewDetails?.expiry_time) {
      errors.expiry_time = "Expiry time is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateQuestions = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    try {
      // Clear previous errors
      setApiError(null);
      setValidationErrors({});

      // Validate form
      if (!validateForm()) {
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

      setFlagGeneratingQuestions(true);
      
      const PROMPT = `
  You are an expert technical interviewer.
  
  Based on the following inputs, generate a structured list of high-quality interview questions:
  
  - Job Title: ${interviewDetails?.profile || 'Not specified'}
  - Job Description: ${interviewDetails?.description || 'Not specified'}
  - Interview Level: ${interviewDetails?.level || 'Easy'}
  - Interview Types: ${interviewDetails?.types?.join(", ") || 'Not specified'}
  - Total Number of Questions: ${interviewDetails?.noOfQuestions || '5'}
  
  Your task:
  1. Analyze the job description to identify key responsibilities, required skills, and expected experience.
  2. Generate a set of relevant interview questions based on the interview level and types.
  3. Match the tone and structure of a real-life interview (e.g., technical, behavioral, problem solving).
  4. Adjust the number and depth of questions based on the assumed interview duration (short, medium, long).
  
  📌 Format:
  Return ONLY a JSON array of question objects. Each object must follow this structure:
  
  {
    "type": "Technical | Behavioral | Problem Solving",
    "question": "Your question here"
  }
  
  ❌ Do NOT include any explanation, introduction, markdown, or wrapping text — return only the JSON array.
  `;

      const res = await fetch("/api/generateQuestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PROMPT }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data || !data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format from API");
      }

      setGenerateQuestions(data.questions);
      setInterviewStage(2);
      setSelectedKeys(new Set(["2"]));
      
      addToastHandler({
        title: "Questions generated successfully!",
        description: `Generated ${data.questions.length} questions`,
        color: "success",
        timeout: 3000,
        variant: "success",
        shouldShowTimeoutProgress: true,
      });

    } catch (error) {
      console.error("Error generating questions:", error);
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
      setFlagGeneratingQuestions(false);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setInterviewDetails((prev) => ({ ...prev, [name]: value }));
      
      // Clear validation error for this field when user starts typing
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const handleAddNewInterview = async (
    interviewDetails: InterviewDetails,
    questions: any,
    user_uid: string
  ) => {
    if (!user_uid) {
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

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
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
      };

      await addInterview(interviewData, questions, user_uid, (res) => {
        console.log("Interview added successfully:", res);
        setInterviewId(res?.interviewId || null);
        setInterviewStage(3);
        setSelectedKeys(new Set(["3"]));
        
        addToastHandler({
          title: "Interview created successfully!",
          description: "Your interview link is ready to share",
          color: "success",
          timeout: 3000,
          variant: "success",
          shouldShowTimeoutProgress: true,
        });
      });
    } catch (error) {
      console.error("Error creating interview:", error);
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
  };

  const handleCopyLink = async () => {
    if (!interviewId) {
      addToastHandler({
        title: "No interview link available",
        description: "Please wait for the interview to be created",
        color: "warning",
        timeout: 3000,
        variant: "warning",
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    try {
      const link = `https://ai-recruiter-mauve.vercel.app/interview-details/${interviewId}`;
      await navigator.clipboard.writeText(link);
      
      addToastHandler({
        title: "Link copied to clipboard!",
        description: "You can now share this link with candidates",
        color: "success",
        timeout: 2000,
        variant: "success",
        shouldShowTimeoutProgress: true,
      });
    } catch (error) {
      console.error("Error copying link:", error);
      addToastHandler({
        title: "Failed to copy link",
        description: "Please copy the link manually",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    }
  };

  // Check if form is valid for generation
  const isFormValid = () => {
    return interviewDetails?.profile?.trim() &&
           interviewDetails?.duration?.trim() &&
           interviewDetails?.description?.trim() &&
           interviewDetails?.noOfQuestions?.trim() &&
           interviewDetails?.level?.trim() &&
           interviewDetails?.types?.length > 0 &&
           interviewDetails?.start_date &&
           interviewDetails?.start_time &&
           interviewDetails?.expiry_date &&
           interviewDetails?.expiry_time;
  };

  return (
    <Accordion
      variant="bordered"
      className="border border-white rounded-lg text-white"
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => {
        try {
          // Only allow opening accordions based on current stage
          const keyArray = Array.from(keys as Set<string>);
          if (keyArray.length > 0) {
            const lastKey = keyArray[keyArray.length - 1];
            if (interviewStage >= parseInt(lastKey)) {
              setSelectedKeys(keys as Set<string>);
            }
          } else {
            setSelectedKeys(new Set());
          }
        } catch (error) {
          console.error("Error handling accordion selection:", error);
        }
      }}
    >
      <AccordionItem
        key="1"
        aria-label="Add Interview Details"
        title={
          <div
            className={`flex items-center gap-2 text-white text-lg font-semibold ${
              selectedKeys.has("3") ? "bg-gray-200" : ""
            }`}
          >
            <span>📝</span> Add Interview Details
          </div>
        }
        className={`text-white border-white `}
        isDisabled={interviewStage > 1}
      >
        <div className="space-y-6">
          {/* Interview Profile & Duration */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="font-medium mb-1">Interview Profile</p>
              <Input
                placeholder="e.g. Frontend Developer"
                variant="bordered"
                classNames={{
                  inputWrapper: "text-white",
                  input: "text-white",
                }}
                name="profile"
                value={interviewDetails?.profile || ""}
                onChange={handleChange}
                isInvalid={!!validationErrors.profile}
                errorMessage={validationErrors.profile}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">
                Interview Duration (in minutes)
              </p>
              <Input
                type="number"
                placeholder="e.g. 30"
                variant="bordered"
                classNames={{
                  inputWrapper: "text-white",
                  input: "text-white",
                }}
                name="duration"
                value={interviewDetails?.duration || ""}
                onChange={handleChange}
                isInvalid={!!validationErrors.duration}
                errorMessage={validationErrors.duration}
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <p className="font-medium mb-1">Job Description</p>
            <Textarea
              placeholder="Describe the role..."
              variant="bordered"
              classNames={{
                inputWrapper: "text-white",
                input: "text-white",
              }}
              name="description"
              value={interviewDetails?.description || ""}
              onChange={handleChange}
              isInvalid={!!validationErrors.description}
              errorMessage={validationErrors.description}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="font-medium mb-1">No of Questions</p>
              <Input
                placeholder="e.g. 5"
                variant="bordered"
                classNames={{
                  inputWrapper: "text-white",
                  input: "text-white",
                }}
                type="number"
                name="noOfQuestions"
                value={interviewDetails?.noOfQuestions || ""}
                onChange={handleChange}
                isInvalid={!!validationErrors.noOfQuestions}
                errorMessage={validationErrors.noOfQuestions}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Interview Level</p>
              <Select
                variant="bordered"
                fullWidth
                name="level"
                value={interviewDetails?.level || ""}
                onChange={handleChange}
                className="max-w-xs"
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
            </div>
          </div>

          {/* Type of Interview */}
          <div>
            <p className="font-medium mb-2">Type of Interview</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { type: "Technical", icon: <FaCode /> },
                { type: "Behavioral", icon: <FaUserTie /> },
                { type: "Problem Solving", icon: <FaPuzzlePiece /> },
                { type: "Mixed", icon: <FaLayerGroup /> },
              ].map(({ type, icon }) => (
                <div
                  key={type}
                  onClick={() => {
                    try {
                      setInterviewDetails((prev) => {
                        const types = prev.types?.includes(type)
                          ? prev.types.filter((t) => t !== type)
                          : [...(prev.types || []), type];
                        return { ...prev, types };
                      });
                      
                      // Clear validation error for types
                      if (validationErrors.types) {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.types;
                          return newErrors;
                        });
                      }
                    } catch (error) {
                      console.error("Error updating interview types:", error);
                    }
                  }}
                  className={`px-3 py-2 border rounded-full flex items-center gap-2 cursor-pointer transition duration-200 ease-in-out ${
                    interviewDetails.types?.includes(type)
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-white hover:bg-white/10"
                  }`}
                >
                  <span>{icon}</span>
                  <p className="text-sm">{type}</p>
                </div>
              ))}
            </div>
            {validationErrors.types && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.types}</p>
            )}
          </div>

          {/* Date and Time Range */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="font-medium mb-1">Interview Start</p>
              <DatePicker
                variant="bordered"
                name="start_date"
                value={interviewDetails?.start_date || null}
                onChange={(date) => {
                  try {
                    setInterviewDetails((prev) => ({ ...prev, start_date: date }));
                    if (validationErrors.start_date) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.start_date;
                        return newErrors;
                      });
                    }
                  } catch (error) {
                    console.error("Error updating start date:", error);
                  }
                }}
              />
              {validationErrors.start_date && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.start_date}</p>
              )}
              <TimeInput
                label="Start Time"
                variant="bordered"
                value={interviewDetails?.start_time || null}
                onChange={(time) => {
                  try {
                    setInterviewDetails((prev) => ({ ...prev, start_time: time }));
                    if (validationErrors.start_time) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.start_time;
                        return newErrors;
                      });
                    }
                  } catch (error) {
                    console.error("Error updating start time:", error);
                  }
                }}
                className="mt-2"
              />
              {validationErrors.start_time && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.start_time}</p>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Interview Expiry</p>
              <DatePicker
                variant="bordered"
                name="expiry_date"
                value={interviewDetails?.expiry_date || null}
                onChange={(date) => {
                  try {
                    setInterviewDetails((prev) => ({
                      ...prev,
                      expiry_date: date,
                    }));
                    if (validationErrors.expiry_date) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.expiry_date;
                        return newErrors;
                      });
                    }
                  } catch (error) {
                    console.error("Error updating expiry date:", error);
                  }
                }}
              />
              {validationErrors.expiry_date && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.expiry_date}</p>
              )}
              <TimeInput
                label="Expiry Time"
                variant="bordered"
                value={interviewDetails?.expiry_time || null}
                onChange={(time) => {
                  try {
                    setInterviewDetails((prev) => ({
                      ...prev,
                      expiry_time: time,
                    }));
                    if (validationErrors.expiry_time) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.expiry_time;
                        return newErrors;
                      });
                    }
                  } catch (error) {
                    console.error("Error updating expiry time:", error);
                  }
                }}
                className="mt-2"
              />
              {validationErrors.expiry_time && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.expiry_time}</p>
              )}
            </div>
          </div>

          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">
                <strong>Error:</strong> {apiError}
              </p>
            </div>
          )}

          {flagGeneratingQuestions ? (
            <div className="flex px-10 py-6 bg-blue-300/10 rounded-lg border border-blue-500 gap-4 items-center w-[70%] mx-auto">
              <div>
                <Spinner color="primary" />
              </div>
              <div>
                <p className="text-sm">Generating Questions</p>
                <p className="text-blue-500 text-sm">
                  Based on your input, our AI is creating personalized
                  questions.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center mt-4">
              <Button
                color="primary"
                className="mt-4 w-[200px]"
                onClick={handleGenerateQuestions}
                isDisabled={!isFormValid()}
              >
                Generate
              </Button>
            </div>
          )}
        </div>
      </AccordionItem>

      <AccordionItem
        key="2"
        aria-label="Verify Questions"
        className={`text-white border-white`}
        title={
          <div
            className={`flex items-center gap-2 text-white text-lg font-semibold ${
              selectedKeys.has("3") ? "bg-gray-200" : ""
            }`}
          >
            <MdChecklist className="text-xl" />
            Verify Questions
          </div>
        }
        isDisabled={interviewStage < 2 || interviewStage > 2}
      >
        <div className="space-y-6 mt-2">
          <p className="text-base font-medium text-white">
            Here are your AI-generated interview questions. You can review,
            regenerate, or create an interview link.
          </p>

          {generateQuestions && generateQuestions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {generateQuestions.map((question, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-zinc-600 shadow-lg hover:shadow-xl transition duration-300"
                >
                  <p className="text-sm text-zinc-400 mb-1">
                    Question {index + 1}
                  </p>
                  <p className="text-white font-medium leading-relaxed">
                    {question?.question || "Question not available"}
                  </p>
                  <p className="text-sm text-blue-500">
                    Type: {question?.type || "Not specified"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">No questions generated yet</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Button
              variant="bordered"
              className="text-white border-white hover:bg-white hover:text-black transition-all"
              startContent={<MdReplay />}
              onClick={() => {
                try {
                  setInterviewStage(1);
                  setSelectedKeys(new Set(["1"]));
                  setGenerateQuestions([]);
                } catch (error) {
                  console.error("Error resetting to first stage:", error);
                }
              }}
            >
              Regenerate Questions
            </Button>
            <Button
              color="primary"
              className="text-white font-semibold"
              startContent={<MdLink />}
              onPress={() => {
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
                handleAddNewInterview(
                  interviewDetails,
                  generateQuestions,
                  user.uid
                );
              }}
              isLoading={isSubmitting}
              isDisabled={!generateQuestions || generateQuestions.length === 0}
            >
              Create Interview Link
            </Button>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem
        key="3"
        aria-label="Interview Summary"
        className={`text-white border-white}`}
        title={
          <div
            className={`flex items-center gap-2 text-white text-lg font-semibold ${
              selectedKeys.has("3") ? "bg-gray-200500" : ""
            }`}
          >
            <MdAccessTime className="text-xl" />
            Interview Summary
          </div>
        }
        isDisabled={interviewStage < 3}
      >
        <div className="space-y-6 mt-2">
          {/* Success Message */}
          <span className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
            <MdDone />
          </span>
          <h2 className="text-xl font-semibold text-white mb-2 text-center m-0">
            Your interview is ready!
          </h2>
          <p className="text-sm text-gray-100 text-center m-0">
            Share the link with candidates to start the interview process
          </p>

          {/* Interview Link */}
          <div className="bg-zinc-800 border border-zinc-600 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto">
              <MdLink className="text-xl text-primary" />
              <p className="text-white font-medium text-sm sm:text-base">
                {interviewId
                  ? `https://ai-recruiter-mauve.vercel.app/interview-details/${interviewId}`
                  : "Generating link..."}
              </p>
            </div>
            <Tooltip content="Copy to clipboard" placement="top">
              <Button
                isIconOnly
                variant="light"
                className="text-white"
                isDisabled={!interviewId}
                onClick={handleCopyLink}
              >
                <MdContentCopy />
              </Button>
            </Tooltip>
          </div>

          <div className="flex flex-wrap gap-4 text-white text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <p className="text-sm bg-[#111111] p-2 rounded-md">
                Duration{" "}
                <span className="border-l-1 pl-1">
                  {interviewDetails?.duration || "Not set"} mins
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm bg-[#111111] p-2 rounded-md">
                Expiry:{" "}
                <span className="border-l-1 pl-1">
                  {interviewDetails?.expiry_date && interviewDetails?.expiry_time 
                    ? `${formatCalendarDateToDDMMYYYY(interviewDetails.expiry_date)}, ${formatCalendarTime(interviewDetails.expiry_time)}`
                    : "Not set"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm bg-[#111111] p-2 rounded-md">
                Questions:{" "}
                <span className="border-l-1 pl-1">
                  {interviewDetails?.noOfQuestions || "Not set"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm bg-[#111111] p-2 rounded-md">
                Type:{" "}
                <span className="border-l-1 pl-1">
                  {interviewDetails?.types?.join(", ") || "Not set"}
                </span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-6">
            <Button
              color="primary"
              variant="solid"
              startContent={<MdDashboard />}
              className="text-white font-semibold"
              onPress={() => {
                try {
                  router.push("/dashboard");
                } catch (error) {
                  console.error("Error navigating to dashboard:", error);
                  window.location.href = "/dashboard";
                }
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default CreateInterviewMainAccordion;
