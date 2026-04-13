import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ video, statusOfInstance }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (statusOfInstance === "InService") {
      videoRef.current.play();
    } else if (statusOfInstance === "Creating") {
      videoRef.current.pause();
    }
  }, [statusOfInstance, video]);
  return (
    <div className="lg:w-[100%]  w-full  bg-white  p-5 lg:h-[400px] h-[300px] lg:m-5 my-5 border-5 border-primary rounded-lg">
      <video
        ref={videoRef}
        src={video?.source}
        controls
        autoPlay={statusOfInstance === "InService"}
        className="w-full h-full"
      ></video>
    </div>
  );
};

export default VideoPlayer;
