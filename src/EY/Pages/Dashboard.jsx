import { LoadingIcon } from "@/base-components";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import UserContext from "../../Context/UserContext";
import { Assessment } from "../PagesComponents/Assessment";
import { ChatBot } from "../PagesComponents/ChatBot";
import { Summary } from "../PagesComponents/Summary";
import VideoGallery from "../PagesComponents/VideoGallery";
import VideoPlayer from "../PagesComponents/VideoPlayer";
import { JSONdATA } from "../utils/Constant";

export const EY = () => {
  const { userDetails, userState, setUserState } = useContext(UserContext);
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loader, setLoader] = useState(false);
  const [statusOfInstance, setStatusOfInstance] = useState("InService");
  const [validUser, setValidUser] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };
  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
    setLoader(true);
    setTimeout(() => {
      setLoader(false);
    }, 2000);

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
    };
  });

  useEffect(() => {
    document.title = "Generative AI";
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, []);

  return (
    <>
      {loader && <Loading />}
      {/* {validUser ? ( */}
      <div className={``}>
        {/* <div className="flex flex-col items-center justify-between md:flex-row px-5 py-2">
          <img
            src={`/dashboard/images/CT_logo_horizontal.svg`}
            alt=""
            className="h-8 w-[200px] md:ml-5 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        {userDetails && (
          <div className="w-full flex items-center justify-end px-10 ">
            <h2 className="text-white text-sm text-center">
              You are logged in as {userDetails?.attributes?.email}
            </h2>
          </div>
        )} */}
        <div className="flex flex-col sm:flex-row relative ">
          <div className={`w-full ${selectedVideo !== null && "sm:w-[30%]"} `}>
            <div className="md:py-10 lg:py-5 py-5 px-5 md:px-0 md:sticky md:top-2 md:left-0 ">
              <VideoGallery videos={videos} handleVideoClick={handleVideoClick} selectedVideo={selectedVideo} />
            </div>
          </div>
          {selectedVideo !== null && (
            <div className="flex flex-col w-full  md:mt-6 sm:ml-5 md:pt-10">
              <div className="flex flex-col lg:flex-row xl:w-[100%] px-5 ">
                {selectedVideo && <VideoPlayer video={selectedVideo} statusOfInstance={statusOfInstance} />}
                <ChatBot selectedVideo={selectedVideo} statusOfInstance={statusOfInstance} />
              </div>
              <div className="flex lg:w-[60%] items-center text-center justify-center">
                <h3 className="text-primary font-semibold">{selectedVideo?.title}</h3>
              </div>

              <div className="flex w-[100%] flex-col lg:flex-row px-5 grow">
                <Summary statusOfInstance={statusOfInstance} selectedVideo={selectedVideo} />
                <Assessment selectedVideo={selectedVideo} statusOfInstance={statusOfInstance} />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ) : (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-[#1b253b] bg-opacity-50">
          <div className="bg-white rounded-md p-5 flex flex-col">
            <h1 className="text-center text-2xl font-bold">Please Enter Secret Code</h1>
            <div className="flex flex-col justify-center items-center mt-5">
              <input
                type="password"
                className="border-2 border-gray-300 rounded-md w-48 h-10 px-2 focus:outline-none focus:border-blue-500 my-2 bg-white text-gray-500"
                placeholder="Enter Secret Code"
                onChange={(e) => {
                  setErrorMessage('');
                  setSecretCode(e.target.value);
                }}
              />

              <button
                className="rounded-md  flex items-center hover:scale-110 md:w-48 hover:duration-300 bg-[#0056cd]  text-white shadow-2xl justify-center ring-0 focus:outline-0 border-none"
                onClick={() => {
                  if (secretCode === 'Cl0udTh@t4hpe2o24') {
                    setValidUser(true);
                  } else {
                    setErrorMessage('Please enter valid secret code');
                  }
                }}
              >
                Validate
              </button>
            </div>
            {errorMessage !== '' && <p className="text-red-500 text-center">{errorMessage}</p>}
          </div>
        </div>
      )} */}
    </>
  );
};

export const Loading = () => {
  return (
    <div
      // style={{
      //   background: "rgba(5, 5, 5, 0.1)",
      //   backdropFilter: "blur(0.5px)",
      // }}
      className="fixed  top-0 left-0 right-0 bottom-0 z-50"
    >
      <div className="flex justify-center items-center ">
        <div
          className={`fixed  top-1/2
        `}
        >
          <div className="flex flex-col items-center justify-center w-full text-white">
            <LoadingIcon icon="spinning-circles" className="w-16 h-16 my-2" style={{ fill: "#fff" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// export const Loader = () => {
//   return (
//     <div className="dot-spinner">
//       <div className="dot-spinner__dot"></div>
//       <div className="dot-spinner__dot"></div>
//       <div className="dot-spinner__dot"></div>
//       <div className="dot-spinner__dot"></div>
//       <div className="dot-spinner__dot"></div>
//       <div className="dot-spinner__dot"></div>
//       <div className="dot-spinner__dot"></div>
//       <div className="dot-spinner__dot"></div>
//     </div>
//   );
// };
