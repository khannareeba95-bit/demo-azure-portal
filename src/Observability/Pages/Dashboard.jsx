import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";
import UserContext from "../../Context/UserContext";
import Toast from "../../assets/Shared/Toast";
import { LuExpand } from "react-icons/lu";
import Overlay from "../../GenAi/PagesComponents/Overlay";
import fetchData from "../../config/ApiCall";

export const Observability = () => {
  const navigate = useNavigate();
  const { userDetails, setUserState, userState } = useContext(UserContext);
  const [statusOfInstance, setStatusOfInstance] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const twentyMinutes = 5 * 60 * 1000;
  const [startTime, setStartTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(twentyMinutes);
  const [error, setError] = useState("");
  useEffect(() => {
    handleGetStatusInstance();
    document.title = "Observability";
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, []);

  const handleGetStatusInstance = async () => {
    try {
      setError("");
      let url =
        import.meta.env.VITE_OBSERVABILITY_API_URL;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response && response?.statusCode === 200) {
            let status_part = response?.body?.split("status:")[1];
            let status = status_part.split(",")[0].strip();

            if (status == "CREATE_COMPLETE") {
              setStatusOfInstance("InService");
            }
            // if (response === 'No_Instance' || response.body.includes('CREATE_COMPLETE')) {
            //   window.localStorage.removeItem('startTimeObservability');
            // }
            // if (response?.body === 'Failed') {
            //   handleStateOfInstance(response?.body);
            // }
          }
        })
        .catch((error) => {
          console.error("Form error:", error);
        });
 
    } catch (error) {
      console.log("error", error);
      setError("Something went wrong");
    }
  };
  const handleStateOfInstance = async (statusOfInstance) => {
    try {
      let url;
      setShowToast(true);
      setDisableButton(true);
      setError("");
      if (statusOfInstance === "No_Instance") {
        url = "";
      } else if (statusOfInstance === "InService") {
        url = "";
      }
      let payload = { key: "get_status" };
      const response = await fetchData(payload, url);
      if (response && response?.statusCode === 200) {
        setStatusOfInstance(response?.body);
        setDisableButton(false);
      }
    } catch (error) {
      console.log("error", error);
      setError("Something went wrong");
    }
  };
  useEffect(() => {
    const startTimeFromLocalStorage = window.localStorage.getItem(
      "startTimeObservability"
    );
    if (startTimeFromLocalStorage && statusOfInstance === "Creating") {
      const elapsedTime = Date.now() - parseInt(startTimeFromLocalStorage, 10);
      if (elapsedTime < twentyMinutes) {
        setStartTime(Date.now() - elapsedTime);
        const timeRemaining = Math.max(twentyMinutes - elapsedTime, 0);
        setRemainingTime(timeRemaining);
      } else {
        handleGetStatusInstance();
      }
    } else if (statusOfInstance === "Creating") {
      setStartTime(Date.now());
      window.localStorage.setItem("startTimeObservability", Date.now());
    }
    const interval = setInterval(() => {
      if (statusOfInstance === "Creating" && startTime) {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= twentyMinutes) {
          handleGetStatusInstance();
          setStartTime(null);
          clearInterval(interval);
        } else {
          const timeRemaining = Math.max(twentyMinutes - elapsedTime, 0);
          setRemainingTime(timeRemaining);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [statusOfInstance, startTime]);
  return (
    <div class="w-screen min-h-screen bg-[#20629b] xl:p-5 p-2 ">
      {statusOfInstance === "Creating" && (
        <Overlay timer={remainingTime} startTime={startTime} />
      )}
      <div class="flex flex-col items-center justify-between md:flex-row px-5 py-2">
        <img
          alt="logo"
          src="/dashboard/images/CT_logo_horizontal.svg"
          className="h-8 w-[200px] md:ml-5 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <div class="flex gap-4 md:mr-5 mt-5 ">
          {showToast && (
            <Toast
              message={
                statusOfInstance === "Creating"
                  ? "Instance creation in progress, please wait"
                  : "Instance deletion in progress, please wait"
              }
              onClose={() => setShowToast(false)}
            />
          )}
          <div class="flex items-center gap-4  w-full h-[40px]">
            {userDetails &&
              (statusOfInstance === "No_Instance" ||
                statusOfInstance === "Creating" ||
                statusOfInstance === "InService") && (
                <button
                  class="box hover:scale-110 disabled:cursor-not-allowed  md:h-auto p-2"
                  onClick={() => {
                    handleStateOfInstance(
                      statusOfInstance === "Creating"
                        ? "Creating"
                        : statusOfInstance === "No_Instance"
                        ? "No_Instance"
                        : statusOfInstance === "InService" && "InService"
                    );
                  }}
                  disabled={statusOfInstance == "Creating" || disableButton}
                >
                  <p className="text-button">
                    {statusOfInstance === "Creating"
                      ? "Deploying"
                      : statusOfInstance === "No_Instance"
                      ? "Deploy Infrastructure"
                      : statusOfInstance == "InService" &&
                        "Release Infrastructure"}
                  </p>
                </button>
              )}
            <button
              className="rounded-md md:mt-0 mt-4 flex items-center hover:scale-110 md:w-48 hover:duration-300 bg-white  text-black shadow-2xl justify-center ring-0 focus:outline-0 border-none"
              onClick={() => {
                if (userDetails) {
                  Auth.signOut();
                  setUserState({
                    ...userState,
                    userDetails: "",
                  });
                  navigate("/");
                } else {
                  window.localStorage.setItem(
                    "currentPage",
                    window.location.pathname
                  );
                  navigate("/login");
                }
              }}
            >
              {userDetails ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      </div>
      {userDetails && (
        <div class="w-full flex items-center justify-end px-10 ">
          <h2 class="text-white text-sm text-center">
            You are logged in as {userDetails?.attributes?.email}
          </h2>
        </div>
      )}
      <div class="flex items-center flex-col justify-center w-full mx-auto mt-5 ">
        <div class="relative md:w-[40%] h-[300px] mx-auto w-full p-5 md:p-0 ">
          <iframe
            src="https://observability.cloudthat.com"
            frameborder="0"
            class="w-full h-full"
          ></iframe>
          <a
            class="expand-button shadow-lg"
            href="https://observability.cloudthat.com"
            alt=""
            target="_blank"
          >
            <LuExpand />
          </a>
        </div>
        {/* <div class="flex items-center gap-4 mt-4  w-full h-[40px]">
          {userDetails &&
            (statusOfInstance === 'No_Instance' ||
              statusOfInstance === 'Creating' ||
              statusOfInstance === 'CREATE_COMPLETE') && (
              <button
                class="box hover:scale-110 disabled:cursor-not-allowed  md:h-auto p-2"
                onClick={() => {
                  handleStateOfInstance(
                    statusOfInstance === 'Creating'
                      ? 'Creating'
                      : statusOfInstance === 'No_Instance'
                      ? 'No_Instance'
                      : statusOfInstance === 'CREATE_COMPLETE' && 'InService'
                  );
                }}
                disabled={statusOfInstance == 'Creating' || disableButton}
              >
                <p className="text-button">
                  {statusOfInstance === 'Creating'
                    ? 'Deploying'
                    : statusOfInstance === 'No_Instance'
                    ? 'Deploy Infrastructure'
                    : statusOfInstance == 'CREATE_COMPLETE' && 'Release Infrastructure'}
                </p>
              </button>
            )}
        </div> */}
      </div>

      {/* {showToast && (
        <Toast
          message={
            statusOfInstance === 'No_Instance'
              ? 'Instance creation in progress, please wait'
              : statusOfInstance === 'InService' && 'Instance deletion in progress, please wait'
          }
          onClose={() => setShowToast(false)}
        />
      )} */}
    </div>
  );
};
