import React, { useContext, useEffect, useState, useCallback } from "react";
import fetchData from "../../config/ApiCall";
import UserContext from "../../Context/UserContext";
import { LoadingIcon } from "@/base-components";

const Accordion = ({ title, content, error, isOpen, index, onToggle }) => {
  return (
    <div className={`accordion border-opacity-50 ${isOpen ? "open" : ""}`}>
      <div
        className="accordion-header text-white bg-primary"
        onClick={() => onToggle(index)}
      >
        <h3 className="accordion-title lg:font-bold text-base">{title}</h3>
        <span className={`accordion-arrow ${isOpen ? "open" : ""}`}>
          {" "}
          &#9662;{" "}
        </span>
      </div>
      <div
        className={`accordion-content h-auto overflow-y-auto text-primary text-sm md:text-base px-2 bg-slate-100 ${
          isOpen ? "py-2" : ""
        }`}
      >
        {!content ? (
          <div className="flex flex-col items-center justify-center w-full">
            <LoadingIcon icon="spinning-circles" className="w-8 h-8 my-2" />
          </div>
        ) : (
          <p>{content}</p>
        )}
        {error && <p className="text-primary">{error}</p>}
      </div>
    </div>
  );
};

export const Summary = ({ statusOfInstance, selectedVideo }) => {
  const [openAccordionIndex, setOpenAccordionIndex] = useState(-1);
  const [summary, setFullSummary] = useState("");
  const [errorSummary, setErrorSummary] = useState("");
  const [loader, setLoader] = useState(false);
  const { userDetails } = useContext(UserContext);

  const handleAccordionToggle = (index) => {
    setOpenAccordionIndex(index === openAccordionIndex ? -1 : index);
  };

  const clearSummaryState = useCallback(() => {
    setFullSummary("");
    setErrorSummary("");
  }, []);

  useEffect(() => {
    if (statusOfInstance === "No_Instance" || statusOfInstance === "Deleting") {
      clearSummaryState();
    }
  }, [statusOfInstance, selectedVideo, clearSummaryState]);

  const handleGetSummary = async (video) => {
    clearSummaryState();
    if (statusOfInstance !== "InService") return;
    setLoader(true);
    try {
      let payload = {
        transcript: video?.transcriptJson,
        source: "hpe",
      };
      const url =
        "https://nfbzmob411.execute-api.ap-south-1.amazonaws.com/v1/summarisation";
      const response = await fetchData(payload, url);

      if (!response || response?.statusCode !== 200 || !response?.summary) {
        handleError(response);
        setFullSummary("");
      } else {
        setFullSummary(response);
      }
    } catch (error) {
      setErrorSummary(
        "Oops! It seems our servers are busy at the moment. Please try again in a few moments."
      );
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    setFullSummary("");
    setErrorSummary("");
  }, [selectedVideo]);

  const handleError = (response) => {
    if (response === null) {
      setErrorSummary(
        "Received no response from the server. Please try again later."
      );
    } else if (response?.statusCode === 500) {
      setErrorSummary(
        "Oops! It seems our servers are busy. Please try again later."
      );
    } else if (response?.errorMessage) {
      setErrorSummary("Something went wrong. Please try again later.");
    } else {
      setErrorSummary(
        "No summary available at the moment. Please try again later."
      );
    }
  };

  const renderInstanceStatus = () => {
    const statusMessages = {
      Creating:
        "Instance is being created... Please wait, this may take some time.",
      No_Instance:
        "Currently infrastructure is not up and running, please contact the cloudthat team to see the demo.",
      Deleting:
        "Instance is being deleted... Please wait, this may take some time.",
    };
    return (
      statusMessages[statusOfInstance] && (
        <div className="text-primary w-full flex flex-col justify-center items-center text-center">
          <p>{statusMessages[statusOfInstance]}</p>
        </div>
      )
    );
  };

  return (
    <div className="lg:w-[60%] w-full lg:max-h-[600px] self-start max-h-[800px] overflow-y-scroll bg-white rounded-lg p-5 lg:m-5 my-5">
      <div
        className={`flex flex-col md:flex-row items-center justify-between ${
          summary && "mb-2"
        }`}
      >
        <h1 className="text-primary lg:text-xl text-lg p-2">
          Summary of the video
        </h1>
        {statusOfInstance === "InService" && (
          <button
            className="disabled:cursor-not-allowed btn btn-primary py-3 px-4 w-full xl:w-auto xl:mr-3 align-top my-5 whitespace-nowrap"
            onClick={() => handleGetSummary(selectedVideo)}
            disabled={
              statusOfInstance === "Creating" ||
              statusOfInstance === "No_Instance" ||
              statusOfInstance === "Failed" ||
              !userDetails
            }
          >
            Generate Summary
          </button>
        )}
      </div>

      {summary ? (
        <>
          {summary?.summary && (
            <Accordion
              title="Full Summary"
              content={summary?.summary}
              error={errorSummary}
              isOpen={openAccordionIndex === 0}
              index={0}
              onToggle={handleAccordionToggle}
            />
          )}
          {summary?.topics &&
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
      ) : errorSummary ? (
        <p className="text-primary p-2 text-center border border-primary border-opacity-20 rounded-lg">
          {errorSummary}
        </p>
      ) : loader ? (
        <div className="flex flex-col items-center justify-center w-full">
          <LoadingIcon icon="spinning-circles" className="w-8 h-8 my-2" />
          <div className="mt-2 text-primary">Generating Summary</div>
        </div>
      ) : (
        renderInstanceStatus()
      )}
    </div>
  );
};
