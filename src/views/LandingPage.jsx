import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from "/genai/assets/Logo.png";
import illustrationUrl from "/genai/assets/illustration.svg";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-screen min-h-screen items-center justify-center">
      <div className="flex relative min-h-screen w-full overflow-hidden lg:shadow-lg">
        <div className="hidden md:flex flex-col min-h-full w-full bg-[#20629b] flex-1 items-center justify-center">
          <a href="" className="-intro-x flex">
            <img
              alt=""
              className="w-[230px] h-[40px] absolute top-4 left-4 lg:left-12"
              src={logoUrl}
            />
          </a>
          <div className="flex flex-col items-center justify-center">
            <img alt="" className="-intro-x w-3/4" src={illustrationUrl} />
            <div className="text-white font-medium lg:text-4xl md:text-3xl leading-tight mt-10 text-center">
              Demos | cloudthat.com
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1 bg-[#fafafd] rounded-md w-full">
          <div className="flex flex-col md:max-h-[500px] lg:max-h-[600px] md:p-2 p-5 xl:p-0 items-center justify-center w-full">
            <div className="mt-2 text-slate-400 xl:hidden text-center">
              Demos | cloudthat.com
            </div>
            <div className="mt-2 xl:mt-8 text-center xl:text-left flex-col w-full flex items-center justify-center md:p-4 xl:p-40">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Welcome to CloudThat Demos
              </h1>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                Explore our innovative solutions and cutting-edge technology demonstrations.
              </p>
              <button
                className="py-3 px-6 w-full max-w-sm bg-[#20629b] text-white hover:scale-105 transition duration-300 rounded-md font-semibold relative z-50 cursor-pointer"
                onClick={() => {
                  navigate('/');
                }}
                style={{ pointerEvents: 'auto' }}
              >
                Explore Demos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;