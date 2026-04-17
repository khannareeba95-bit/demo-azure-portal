import { AlignJustify, CircleHelp, HardDriveUpload, Loader, Podcast, Sheet } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import FAQComponent from './FAQComponent';
import ChatFeedback from './ChatFeedback';
import UploadedDocuments from './UploadedDocuments';

const Navbar = ({ inputRef, setMenuSelection, setQuery }) => {

  const [menuToggle, setMenuToggle] = useState(false);
  const [faqToggle, setFAQToggle] = useState(false);
  const [feedbackToggle, setFeedbackToggle] = useState(false);
  const [documentToggle, setDocumentToggle] = useState(false);
  const [uploadStaus, setUploadStatus] = useState({
    stopped: true,
    starting: false,
    stopping: false,
  });

  const menuRef = useRef();


  const [instanceStatus, setInstanceStatus] = useState("stopped");
  const [buttonText, setButtonText] = useState("Deploy Infrastructure");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const TIMER_KEY = "instanceTimer";
  const CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds
  const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

  const updateButtonText = (status) => {
    const statusTextMap = {
      stopping: "Releasing Infrastructure",
      stopped: "Deploy Infrastructure",
      starting: "Deploying Infrastructure",
      available: "Release Infrastructure",
    };
    setButtonText(statusTextMap[status] || "Deploy Infrastructure");
  };

  const startTimer = () => {
    const currentStartTime = Date.now();
    localStorage.setItem(TIMER_KEY, currentStartTime.toString());
    setStartTime(currentStartTime);
    setRemainingTime(FIVE_MINUTES);
  };

  const updateRemainingTime = () => {
    if (!startTime) return;
    const elapsedTime = Date.now() - startTime;
    setRemainingTime(Math.max(FIVE_MINUTES - elapsedTime, 0));
  };

  const fetchRDSStatus = async () => {
    setIsLoading(true);
    try {
      const statusData = await getStatus();
      if (statusData?.instance_details) {
        const status = statusData.instance_details["RDS Instance Status"];
        setInstanceStatus(status);
        updateButtonText(status);

        if (status === "stopping" || status === "starting" || status === "configuring-enhanced-monitoring") {
          if (!startTime) {
            const startTimeFromLocalStorage = localStorage.getItem(TIMER_KEY);
            if (startTimeFromLocalStorage) {
              const elapsedTime = Date.now() - parseInt(startTimeFromLocalStorage, 10);
              if (elapsedTime < FIVE_MINUTES) {
                setRemainingTime(Math.max(FIVE_MINUTES - elapsedTime, 0));
                setStartTime(parseInt(startTimeFromLocalStorage, 10));
              }
            } else {
              startTimer();
            }
          }
        } else {
          localStorage.removeItem(TIMER_KEY);
          setRemainingTime(0);
          setStartTime(null);
        }
      }
    } catch (error) {
      console.error("Error fetching RDS status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRDSStatus();
    const savedStartTime = localStorage.getItem(TIMER_KEY);
    if (savedStartTime) {
      const elapsedTime = Date.now() - parseInt(savedStartTime, 10);
      if (elapsedTime < FIVE_MINUTES) {
        setRemainingTime(Math.max(FIVE_MINUTES - elapsedTime, 0));
        setStartTime(parseInt(savedStartTime, 10));
      } else {
        localStorage.removeItem(TIMER_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (["available", "stopped"].includes(instanceStatus)) return;

    const interval = setInterval(() => {
      fetchRDSStatus();
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [instanceStatus]);

  const handleStartInstance = async () => {
    setIsLoading(true);
    try {
      const response = await startInstance();
      if (response.statusCode === 200) {
        setInstanceStatus("starting");
        updateButtonText("starting");
      }
    } catch (error) {
      console.error("Error starting RDS instance:", error);
    } finally {
      await fetchRDSStatus();
      setIsLoading(false);
    }
  };

  const handleStopInstance = async () => {
    setIsLoading(true);
    try {
      const response = await stopInstance();
      if (response.statusCode === 200) {
        setInstanceStatus("stopping");
        updateButtonText("stopping");
      }
    } catch (error) {
      console.error("Error stopping RDS instance:", error);
    } finally {
      await fetchRDSStatus();
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (instanceStatus === "stopped") {
      handleStartInstance();
    } else if (instanceStatus === "available") {
      handleStopInstance();
    }
  };

  async function getStatus() {
    let response = await fetch(import.meta.env.VITE_PHARMA_FAQ_URL, {
    });
    return response.json();
  }

  async function stopInstance() {
    try {
      const response = await fetch(import.meta.env.VITE_PHARMA_FAQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "rds_action": "stop" }),
      });
      return response.json();
    } catch (error) {
      console.error("Error stopping instance:", error);
    }
  }

  async function startInstance() {
    try {
      const response = await fetch(import.meta.env.VITE_PHARMA_FAQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "rds_action": "start" }),
      });
      return response.json();
    } catch (error) {
      console.error("Error starting instance:", error);
    }
  }


  useEffect(() => {
    window.addEventListener('mousedown', (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuToggle(false);
      }
    })

    return () => {
      window.removeEventListener('mousedown', (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setMenuToggle(false);
        }
      })
    }
  }, [])


  function handleFeedbackToggle() {
    setMenuToggle(false);
    setFeedbackToggle(true);
  }
  function handleFAQToggle() {
    setMenuToggle(false);
    setFAQToggle(true);
  }
  function handleDocumentToggle() {
    setMenuToggle(false);
    setDocumentToggle(true);
  }

  const uploadInfrastructure = async () => {
    let uploadBody = {};
    if (uploadStaus === "stopped") {
      uploadBody = {
        "rds_action": "start"
      }
    }
    try {
      // setLoading(true);
      let response = await fetch(import.meta.env.VITE_PHARMA_FAQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadBody)
      });
      let data = await response.json();
      // let resp = JSON.parse(data.body);
      console.log('questionsResponse', resp);

    } catch (error) {
      // setLoading(false);
    }
  }

  return (
    <>
      {faqToggle && <FAQComponent inputRef={inputRef} setFAQToggle={setFAQToggle} setQuery={setQuery} />}
      {feedbackToggle && <ChatFeedback setMenuSelection={setFeedbackToggle} />}
      {documentToggle && <UploadedDocuments setDocumentToggle={setDocumentToggle} />}
      <div className="sticky top-0 z-10 flex h-16 items-center justify-between  p-4 ">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-gray-800">VendorIQ</h1>
          <span className="text-sm text-gray-500">Your Intelligent Healthcare Companion</span>
        </div>

        <div className="flex items-center gap-3">
          {/* <button
            className={`
        flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition-all
        ${instanceStatus === "starting" || instanceStatus === 'configuring-enhanced-monitoring' ? "bg-green-600 hover:bg-green-700" :
                ["stopping", "available"].includes(instanceStatus) ? "bg-red-600 hover:bg-red-700" :
                  instanceStatus === "stopped" ? "bg-blue-700 hover:bg-blue-800" : "bg-gray-500"}
        ${(isLoading || ["starting", "stopping", "configuring-enhanced-monitoring"].includes(instanceStatus)) ? "cursor-not-allowed opacity-50" : ""}
      `}
            onClick={handleButtonClick}
            disabled={isLoading || ["starting", "stopping", "configuring-enhanced-monitoring"].includes(instanceStatus)}
          >
            <span>{buttonText}</span>
            {(isLoading || ["starting", "stopping", "configuring-enhanced-monitoring"].includes(instanceStatus)) && (
              <Loader className="ml-2 h-4 w-4 animate-spin stroke-white stroke-2" />
            )}
          </button> */}

          <div ref={menuRef} className="relative ">
            <span
              className="flex cursor-pointer h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setMenuToggle(prev => !prev)}
            >
              <AlignJustify  />
            </span>

            {menuToggle && (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5">
                <span
                  onClick={handleFeedbackToggle}
                  className="flex w-full items-center gap-2 cursor-pointer rounded-md p-2 text-left text-md text-gray-700 hover:bg-[#223e8c] hover:text-white"
                >
                  <Podcast size={20} />
                  <span>Feedback</span>
                </span>

                <span
                  onClick={handleFAQToggle}
                  className="flex w-full items-center gap-2 cursor-pointer rounded-md p-2 text-left text-md text-gray-700 hover:bg-[#223e8c] hover:text-white"
                >
                  <CircleHelp size={20} />
                  <span>FAQs</span>
                </span>

                <span
                  onClick={handleDocumentToggle}
                  className="flex w-full items-center gap-2 cursor-pointer rounded-md p-2 text-left text-md text-gray-700 hover:bg-[#223e8c] hover:text-white"
                >
                  <Sheet size={20} />
                  <span>Documents</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar