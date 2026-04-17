import React, { useContext, useEffect, useState } from "react";
import fetchData from "../../config/ApiCall";
import UserContext from "../../Context/UserContext";
import { LoadingIcon } from "@/base-components";

export const Summary = ({ statusOfInstance, selectedVideo, type }) => {
  const [openAccordionIndex, setOpenAccordionIndex] = useState(-1);
  const [summary, setFullSummary] = useState(null);
  const [errorSummary, setErrorSummary] = useState("");
  const [loader, setLoader] = useState(false);
  const { userDetails } = useContext(UserContext);

  useEffect(() => {
    if (["No_Instance", "Deleting"].includes(statusOfInstance)) {
      setFullSummary("");
      setOpenAccordionIndex(-1);
    }
    setFullSummary("");
  }, [statusOfInstance, selectedVideo]);

  const handleAccordionToggle = (index) => {
    setOpenAccordionIndex((prevIndex) => (prevIndex === index ? -1 : index));
  };

  const handleGetSummary = async (video) => {
    if (statusOfInstance !== "InService") return;
    setFullSummary("");
    setErrorSummary("");
    setLoader(true);

    const payload = {
      transcript: video?.transcription ?? video?.transcriptJson,
      ...(type === "doc" && { source: "documents_resume" }),
    };

    const url = import.meta.env.VITE_RESUME_SUMMARY_URL;

    try {
      const response = await fetchData(payload, url);

      if (!response || response.statusCode !== 200) {
        throw new Error(response?.errorMessage || "Something went wrong.");
      }

      if (!response?.summary) {
        setErrorSummary("No summary available for this video/document.");
        setFullSummary("");
      } else {
        setFullSummary(response);
      }
    } catch (error) {
      setErrorSummary(
        error.message || "Server is busy. Please try again later."
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <div
      className={`${
        type === "doc" ? "lg:w-full" : "lg:w-[60%]"
      } w-full lg:max-h-[600px] max-h-[800px] overflow-y-scroll bg-white rounded-lg p-5 lg:m-5 my-5`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between mb-2">
        <h1 className="text-primary lg:text-xl text-lg p-2">
          Recommended Job for the Profile
        </h1>
        {statusOfInstance === "InService" && (
          <button
            className="btn btn-primary py-3 px-4 w-full xl:w-auto xl:mr-3 my-5 whitespace-nowrap disabled:cursor-not-allowed"
            onClick={() => handleGetSummary(selectedVideo)}
            disabled={
              ["Creating", "No_Instance", "Failed"].includes(
                statusOfInstance
              ) || !userDetails
            }
          >
            Get Job Recommendation
          </button>
        )}
      </div>

      {summary ? (
        <>
          <Accordion
            title="Full Summary"
            content={summary.summary}
            error={errorSummary}
            isOpen={openAccordionIndex === 0}
            index={0}
            onToggle={handleAccordionToggle}
          />
          {/* {summary?.topics?.length === summary?.explains?.length &&
            summary.topics.map((topic, index) => (
              <Accordion
                key={index}
                title={`Skill ${index + 1} - ${topic}`}
                content={summary.explains[index]}
                isOpen={openAccordionIndex === index + 1}
                index={index + 1}
                onToggle={handleAccordionToggle}
              />
            ))} */}
        </>
      ) : (
        <>
          {errorSummary && (
            <p className="text-primary p-2 text-center">{errorSummary}</p>
          )}

          {!errorSummary && (
            <div className="text-primary w-full flex flex-col justify-center items-center text-center">
              {statusOfInstance === "Creating" && (
                <>
                  <p>Instance is being created...</p>
                  <p>Please wait, this may take some time.</p>
                </>
              )}
              {statusOfInstance === "No_Instance" && (
                <p>
                  Currently infrastructure is not up and running, please contact
                  CloudThat team to see the demo.
                </p>
              )}
              {statusOfInstance === "Deleting" && (
                <>
                  <p>Instance is being deleted...</p>
                  <p>Please wait, this may take some time.</p>
                </>
              )}
              {loader && (
                <div className="flex flex-col items-center justify-center w-full">
                  <LoadingIcon
                    icon="spinning-circles"
                    className="w-8 h-8 my-2"
                  />
                  <p className="mt-2">Generating Summary...</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Accordion = ({ title, content, error, isOpen, index, onToggle }) => {
  return (
    <div className="accordion border-opacity-50">
      <div
        className="accordion-header text-white bg-primary cursor-pointer p-3 font-semibold"
        onClick={() => onToggle(index)}
      >
        {title}
      </div>
      {isOpen && (
        <div className="accordion-content max-h-[300px] overflow-y-auto text-primary text-sm px-2 bg-slate-100 py-3">
          {content ? (
            <p>{content}</p>
          ) : (
            <LoadingIcon icon="spinning-circles" className="w-8 h-8 my-2" />
          )}
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Accordion;
