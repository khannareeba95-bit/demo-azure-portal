import { Auth } from "aws-amplify";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import UserContext from "../../Context/UserContext";
import { Assessment } from "../PagesComponentsResume/Assessment";
import { ChatBot } from "../PagesComponentsResume/ChatBot";
import { Summary } from "../PagesComponentsResume/Summary";
import VideoGallery from "../PagesComponentsResume/VideoGallery";
import VideoPlayer from "../PagesComponentsResume/VideoPlayer";
import { JSONdATA } from "../utils/GenAiResume.js";
import DocRead from "../PagesComponentsResume/DocRead";
import Lucide from "../../base-components/lucide/index";

function GenAIResumes() {
  const { userDetails, userState, setUserState } = useContext(UserContext);
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loader, setLoader] = useState(false);
  const [statusOfInstance, setStatusOfInstance] = useState("InService");

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

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
    };
  });

  useEffect(() => {
    document.title = "Generative AI";
    window.localStorage.setItem("currentPage", window.location.pathname);
    setSelectedVideo(videos[0]);
  }, []);
  const data = [
    {
      title: "Documents",
    },
    {
      title: "Videos",
    },
  ];

  return (
    <>
      <div className="flex w-full flex-col items-start justify-start">
        <div className="flex flex-col items-start text-left mb-1">
          <h1 className="fixed top-8 left-20 text-2xl text-[#1a3b8b] font-bold z-50">
            GenAI Resumes
          </h1>
        </div>
      </div>
      <Lucide
        icon="ArrowLeftCircle"
        className="w-10 h-10 cursor-pointer my-5 mx-5"
        onClick={() => {
          navigate("/");
        }}
      />
      {loader && <Loading />}

      <div className="flex flex-col sm:flex-row relative ">
        <div className={`w-full ${selectedVideo !== null && "sm:w-[30%]"} `}>
          <div className="md:py-10 lg:py-5 py-5 px-5 md:px-0 md:sticky md:top-2 md:left-0 ">
            <VideoGallery
              videos={videos}
              handleVideoClick={handleVideoClick}
              selectedVideo={selectedVideo}
              type="doc"
            />
          </div>
        </div>

        {selectedVideo !== null && (
          <div className="flex flex-row w-full  md:mt-6 sm:ml-5 md:pt-10">
            <div className="flex flex-col  w-[60%] px-5  ">
              {selectedVideo && (
                <DocRead
                  video={selectedVideo}
                  statusOfInstance={statusOfInstance}
                />
              )}
              <div className="flex  items-center text-center justify-center">
                <h3 className="text-primary">{selectedVideo?.title}</h3>
              </div>
              <Summary
                statusOfInstance={statusOfInstance}
                selectedVideo={selectedVideo}
                type="doc"
              />
            </div>

            <div className="flex w-[40%] flex-col lg:flex-row px-5 grow ">
              <ChatBot
                selectedVideo={selectedVideo}
                statusOfInstance={statusOfInstance}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default GenAIResumes;
