import React, { useState } from "react";
import { toast } from "react-toastify";
import Lucide from "../../base-components/lucide";
import Evaluation from "./Evaluation";
import { LoadingIcon } from "@/base-components";
import { submitMCQAnswers } from "../utils/ApiCall";

function MCQ({ loadingInteview, interviewResponse, interviewPayload }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isMcqEnable, setIsMcqEnable] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const isCurrentQuestionAnswered = () => {
    return !!selectedAnswers[currentQuestionIndex];
  };

  const areAllQuestionsAnswered = () => {
    const totalQuestions = interviewResponse?.Question?.MCQ.length || 0;
    return Object.keys(selectedAnswers).length === totalQuestions;
  };

  const onAnswerChange = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        answer,
        question: interviewResponse?.Question?.MCQ[questionIndex]?.Question,
      },
    }));
  };

  const submitInterviewAnswers = async () => {
    if (!areAllQuestionsAnswered()) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    const formattedMCQAnswers = Object.values(selectedAnswers).map(
      (answerObj) => ({
        Question: answerObj.question,
        "Submitted Answer": answerObj.answer,
      })
    );

    const payload = {
      action: "submit_answer",
      candidate_id: interviewPayload.candidate_id,
      Question: {
        MCQ: formattedMCQAnswers,
      },
    };
    try {
      const response = await submitMCQAnswers(payload);

      if (response.statusCode === 200) {
        toast.success(
          "Thank you for your response. Your assessment is finished now!"
        );
        setIsMcqEnable(response);
      } else {
        toast.error("Error submitting answers");
      }
    } catch (error) {
      toast.error("Network Error: " + error.message);
    }
  };

  const nextQuestion = () => {
    if (isCurrentQuestionAnswered()) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      toast.error(
        "Please select an answer before moving to the next question."
      );
    }
  };

  const prevQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  // Function to check and wrap in <pre> if the question contains code block
  const formatQuestionWithCode = (question) => {
    if (question.includes("```python") || question.includes("```bash")) {
      return <pre>{question}</pre>;
    }
    return question;
  };

  const renderLoading = (message) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingIcon
        icon="spinning-circles"
        color="#1e3a8a"
        className="w-8 h-8 ml-2 inline-block"
      />
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
        <p className="text-sm text-gray-500">
          Please wait while we prepare your questions
        </p>
      </div>
    </div>
  );

  if (loadingInteview) {
    return renderLoading("Loading Interview Questions");
  }

  return (
    <>
      {!isMcqEnable && interviewResponse && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl mx-auto mt-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-start my-4 tracking-wide">
              <h3 className="text-xl font-semibold">Candidate Information</h3>
              <div className="my-3">
                <p className="my-2">
                  <strong>Candidate ID:</strong>{" "}
                  {interviewResponse?.CandidateID}
                </p>
                <p className="my-2">
                  <strong>Candidate Name:</strong>{" "}
                  {interviewResponse?.["Candidate Name"]}
                </p>
                <p className="my-2">
                  <strong>Candidate Email:</strong>{" "}
                  {interviewResponse?.["Candidate Email"]}
                </p>
                <p className="my-2">
                  <strong>Applied Position:</strong>{" "}
                  {interviewResponse?.["Applied Position"]}
                </p>
              </div>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-start my-4">
              <div className="col-span-12 md:col-span-6 xl:col-span-12 mt-3 2xl:mt-8">
                <div className="intro-x flex items-center h-10">
                  <h2 className="text-lg font-medium truncate mr-auto">
                    Multiple Choice Questions
                  </h2>
                  <div className="ml-auto text-lg font-medium">
                    {currentQuestionIndex + 1} /{" "}
                    {interviewResponse?.Question?.MCQ.length}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="box bg-gray-200 relative">
                    <div className="p-5">
                      <div className="custom-scroll bg-gray-200 rounded-lg">
                        <div className="my-8">
                          <p className="font-semibold my-3 ml-5 max-h-[300px] overflow-y-auto flex items-start">
                            <span className="mr-2">
                              {currentQuestionIndex + 1}.
                            </span>
                            <span className="flex-1">
                              {formatQuestionWithCode(
                                interviewResponse?.Question?.MCQ[
                                  currentQuestionIndex
                                ]?.Question
                              )}
                            </span>
                          </p>

                          <ul className="list-disc pl-5">
                            {interviewResponse?.Question?.MCQ[
                              currentQuestionIndex
                            ]?.Options.map((option, i) => (
                              <li key={i} className="flex items-center my-2">
                                <input
                                  type="radio"
                                  id={`question-${currentQuestionIndex}-option-${i}`}
                                  name={`question-${currentQuestionIndex}`}
                                  value={option}
                                  checked={
                                    selectedAnswers[currentQuestionIndex]
                                      ?.answer === option
                                  }
                                  onChange={() =>
                                    onAnswerChange(currentQuestionIndex, option)
                                  }
                                />
                                <label
                                  htmlFor={`question-${currentQuestionIndex}-option-${i}`}
                                  className="ml-2 w-full font-medium"
                                >
                                  {option}
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="tiny-slider-navigator 
                                    inline-flex 
                                    items-center 
                                    justify-center 
                                    h-10 
                                    w-10 
                                    rounded-full 
                                    border 
                                    transition-all 
                                    duration-200 
                                    disabled:bg-gray-100 
                                    disabled:border-gray-200 
                                    disabled:cursor-not-allowed 
                                    disabled:text-gray-400 
                                    bg-white 
                                    border-blue-200 
                                    hover:bg-blue-50 
                                    hover:border-blue-300 
                                    active:scale-95 
                                    shadow-sm 
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-blue-500 
                                    focus:ring-offset-2"
                      >
                        <Lucide icon="ChevronLeft" className="w-5 h-5 " />
                      </button>
                      {currentQuestionIndex <
                      interviewResponse?.Question?.MCQ.length - 1 ? (
                        <button
                          onClick={nextQuestion}
                          disabled={
                            areAllQuestionsAnswered() &&
                            interviewResponse?.Question?.MCQ.length - 1 ===
                              currentQuestionIndex
                          }
                          data-carousel="important-notes"
                          data-target="next"
                          className="tiny-slider-navigator 
                                      inline-flex 
                                      items-center 
                                      justify-center 
                                      h-10 
                                      w-10 
                                      rounded-full 
                                      border 
                                      transition-all 
                                      duration-200 
                                      disabled:bg-gray-100 
                                      disabled:border-gray-200 
                                      disabled:cursor-not-allowed 
                                      disabled:text-gray-400 
                                      bg-white 
                                      border-blue-200 
                                      hover:bg-blue-50 
                                      hover:border-blue-300 
                                      active:scale-95 
                                      shadow-sm 
                                      focus:outline-none 
                                      focus:ring-2 
                                      focus:ring-blue-500 
                                      focus:ring-offset-2 "
                        >
                          <Lucide icon="ChevronRight" className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="font-medium flex">
                          <button
                            type="button"
                            className="btn btn-primary ml-auto px-4 py-2 text-sm font-medium whitespace-nowra"
                            onClick={submitInterviewAnswers}
                            disabled={!areAllQuestionsAnswered()}
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isMcqEnable && (
        <Evaluation
          candidateId={interviewPayload.candidate_id}
          file_key={interviewPayload.fileName}
        />
      )}
    </>
  );
}

export default MCQ;
