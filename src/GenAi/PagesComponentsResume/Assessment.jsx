import React, { useContext, useEffect, useState, useRef } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import fetchData from "../../config/ApiCall";
import UserContext from "../../Context/UserContext";

export const Assessment = ({ selectedVideo, statusOfInstance, type }) => {
  const { userDetails } = useContext(UserContext);
  const [loader, setLoader] = useState(false);
  const [assessmentRes, setAssessmentRes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const chatAreaRef = useRef(null);

  const handleToggleAns = (index) => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }

    const newQuestions = [...questions];
    newQuestions[index].toggleAns = !newQuestions[index].toggleAns;
    setQuestions(newQuestions);
  };
  const handleGetAssessment = async (selectedVideo) => {
    let response;
    try {
      setErrorMessage("");
      setLoader(true);

      let payload;
      if (type === "doc") {
        payload = {
          transcript: selectedVideo?.transcription,
          source: "documents_resume",
        };
      } else {
        payload = {
          transcript: selectedVideo?.transcriptJson,
        };
      }

      const url =
        "https://ao9cdug7dd.execute-api.ap-south-1.amazonaws.com/dev/";

      response = await fetchData(payload, url);
      if (response && response?.statusCode === 200 && response !== null) {
        setLoader(false);
        setAssessmentRes(response);
        if (response?.type === "Wh" || response?.type === "TF") {
          const newQuestions = Object.keys(response?.Output).map(
            (question) => ({
              question,
              answer: response?.Output[question],
              type: response?.type,
              toggleAns: false,
            })
          );
          setQuestions(newQuestions);
        } else if (response?.type === "MCQ") {
          const newQuestions = Object.keys(response?.questions).map(
            (question) => ({
              question,
              answer: response?.answer[0],
              type: response?.type,
              options: response?.questions[question],
              toggleAns: false,
            })
          );
          setQuestions(newQuestions);
        }
      } else if (response?.errorMessage || response === null) {
        setLoader(false);
        setErrorMessage("Something went wrong..");
      }
    } catch (error) {
      console.log("error", error);
      setLoader(false);
      if (!response) {
        setErrorMessage(
          "Oops! It seems our servers are busy at the moment. Please try again in a few moments."
        );
      } else {
        setErrorMessage("Something went wrong..");
      }
    }
  };
  useEffect(() => {
    setAssessmentRes("");
    setQuestions([]);
  }, [selectedVideo]);
  return (
    <div className="bg-white self-start h-auto lg:w-[40%] w-full flex flex-col p-5 lg:m-5 my-5 rounded-lg">
      <div class="flex md:flex-row flex-col items-center justify-between">
        <h1 className="text-primary lg:text-xl text-lg p-2">Assessment</h1>
        {statusOfInstance === "InService" && (
          <button
            className="disabled:cursor-not-allowed rounded-md w-auto flex items-center hover:scale-110 duration-300 hover:duration-300 bg-[#0056cd] text-primary shadow-2xl justify-center ring-0 focus:outline-0 border-none"
            onClick={() => handleGetAssessment(selectedVideo)}
            disabled={
              !userDetails ||
              statusOfInstance === "Creating" ||
              statusOfInstance === "No_Instance"
            }
          >
            Generate Assessment
          </button>
        )}
        {statusOfInstance === "Creating" && (
          <div className="text-primary w-full flex flex-col justify-center items-center text-center">
            <p>Instance is being created...</p>
            <p>Please wait, this may take some time.</p>
          </div>
        )}
        {statusOfInstance === "No_Instance" && (
          <div className="text-primary w-full flex flex-col justify-center items-center text-center">
            <p>
              Currently infrastructure is not up and running, please contact
              cloudthat team to see the demo
            </p>
          </div>
        )}
        {statusOfInstance === "Deleting" && (
          <div className="text-primary w-full flex flex-col justify-center items-center text-center">
            <p>Instance is being deleted...</p>
            <p>Please wait, this may take some time.</p>
          </div>
        )}
      </div>
      <div
        className={`${
          (assessmentRes || errorMessage) &&
          `border border-primary border-opacity-20  p-4 flex  my-2  pb-4  ${
            type === "doc" ? "max-h-[160px] overflow-y-auto" : ""
          }`
        }  rounded-lg  ${loader && "border-none"}`}
      >
        {loader && (
          <div className="flex flex-col items-center justify-center w-full">
            <LoadingIcon icon="spinning-circles" className="w-8 h-8 my-2" />
            <div className="mt-2 text-primary">Generating Assessment</div>
          </div>
        )}
        {errorMessage ? (
          <div className="flex w-full items-center justify-center">
            <p className="text-primary text-sm text-center">
              {errorMessage === "408" || errorMessage === "504"
                ? "Something went wrong. Please try again later."
                : errorMessage}
            </p>
          </div>
        ) : (
          <>
            {!loader && assessmentRes && (
              <QuestionAnswers
                questions={questions}
                currentPage={currentPage}
                handleToggleAns={handleToggleAns}
                assessmentRes={assessmentRes}
                selectedVideo={selectedVideo}
                chatAreaRef={chatAreaRef}
              />
            )}
          </>
        )}
      </div>
      {assessmentRes &&
        (assessmentRes?.type === "Wh" || assessmentRes?.type === "TF") && (
          <div className="flex items-center gap-2 justify-end mt-auto flex-shrink-0">
            <div
              onClick={() => {
                if (currentPage === 1) return;
                else setCurrentPage((prev) => prev - 1);
              }}
              className={`bg-[#303d5d] ${
                currentPage === 1 ? "cursor-not-allowed" : "pointer"
              } rounded-full flex items-center justify-center cursor-pointer h-[40px] w-[40px] flex-shrink-0`}
            >
              <IoIosArrowBack className="text-white text-2xl" />
            </div>
            <span className="text-primary text-center flex-shrink-0">{`${currentPage}/${questions?.length}`}</span>
            <div
              onClick={() => {
                if (currentPage === questions?.length) return;
                else setCurrentPage((prev) => prev + 1);
              }}
              className={`bg-[#303d5d] ${
                currentPage === questions?.length
                  ? "cursor-not-allowed"
                  : "pointer"
              } rounded-full flex items-center justify-center cursor-pointer h-[40px] w-[40px] flex-shrink-0`}
            >
              <IoIosArrowForward className="text-white text-2xl" />
            </div>
          </div>
        )}
      {assessmentRes && assessmentRes?.type === "MCQ" && (
        <div className="flex items-center gap-2 justify-end mt-auto flex-shrink-0">
          <div
            onClick={() => {
              if (currentPage === 1) return;
              else setCurrentPage((prev) => prev - 1);
            }}
            className={`bg-[#303d5d] ${
              currentPage === 1 ? "cursor-not-allowed" : "pointer"
            } rounded-full flex items-center justify-center cursor-pointer h-[40px] w-[40px] flex-shrink-0`}
          >
            <IoIosArrowBack className="text-primary text-2xl" />
          </div>
          <span className="text-primary text-center flex-shrink-0">{`${currentPage}/${questions?.length}`}</span>
          <div
            onClick={() => {
              if (currentPage === questions?.length) return;
              else setCurrentPage((prev) => prev + 1);
            }}
            className={`bg-[#303d5d] ${
              currentPage === questions?.length
                ? "cursor-not-allowed"
                : "pointer"
            } rounded-full flex items-center justify-center cursor-pointer h-[40px] w-[40px] flex-shrink-0`}
          >
            <IoIosArrowForward className="text-primary text-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
const QuestionAnswers = ({
  questions,
  currentPage,
  handleToggleAns,
  assessmentRes,
  selectedVideo,
  chatAreaRef,
}) => {
  return (
    <>
      {questions?.map((q, i) => (
        <QuestionAnswer
          key={i}
          q={q}
          index={i}
          currentPage={currentPage}
          handleToggleAns={handleToggleAns}
          assessmentRes={assessmentRes}
          selectedVideo={selectedVideo}
          chatAreaRef={chatAreaRef}
        />
      ))}
    </>
  );
};

const QuestionAnswer = ({
  q,
  index,
  currentPage,
  handleToggleAns,
  assessmentRes,
  selectedVideo,
  chatAreaRef,
}) => {
  const { question, options, answer, type, toggleAns } = q;
  return (
    index + 1 === currentPage && (
      <div
        ref={chatAreaRef}
        className="min-w-full max-h-[300px] overflow-y-scroll custom-scrollbar-assess"
      >
        <p className="text-primary text-base p-2 bg-slate-100 box">
          {question}
        </p>
        {type === "MCQ" && (
          <div class=" overflow-x-hidden overflow-y-scroll custom-scrollbar-assess p-2">
            {options?.map((option, optionIndex) => (
              <label key={option} className="text-primary text-sm mb-1 mr-2">
                {option}
                <br />
              </label>
            ))}
          </div>
        )}
        {type === "TF" && (
          <div class="p-2">
            <ol
              className="list-[upper-alpha] pl-4"
              style={{ color: "white", listStyleType: "" }}
            >
              <li class="text-primary">True</li>
              <li class="text-primary">False</li>
            </ol>
          </div>
        )}
        <button
          className="btn btn-primary py-3 px-4 w-full xl:w-auto xl:mr-3 align-top my-5 whitespace-nowrap"
          id="send-btn"
          onClick={() => handleToggleAns(index)}
        >
          Reveal Solution{" "}
          <span
            className={`accordion-arrow transform transition-transform duration-300 ${
              toggleAns ? "rotate-180" : ""
            }`}
          >
            &#9662;
          </span>
        </button>
        {toggleAns && (
          <div
            className={`answer-section text-white text-sm mr-[10px] bg-primary my-2 py-3 px-3 rounded-lg ${
              toggleAns ? "overflow-y-auto max-h-[100px]" : ""
            }`}
            style={{
              opacity: toggleAns ? "1" : "0",
              transition: "max-height 0.8s ease, opacity 0.5s ease",
            }}
          >
            Answer: {answer}
          </div>
        )}
      </div>
    )
  );
};
export const Loader = ({ prompt }) => {
  return (
    <div className=" w-full h-full flex flex-col justify-center  items-center mx-auto">
      <div className="three-body ">
        <div className={`three-body__dot`}></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
      <div className="text-primary">{prompt}</div>
    </div>
  );
};
