import { Auth } from "aws-amplify";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import UserContext from "../../Context/UserContext";
import { Assessment } from "../PagesComponents/Assessment";
import { ChatBot } from "../PagesComponents/ChatBot";
import { Summary } from "../PagesComponents/Summary";
import VideoGallery from "../PagesComponents/VideoGallery";
import VideoPlayer from "../PagesComponents/VideoPlayer";
import { JSONdATA } from "../utils/Constant";

export const GenAIStack = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [statusOfInstance, setStatusOfInstance] = useState("InService");
  const [validUser, setValidUser] = useState(true); // Changed from false to true
  const [secretCode, setSecretCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };
  useEffect(() => {
    // // setLoader(true);
    // setTimeout(() => {
    //   // setLoader(false);
    // }, 2000);

    document.title = "Generative AI";
  }, [validUser]);

  const formatTitle = (title) => {
    let formattedTitle = title.replaceAll("__", " - ").replaceAll("_", " ");
    return formattedTitle;
  };
  const videos = Object.entries(JSONdATA).map(([title, sources], index) => {
    const formattedTitle = formatTitle(title);
    return {
      id: index + 1,
      title: formattedTitle,
      // thumbnail: `/genai/assets/videoCapture${index + 1}.png`,
      source: sources[0],
      transcription: sources[1],
      transcriptJson: sources[2],
      summary_uri: sources[3],
    };
  });

  useEffect(() => {
    document.title = "Generative AI";
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, []);

  return (
    <>
      {validUser ? (
        <div>
          <div className="flex flex-col sm:flex-row relative ">
            <div
              className={`w-full ${selectedVideo !== null && "sm:w-[30%]"} `}
            >
              <div className="md:py-10 lg:py-5 py-5 px-5 md:px-0 md:sticky md:top-2 md:left-0 ">
                <VideoGallery
                  videos={videos}
                  handleVideoClick={handleVideoClick}
                  selectedVideo={selectedVideo}
                />
              </div>
            </div>
            {selectedVideo !== null && (
              <div className="flex flex-col w-full  md:mt-6 sm:ml-5 md:pt-10">
                <div className="flex flex-col lg:flex-row xl:w-[100%] px-5 ">
                  {selectedVideo && (
                    <VideoPlayer
                      video={selectedVideo}
                      statusOfInstance={statusOfInstance}
                    />
                  )}
                  <ChatBot
                    selectedVideo={selectedVideo}
                    statusOfInstance={statusOfInstance}
                  />
                </div>
                <div className="flex lg:w-[60%] items-center text-center justify-center">
                  <h3 className="text-primary font-semibold">
                    {selectedVideo?.title}
                  </h3>
                </div>

                <div className="flex w-[100%] flex-col lg:flex-row px-5 grow">
                  <Summary
                    statusOfInstance={statusOfInstance}
                    selectedVideo={selectedVideo}
                  />
                  <Assessment
                    selectedVideo={selectedVideo}
                    statusOfInstance={statusOfInstance}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Commented out secret code UI
        null
        // <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
        //   <div className="bg-white p-5 flex flex-col w-1/3 h-auto box">
        //     <h1 className="text-center text-2xl font-semibold text-primary my-4">
        //       Please Enter Secret Code
        //     </h1>
        //     <div className="flex flex-col justify-center items-center mt-5">
        //       <input
        //         type="password"
        //         className="intro-x login__input form-control py-3 px-4 block my-2 xl:w-[22rem]"
        //         placeholder="Enter Secret Code"
        //         onChange={(e) => {
        //           setErrorMessage("");
        //           setSecretCode(e.target.value);
        //         }}
        //       />

        //       <button
        //         className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top my-5"
        //         onClick={() => {
        //           if (secretCode === "Cl0udTh@t4hpe2o24") {
        //             setValidUser(true);
        //           } else {
        //             setErrorMessage("Please enter valid secret code");
        //           }
        //         }}
        //       >
        //         Validate
        //       </button>
        //     </div>
        //     {errorMessage !== "" && (
        //       <p className="text-red-500 text-center">{errorMessage}</p>
        //     )}
        //   </div>
        // </div>
      )}
    </>
  );
};