import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export const GenAi = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Generative AI";
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, []);

  return (
    <>
      <div
        className={`flex items-center justify-center mx-auto lg:p-10  p-5 lg:px-10 mb-10 cursor-pointer gap-6`}
      >
        <div className="intro-y col-span-12 md:col-span-6 lg:col-span-4">
          <div
            className="box w-11/12"
            onClick={() => {
              navigate("/genai/doc");
            }}
          >
            <div className="flex items-start px-5 pt-5 pb-5">
              <div className="w-full flex flex-col lg:flex-row items-center">
                <div className="flex flex-col items-center ">
                  <img
                    alt="Midone Tailwind HTML Admin Template"
                    className="w-full md:h-40 xl:h-72 image-fit rounded-md"
                    src={`/genai/assets/GenAIDoc.png`}
                  />
                </div>
              </div>
            </div>
            <div className="lg:text-right p-5 border-t border-slate-300/60 dark:border-darkmode-400 cursor-pointer">
              <div className="text-center text-[#1E3A8A] font-semibold text-lg">
                <h1>Documents</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="intro-y col-span-12 md:col-span-6 lg:col-span-4">
          <div
            className="box w-11/12"
            onClick={() => {
              navigate("/genai/videos");
            }}
          >
            <div className="flex items-start px-5 pt-5 pb-5">
              <div className="w-full flex flex-col lg:flex-row items-center">
                <div className="flex flex-col items-center">
                  <img
                    alt="Midone Tailwind HTML Admin Template"
                    className="w-full md:h-40 xl:h-72 image-fit rounded-md"
                    src={`/genai/assets/GenAIVideos.png`}
                  />
                </div>
              </div>
            </div>
            <div className="lg:text-right p-5 border-t border-slate-300/60 dark:border-darkmode-400 cursor-pointer">
              <div className="text-center text-[#1E3A8A] font-semibold text-lg">
                <h1>Videos</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
