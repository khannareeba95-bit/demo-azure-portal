import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lucide from "../../../src/base-components/lucide/index";

function Dashboard() {
  const navigate = useNavigate();
  const [validUser, setValidUser] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");

  const handlePreviewClick = (openInNewTab) => {
    if (openInNewTab) {
      window.open(iframeUrl, "_blank");
    }
  };

  useEffect(() => {
    window.localStorage.setItem("currentPage", "/itc");
  }, []);

  const validateSecretCode = () => {
    if (secretCode === "Cl0udTh@t4itc2o24") {
      setValidUser(true);
      setIframeUrl("https://d7jpov8j9jxav.cloudfront.net");
    } else {
      setErrorMessage("Please enter a valid secret code");
    }
  };

  return (
    <div className="text-primary">
      {validUser ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe title="Preview" className="w-full h-full" src={iframeUrl} />
          <div className="absolute top-4 right-4 flex items-center">
            <Lucide
              icon="XSquare"
              className="w-8 h-8 cursor-pointer"
              onClick={() => {
                setIframeUrl("");
                navigate("/");
              }}
            />
            <Lucide
              icon="Maximize"
              className="w-8 h-8 ml-4 cursor-pointer"
              onClick={() => handlePreviewClick(true)}
            />
          </div>
        </div>
      ) : (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
          <div className="bg-white p-5 flex flex-col w-1/3 h-auto box my-4">
            <h1 className="text-center text-xl font-semibold">
              Please Enter Secret Code
            </h1>
            <div className="flex flex-col justify-center items-center my-3">
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
                onClick={validateSecretCode}
              >
                Validate
              </button>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-center">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
