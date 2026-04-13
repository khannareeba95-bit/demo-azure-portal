import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import { Assessment } from "../PagesComponents/Assessment";
import { ChatBot } from "../PagesComponents/ChatBot";
import Overlay from "../PagesComponents/Overlay";
import { Summary } from "../PagesComponents/Summary";
import VideoGallery from "../PagesComponents/VideoGallery";
import VideoPlayer from "../PagesComponents/VideoPlayer";
import { JSONdATA } from "../utils/Constant";
import Lucide from "../../base-components/lucide";
import { LoadingIcon } from "@/base-components";

export const Ntt = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loader, setLoader] = useState(false);
  const [statusOfInstance, setStatusOfInstance] = useState("InService");
  const navigate = useNavigate();
  const [validUser, setValidUser] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [videos, setVideos] = useState([]);

  const handleVideoClick = (video, key) => {
    if (key === "chapter") {
      setSelectedChapter(video);
      setSelectedVideo(video?.videos[0]);
    } else if (key === "video") {
      setSelectedVideo(video);
    }
  };

  const formatTitle = (title) => {
    let formattedTitle = title.replaceAll("__", " - ").replaceAll("_", " ");
    return formattedTitle;
  };

  useEffect(() => {
    window.localStorage.setItem("currentPage", "/ntt");
  }, []);

  useEffect(() => {
    setLoader(true);
    setTimeout(() => {
      const transformedData = mapDataToChapterFormat(JSONdATA);
      setVideos(transformedData);
      setLoader(false);
    }, 2000);

    document.title = "Generative AI";
  }, [validUser]);
  const mapDataToChapterFormat = (data) => {
    const mappedData = [];
    let chapterId = 1;
    for (const chapterKey in data) {
      if (data?.hasOwnProperty(chapterKey)) {
        const chapter = data[chapterKey];
        const chapterVideos = chapter?.videos?.map((video, index) => ({
          id: `video_${chapterId}_${index}`,
          title: `Video ${index + 1}`,
          source: video,
          transcription: chapter.video_transcript[index],
          transcriptJson: chapter.video_transcript[index].replace(
            ".json",
            ".vtt"
          ),
        }));
        const chapterDetails = {
          id: `chapter_${chapterId}`,
          chapter_title: chapterKey,
          videos: chapterVideos,
          chapter_transcript: chapter?.chapter_transcript,
        };

        mappedData.push(chapterDetails);
        chapterId++;
      }
    }

    return mappedData;
  };

  return (
    <>
      {/* <Lucide
        icon="ArrowLeftCircle"
        className="w-10 h-10 cursor-pointer my-5 mx-5"
        onClick={() => {
          navigate("/");
        }}
      /> */}
      <div className="text-primary">
        {loader && <Loading />}
        {validUser ? (
          <div className={``}>
            {/* <div className="flex flex-col items-center justify-between md:flex-row px-5 py-2">
            <img
              src={`/dashboard/images/CT_logo_horizontal.svg`}
              alt=""
              className="h-8 w-[200px] md:ml-5 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <div className="flex gap-4 md:mr-5 mt-5 "></div>
          </div> */}
            <div className="flex flex-col sm:flex-row relative ">
              <div
                className={`w-full ${
                  selectedChapter !== null && "sm:w-[20%]"
                } `}
              >
                <div className="md:py-10 lg:py-5 py-5 px-5 md:px-0 md:sticky md:top-2 md:left-0 ">
                  <VideoGallery
                    videos={videos}
                    handleVideoClick={handleVideoClick}
                    selectedVideo={selectedVideo}
                    setSelectedVideo={setSelectedVideo}
                    selectedChapter={selectedChapter}
                    setSelectedChapter={setSelectedChapter}
                  />
                </div>
              </div>
              {selectedChapter !== null && (
                <div className="flex flex-col w-full md:mt-6 sm:ml-5 md:pt-10">
                  <div className="flex flex-col lg:flex-row xl:w-[100%] px-5 grow">
                    {selectedChapter && (
                      <VideoPlayer
                        video={selectedVideo}
                        statusOfInstance={statusOfInstance}
                      />
                    )}
                    <Assessment
                      selectedVideo={selectedVideo}
                      statusOfInstance={statusOfInstance}
                      selectedChapter={selectedChapter}
                    />
                  </div>
                  <div className="flex lg:w-[60%] items-center text-center justify-center">
                    <h3 className="text-primary font-semibold">
                      {selectedChapter?.chapter_title?.replace("_", " ")}{" "}
                    </h3>

                    {selectedVideo && (
                      <h3 className="text-primary ml-2 font-semibold">
                        {" "}
                        {`- ${selectedVideo?.title}`}
                      </h3>
                    )}
                  </div>

                  <div className="flex w-[100%] flex-col lg:flex-row px-5 grow">
                    <Summary
                      statusOfInstance={statusOfInstance}
                      selectedVideo={selectedVideo}
                      selectedChapter={selectedChapter}
                    />
                    <ChatBot
                      selectedVideo={selectedVideo}
                      statusOfInstance={statusOfInstance}
                      selectedChapter={selectedChapter}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // modal on the center of the screen
          <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
            <div className="bg-white p-5 flex flex-col w-1/3 h-auto box my-4">
              <h1 className="text-center text-xl font-semibold">
                Please Enter Secret Code
              </h1>
              <div className="flex flex-col justify-center items-center my-3">
                <input
                  type="password"
                  className="intro-x login__input form-control py-3 px-4 block mt-4  xl:w-[22rem]"
                  placeholder="Enter Secret Code"
                  onChange={(e) => {
                    setErrorMessage("");
                    setSecretCode(e.target.value);
                  }}
                />

                <button
                  className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top my-5"
                  onClick={() => {
                    if (secretCode === "Cl0udTh@t4ntt2o23") {
                      setValidUser(true);
                    } else {
                      setErrorMessage("Please enter valid secret code");
                    }
                  }}
                >
                  Validate
                </button>
              </div>
              {errorMessage !== "" && (
                <p className="text-red-500 text-center">{errorMessage}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const Loading = () => {
  return (
    <div
      style={
        {
          // background: "#fff",
          // backdropFilter: "blur(0.5px)",
        }
      }
      className="fixed  top-0 left-0 right-0 bottom-0 z-50 "
    >
      <div className="flex justify-center items-center ">
        <div
          className={`fixed  top-1/2
        `}
        >
          <div className="flex flex-col items-center justify-center w-full">
            <LoadingIcon icon="spinning-circles" className="w-16 h-16 my-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Loader = () => {
  return (
    <div className="dot-spinner">
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
    </div>
  );
};
