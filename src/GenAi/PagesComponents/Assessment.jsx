import React, { useContext, useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import fetchData from "../../config/ApiCall";
import UserContext from "../../Context/UserContext";
import { LoadingIcon } from "@/base-components";

export const Assessment = ({
  selectedVideo,
  statusOfInstance,
  type,
  selectedOption,
}) => {
  const { userDetails } = useContext(UserContext);
  const [loader, setLoader] = useState(false);
  const [assessmentRes, setAssessmentRes] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPagination, setShowPagination] = useState(false);

  const handleToggleAns = (index) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, toggleAns: !q.toggleAns } : q))
    );
  };

  const handleGetAssessment = async () => {
    setErrorMessage("");
    setLoader(true);
    setCurrentPage(1);
    setShowPagination(false);

    try {
      let payload = {
        transcript:
          type === "doc"
            ? selectedVideo?.transcription
            : selectedVideo?.transcriptJson || selectedVideo?.transcription,
        source:
          selectedOption?.value === "math"
            ? "mcq"
            : type === "doc"
            ? "documents"
            : undefined,
        flag:
          selectedOption?.value !== "en" ? selectedOption?.value : undefined,
      };

      const url =
        selectedOption?.value === "math"
          ? "https://dirts2is1b.execute-api.us-west-2.amazonaws.com/dev/mathematics-cloudthat-demos"
          : "https://nfbzmob411.execute-api.ap-south-1.amazonaws.com/v1/MCQ";

      const response = await fetchData(payload, url);

      if (!response || response?.statusCode !== 200) {
        throw new Error("Something went wrong.");
      }

      setAssessmentRes(response);
      setQuestions(
        response?.type === "MCQ"
          ? Object.entries(response?.questions || {}).map(
              ([question, options]) => ({
                question,
                options,
                answer: response?.answer?.[0] || "",
                type: "MCQ",
                toggleAns: false,
              })
            )
          : response?.type === "Wh" || response?.type === "TF"
          ? Object.entries(response?.Output || {}).map(
              ([question, answer]) => ({
                question,
                answer,
                type: response.type,
                toggleAns: false,
              })
            )
          : Object.entries(response?.questions || {}).map(
              ([question, options], index) => ({
                question,
                options,
                answer: response?.solutions?.[index] || "",
                toggleAns: false,
              })
            )
      );
    } catch (error) {
      setErrorMessage(
        "Oops! It seems our servers are busy. Please try again later."
      );
    } finally {
      setLoader(false);
      setShowPagination(true);
    }
  };

  useEffect(() => {
    setAssessmentRes(null);
    setQuestions([]);
    setErrorMessage("");
    setShowPagination(false);
  }, [selectedVideo]);

  return (
    <div
      className={`bg-white self-start ${
        selectedOption?.value === "math" ? "max-h-[400px]" : "h-auto"
      } lg:w-[50%] xl:w-[55%] 2xl:w-[55%] w-full flex flex-col p-5 lg:m-5 my-5 rounded-lg shadow-md`}
    >
      <div className="flex md:flex-row flex-col items-center justify-between">
        <h1 className="text-primary lg:text-xl text-lg p-2">Assessment</h1>
        {statusOfInstance === "InService" && (
          <button
            className="disabled:cursor-not-allowed btn btn-primary py-3 px-4 w-full xl:w-auto xl:mr-3 align-top my-5 whitespace-nowrap"
            onClick={handleGetAssessment}
            disabled={
              !userDetails ||
              ["Creating", "No_Instance"].includes(statusOfInstance)
            }
          >
            Generate Assessment
          </button>
        )}
        {statusOfInstance === "Creating" && (
          <StatusMessage message="Instance is being created..." />
        )}
        {statusOfInstance === "No_Instance" && (
          <StatusMessage message="Infrastructure is not running. Please contact the CloudThat team for a demo." />
        )}
        {statusOfInstance === "Deleting" && (
          <StatusMessage message="Instance is being deleted..." />
        )}
      </div>

      <div
        className={`${
          (assessmentRes || errorMessage) &&
          "border border-primary border-opacity-20 p-4 my-2 pb-4 rounded-lg"
        } ${loader && "border-none"}`}
      >
        {loader ? (
          <LoadingSection />
        ) : errorMessage ? (
          <ErrorMessage message={errorMessage} />
        ) : (
          assessmentRes && (
            <>
              {selectedOption?.value === "math" ? (
                <MathAssessmentQuestionAnswers
                  questions={questions}
                  currentPage={currentPage}
                  handleToggleAns={handleToggleAns}
                />
              ) : (
                <QuestionAnswers
                  questions={questions}
                  currentPage={currentPage}
                  handleToggleAns={handleToggleAns}
                />
              )}
            </>
          )
        )}
      </div>

      {showPagination && assessmentRes && (
        <PaginationControls
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={questions.length}
        />
      )}
    </div>
  );
};

const StatusMessage = ({ message }) => (
  <div className="text-primary w-full flex flex-col justify-center items-center text-center">
    <p>{message}</p>
  </div>
);

const LoadingSection = () => (
  <div className="flex flex-col items-center justify-center w-full">
    <LoadingIcon icon="spinning-circles" className="w-8 h-8 my-2" />
    <div className="mt-2 text-primary">Generating Assessment</div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex w-full items-center justify-center">
    <p className="text-primary text-sm text-center">
      {message.includes("408") || message.includes("504")
        ? "Something went wrong. Please try again later."
        : message}
    </p>
  </div>
);

const PaginationControls = ({ currentPage, setCurrentPage, totalPages }) => (
  <div className="flex items-center gap-2 justify-end mt-auto flex-shrink-0">
    <PaginationButton
      direction="prev"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
    />
    <span className="text-primary text-center flex-shrink-0">{`${currentPage}/${totalPages}`}</span>
    <PaginationButton
      direction="next"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => prev + 1)}
    />
  </div>
);

const PaginationButton = ({ direction, disabled, onClick }) => (
  <div
    onClick={!disabled ? onClick : undefined}
    className={`bg-primary ${
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
    } rounded-full flex items-center justify-center h-[40px] w-[40px]`}
  >
    {direction === "prev" ? (
      <IoIosArrowBack className="text-white text-2xl" />
    ) : (
      <IoIosArrowForward className="text-white text-2xl" />
    )}
  </div>
);

const QuestionAnswers = ({ questions, currentPage, handleToggleAns }) => {
  return (
    <>
      {questions.length > 0 && (
        <div className="max-h-[200px] overflow-y-auto custom-scrollbar-assess">
          <p className="mt-2 text-primary font-sans text-base font-semibold">
            {questions[currentPage - 1]?.question}
          </p>

          {questions[currentPage - 1]?.options && (
            <ul className="mt-2">
              {questions[currentPage - 1].options.map((option, index) => (
                <li key={index} className="mt-1">
                  {option}
                </li>
              ))}
            </ul>
          )}

          <button
            className="btn btn-primary py-3 px-4 w-full xl:w-auto xl:mr-3 align-top my-5 whitespace-nowrap"
            onClick={() => handleToggleAns(currentPage - 1)}
          >
            {questions[currentPage - 1].toggleAns
              ? "Hide Solution"
              : "Reveal Solution"}
          </button>

          {questions[currentPage - 1].toggleAns && (
            <p className="mt-2 bg-primary text-white p-3 rounded-lg whitespace-pre-line">
              {questions[currentPage - 1].answer.trim()}
            </p>
          )}
        </div>
      )}
    </>
  );
};

const MathAssessmentQuestionAnswers = ({
  questions,
  currentPage,
  handleToggleAns,
}) => {
  return (
    <div className="max-h-[200px] overflow-y-auto custom-scrollbar-assess">
      <p className="mt-2 text-primary font-sans text-base font-semibold">
        {questions[currentPage - 1]?.question}
      </p>

      {questions[currentPage - 1]?.options && (
        <ul className="mt-2">
          {questions[currentPage - 1].options.map((option, index) => (
            <li key={index} className="mt-1">
              {option.replace(/"/g, "")}
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn btn-primary py-3 px-4 w-full xl:w-auto xl:mr-3 align-top my-5 whitespace-nowrap"
        onClick={() => handleToggleAns(currentPage - 1)}
      >
        {questions[currentPage - 1].toggleAns
          ? "Hide Solution"
          : "Reveal Solution"}
      </button>

      {questions[currentPage - 1].toggleAns && (
        <pre className="whitespace-pre-wrap break-words overflow-hidden font-sans bg-primary text-white p-3 rounded-lg">
          {questions[currentPage - 1].answer}
        </pre>
      )}
    </div>
  );
};
