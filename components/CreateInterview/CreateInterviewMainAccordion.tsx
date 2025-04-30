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

const CreateInterviewMainAccordion = () => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(["1"]));
  const [interviewStage, setInterviewStage] = useState<number>(1); // 1: details, 2: questions, 3: summary
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const { addToastHandler } = useToast();

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
  const { user } = useAuthContext();
  const router = useRouter();

  const [flagGeneratingQuestions, setFlagGeneratingQuestions] = useState(false);
  const [generateQuestions, setGenerateQuestions] = useState<Question[]>([]);

  const handleGenerateQuestions = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    try {
      setFlagGeneratingQuestions(true);
      const PROMPT = `
  You are an expert technical interviewer.
  
  Based on the following inputs, generate a structured list of high-quality interview questions:
  
  - Job Title: ${interviewDetails?.profile}
  - Job Description: ${interviewDetails?.description}
  - Interview Level: ${interviewDetails?.level}
  - Interview Types: ${interviewDetails?.types?.join(", ")}
  - Total Number of Questions: ${interviewDetails?.noOfQuestions}
  
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
      const data = await res.json();
      setGenerateQuestions(data.questions);
      setInterviewStage(2);
      setSelectedKeys(new Set(["2"]));
    } catch (error) {
      addToastHandler({
        title: "Error while fetching interview questions. Please try again.",
        description: "",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
      console.error("Error generating questions:", error);
    } finally {
      setFlagGeneratingQuestions(false);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setInterviewDetails((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const formatCalendarDateToDDMMYYYY = (date: CalendarDate): string => {
    const day = String(date.day).padStart(2, "0");
    const month = String(date.month).padStart(2, "0");
    const year = String(date.year);
    return `${day}/${month}/${year}`;
  };

  const formatCalendarTime = (time: CalendarDateTime): string => {
    const hour = String(time.hour).padStart(2, "0");
    const minute = String(time.minute).padStart(2, "0");
    // const year = String(date.year);
    return `${hour}:${minute}`;
  };

  const handleAddNewInterview = async (
    interviewDetails: InterviewDetails,
    questions: any,
    user_uid: string
  ) => {
    try {
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
        setInterviewId(res.interviewId);
        setInterviewStage(3);
        setSelectedKeys(new Set(["3"]));
      });
    } catch (error) {
      addToastHandler({
        title: "Error while creating interview. Please try again.",
        description: "",
        color: "error",
        timeout: 3000,
        variant: "error",
        shouldShowTimeoutProgress: true,
      });
    }
  };

  return (
    <Accordion
      variant="bordered"
      className="border border-white rounded-lg text-white"
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => {
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
                value={interviewDetails?.profile}
                onChange={handleChange}
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
                value={interviewDetails?.duration}
                onChange={handleChange}
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
              value={interviewDetails.description}
              onChange={handleChange}
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
                value={interviewDetails?.noOfQuestions}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Interview Level</p>
              <Select
                variant="bordered"
                fullWidth
                name="level"
                value={interviewDetails?.level}
                onChange={handleChange}
                className="max-w-xs"
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
                  onClick={() => {
                    setInterviewDetails((prev) => {
                      const types = prev.types.includes(type)
                        ? prev.types.filter((t) => t !== type)
                        : [...prev.types, type];
                      return { ...prev, types };
                    });
                  }}
                  className={`px-3 py-2 border rounded-full flex items-center gap-2 cursor-pointer transition duration-200 ease-in-out ${
                    interviewDetails.types.includes(type)
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-white hover:bg-white/10"
                  }`}
                >
                  <span>{icon}</span>
                  <p className="text-sm">{type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date and Time Range */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="font-medium mb-1">Interview Start</p>
              <DatePicker
                // placeholder="Start Date"
                variant="bordered"
                // classNames={{ trigger: "text-white" }}
                name="start_date"
                value={interviewDetails?.start_date}
                onChange={(date) =>
                  setInterviewDetails((prev) => ({ ...prev, start_date: date }))
                }
              />
              <TimeInput
                label="Start Time"
                variant="bordered"
                // classNames={{ trigger: "text-white" }}
                value={interviewDetails?.start_time}
                onChange={(time) =>
                  setInterviewDetails((prev) => ({ ...prev, start_time: time }))
                }
                className="mt-2"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Interview Expiry</p>
              <DatePicker
                // placeholder="Start Date"
                variant="bordered"
                // classNames={{ trigger: "text-white" }}
                name="expiry_date"
                value={interviewDetails?.expiry_date}
                onChange={(date) =>
                  setInterviewDetails((prev) => ({
                    ...prev,
                    expiry_date: date,
                  }))
                }
              />
              <TimeInput
                label="Start Time"
                variant="bordered"
                // classNames={{ trigger: "text-white" }}
                value={interviewDetails?.expiry_time}
                onChange={(time) =>
                  setInterviewDetails((prev) => ({
                    ...prev,
                    expiry_time: time,
                  }))
                }
                className="mt-2"
              />
            </div>
          </div>
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
                isDisabled={Object.entries(interviewDetails).some(
                  ([key, value]) =>
                    !["id", "userId", "createdAt"].includes(key) &&
                    (!value || (Array.isArray(value) && value.length === 0))
                )}
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

          <div className="grid gap-4 sm:grid-cols-2">
            {generateQuestions &&
              generateQuestions?.length > 0 &&
              generateQuestions?.map((question, index) => (
                <div
                  key={index}
                  className=" p-5 rounded-xl border border-zinc-600 shadow-lg hover:shadow-xl transition duration-300"
                >
                  <p className="text-sm text-zinc-400 mb-1">
                    Question {index + 1}
                  </p>
                  <p className="text-white font-medium leading-relaxed">
                    {question?.question}
                  </p>
                  <p className="text-sm text-blue-500">
                    Type: {question?.type}
                  </p>
                </div>
              ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Button
              variant="bordered"
              className="text-white border-white hover:bg-white hover:text-black transition-all"
              startContent={<MdReplay />}
              onClick={() => console.log("Regenerate Questions")}
            >
              Regenerate Questions
            </Button>
            <Button
              color="primary"
              className="text-white font-semibold"
              startContent={<MdLink />}
              onPress={() => {
                handleAddNewInterview(
                  interviewDetails,
                  generateQuestions,
                  user?.uid
                );
              }}
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
                  ? `https://yourapp.com/interview/${interviewId}`
                  : "Generating link..."}
              </p>
            </div>
            <Tooltip content="Copy to clipboard" placement="top">
              <Button
                isIconOnly
                variant="light"
                className="text-white"
                isDisabled={!interviewId}
                onClick={() =>
                  navigator.clipboard.writeText(
                    `https://yourapp.com/interview/${interviewId}`
                  )
                }
              >
                <MdContentCopy />
              </Button>
            </Tooltip>
          </div>

          <div className="flex flex-wrap gap-4 text-white text-sm sm:text-base">
            <div className="flex items-center gap-2">
              {/* <MdAccessTime className="text-primary text-lg" /> */}
              <p className="text-sm bg-[#111111] p-2 rounded-md">
                Duration{" "}
                <span className="border-l-1 pl-1">
                  {interviewDetails?.duration} mins
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* <MdCalendarToday className="text-primary" /> */}
              <p className="text-sm bg-[#111111] p-2 rounded-md">
                Expiry:{" "}
                <span className="border-l-1 pl-1">25 Apr 2025, 11:59 PM</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm bg-[#111111] p-2 rounded-md">
                Questions:{" "}
                <span className="border-l-1 pl-1">
                  {interviewDetails?.noOfQuestions}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm bg-[#111111] p-2 rounded-md">
                Type:{" "}
                <span className="border-l-1 pl-1">
                  {interviewDetails?.types?.join(",")}
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
                router.push("/dashboard");
              }}
              onClick={() => console.log("Navigate to dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>

          {/* ... rest of your summary content ... */}
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default CreateInterviewMainAccordion;
