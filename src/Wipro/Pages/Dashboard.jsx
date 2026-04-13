import React, { useState, useEffect, useRef } from "react";

export const WiproDashboard = () => {
  const [validUser, setValidUser] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showrefreshButton, setShowRefreshButton] = useState(false);
  const [loader, setLoader] = useState(true);
  const iframeRef = useRef();
  useEffect(() => {
    if (iframeLoaded) {
      setLoader(false);
      const delayToShowButton = setTimeout(() => {
        setShowRefreshButton(iframeLoaded);
      }, 2000);

      return () => clearTimeout(delayToShowButton);
    } else {
      const delayToHideButton = setTimeout(() => {
        iframeRef.current.src += "";
        setLoader(true);
        setShowRefreshButton(iframeLoaded);
      }, 2000);

      return () => clearTimeout(delayToHideButton);
    }
  }, [iframeLoaded]);

  return (
    <div className="relative">
      {validUser ? (
        <>
          {loader && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div class="wiproloader"></div>
            </div>
          )}

          <>
            <div className="h-screen">
              <iframe
                src="https://d24t5s14aord5m.cloudfront.net/index.html"
                title="Lex Chatbot"
                width="400"
                height="600"
                frameBorder="0"
                scrolling="no"
                className="w-full h-full"
                allow="microphone"
                onLoad={() => {
                  setIframeLoaded(true);
                }}
                ref={iframeRef}
              ></iframe>
            </div>
            {showrefreshButton && (
              <div className="fixed top-[12px] right-[70px] ">
                <button
                  className="btn btn-warning py-3 px-4 w-full xl:w-auto xl:mr-3 align-top"
                  // onClick={() => {
                  //   window.location.reload();
                  // }}
                  onClick={(e) => {
                    setIframeLoaded(false);
                  }}
                >
                  Refresh
                </button>
              </div>
            )}
          </>
        </>
      ) : (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
          <div className="bg-white p-5 flex flex-col w-1/3 h-auto box">
            <h1 className="text-center text-xl font-semibold my-4">
              Please Enter Secret Code
            </h1>
            <div className="flex flex-col justify-center items-center my-2">
              <input
                type="password"
                className="intro-x login__input form-control py-3 px-4 block mt-4 xl:w-[22rem]"
                placeholder="Enter Secret Code"
                onChange={(e) => {
                  setErrorMessage("");
                  setSecretCode(e.target.value);
                }}
              />

              <button
                className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top my-5"
                onClick={() => {
                  if (secretCode === "Cl0udTh@t4wipro2o24") {
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
  );
};
