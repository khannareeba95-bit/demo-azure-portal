import React, { useEffect, useState } from "react";
import { Loader } from "./Assessment";
import fetchData from "../../config/ApiCall";
import { LoadingIcon } from "@/base-components";

export const Summary = ({
  statusOfInstance,
  selectedVideo,
  selectedChapter,
}) => {
  const [openAccordionIndex, setOpenAccordionIndex] = useState(-1);
  const [summary, setFullsummary] = useState("");
  const [errorSummary, seterrorSummary] = useState(false);
  const [loader, setLoader] = useState(false);
  const [chapterSummary, setChapterSummary] = useState("");

  const handleAccordionToggle = (index) => {
    setOpenAccordionIndex(index === openAccordionIndex ? -1 : index);
  };
  useEffect(() => {
    if (statusOfInstance === "No_Instance" || statusOfInstance === "Deleting") {
      setFullsummary("");
      setChapterSummary("");
      setOpenAccordionIndex(-1);
    }
    setFullsummary("");
    setChapterSummary("");
    setOpenAccordionIndex(-1);
  }, [statusOfInstance, selectedVideo]);

  const handleGetSummary = async (video) => {
    let response;
    try {
      if (statusOfInstance === "InService") {
        seterrorSummary("");
        setFullsummary("");
        setChapterSummary("");
        setLoader(true);
        setOpenAccordionIndex(-1);
        let payload = {
          transcript: video?.transcription,
          model: "Anthropic",
          source: "ntt",
        };
        const url =
          "https://bbkntblet9.execute-api.ap-south-1.amazonaws.com/devvv/ntt";
        // "https://nr2fef150c.execute-api.ap-south-1.amazonaws.com/devvv/ntt";
        response = await fetchData(payload, url);
        if (response && response?.statusCode === 200) {
          setFullsummary(response);
        } else if (response?.errorMessage || response?.message) {
          seterrorSummary("Something went wrong..");
        }
      }
    } catch (error) {
      if (!response) {
        seterrorSummary(
          "Oops! It seems our servers are busy at the moment. Please try again in a few moments."
        );
      } else {
        seterrorSummary("Something went wrong..");
      }
    } finally {
      setLoader(false);
    }
  };
  const handleSummarizeChapter = async (chapter) => {
    let response;
    try {
      if (statusOfInstance === "InService") {
        seterrorSummary("");
        setFullsummary("");
        setChapterSummary("");
        setLoader(true);
        setOpenAccordionIndex(-1);
        let payload = {
          transcript: chapter?.chapter_transcript,
          model: "Anthropic",
          source: "ntt",
        };

        const url =
          "https://axkxmeog6d.execute-api.ap-south-1.amazonaws.com/dev/ntt-bedrock-summarize";
        // "https://ji5x16rpzj.execute-api.ap-south-1.amazonaws.com/dev/ntt-bedrock-summarize";
        response = await fetchData(payload, url);
        if (response && response?.statusCode === 200) {
          setChapterSummary(response);
        } else if (response?.errorMessage || response?.message) {
          seterrorSummary("Something went wrong..");
        }
      }
    } catch (error) {
      if (!response) {
        seterrorSummary(
          "Oops! It seems our servers are busy at the moment. Please try again in a few moments."
        );
      } else {
        seterrorSummary("Something went wrong..");
      }
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="lg:w-[60%] w-full lg:max-h-[400px] self-start max-h-[800px] overflow-y-scroll bg-white rounded-lg p-5 lg:m-5 my-5">
      <div className="flex flex-col md:flex-row items-center justify-between mb-2  w-full">
        <h1 className="text-primary lg:text-xl text-lg font-semibold p-2">
          Summary of the video
        </h1>
        {statusOfInstance === "InService" && (
          <div class="flex md:flex-row flex-col justify-end items-center gap-2">
            <button
              className="disabled:cursor-not-allowed btn btn-primary py-3 px-4 w-full xl:w-auto xl:mr-3 align-top my-5 whitespace-nowrap"
              onClick={() => handleGetSummary(selectedVideo)}
              disabled={
                statusOfInstance === "Creating" ||
                statusOfInstance == "No_Instance" ||
                statusOfInstance === "Failed" ||
                !selectedVideo
              }
            >
              Generate Summary
            </button>
            <button
              className="disabled:cursor-not-allowed btn btn-primary py-3 px-4 w-full xl:w-auto xl:mr-3 align-top my-5 whitespace-nowrap"
              onClick={() => handleSummarizeChapter(selectedChapter)}
              disabled={
                statusOfInstance === "Creating" ||
                statusOfInstance == "No_Instance" ||
                statusOfInstance === "Failed"
              }
            >
              Summarize Chapter
            </button>
          </div>
        )}
      </div>
      {summary || chapterSummary ? (
        <>
          {chapterSummary && (
            <>
              <Accordion
                title="Full Chapter Summary"
                content={chapterSummary?.summary}
                error={errorSummary}
                isOpen={openAccordionIndex === 0}
                index={0}
                onToggle={handleAccordionToggle}
              />
            </>
          )}
          {summary && (
            <>
              <Accordion
                title="Full Summary"
                content={summary?.summary}
                error={errorSummary}
                isOpen={openAccordionIndex === 0}
                index={0}
                onToggle={handleAccordionToggle}
              />

              {summary &&
                summary?.topics &&
                summary?.explains &&
                summary?.topics?.length === summary?.explains?.length &&
                summary?.topics?.map((topic, index) => (
                  <Accordion
                    key={index}
                    title={`Topic ${index + 1} - ${topic}`}
                    content={summary?.explains[index]}
                    isOpen={openAccordionIndex === index + 1}
                    index={index + 1}
                    onToggle={handleAccordionToggle}
                  />
                ))}
            </>
          )}
        </>
      ) : errorSummary ? (
        <p className="text-primary p-2 text-center">{errorSummary}</p>
      ) : (
        <>
          {statusOfInstance === "Creating" ? (
            <div class="text-primary w-full flex flex-col justify-center items-center text-center">
              <p>Instance is being created...</p>
              <p>Please wait, this may take some time.</p>
            </div>
          ) : statusOfInstance === "No_Instance" ? (
            <div class="text-primary w-full flex flex-col justify-center items-center  text-center">
              <p>
                Currently infrastructure is not up and running, please contact
                cloudthat team to see the demo{" "}
              </p>
            </div>
          ) : statusOfInstance === "Deleting" ? (
            <div class="text-primary w-full flex flex-col justify-center items-center  text-center">
              <p>Instance is being deleted...</p>
              <p>Please wait, this may take some time.</p>
            </div>
          ) : (
            loader && (
              <div className="flex flex-col items-center justify-center w-full">
                <LoadingIcon icon="spinning-circles" className="w-8 h-8 my-2" />
                <div className="mt-2 text-primary">Generating Summary</div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

const Accordion = ({ title, content, error, isOpen, index, onToggle }) => {
  const handleToggle = () => {
    onToggle(index);
  };

  return (
    <div
      className={`accordion max-h-[200px] overflow-y-scroll overflow-hidden border-opacity-50 ${
        isOpen ? "open" : ""
      }`}
    >
      <div
        className="accordion-header text-white bg-primary"
        onClick={handleToggle}
      >
        <h3 className="accordion-title lg:font-bold text-base font-semibold">
          {title}
        </h3>
        <span className={`accordion-arrow ${isOpen ? "open" : ""}`}>
          &#9662;
        </span>
      </div>
      <div
        className={`accordion-content text-primary text-sm md:text-base px-2 bg-slate-100 ${
          isOpen ? "py-2" : ""
        }`}
      >
        {!content ? (
          <div className="">
            <div className="flex flex-col items-center justify-center w-full">
              <LoadingIcon icon="spinning-circles" className="w-8 h-8 my-2" />
            </div>
          </div>
        ) : (
          <p>{content}</p>
        )}
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default Accordion;
