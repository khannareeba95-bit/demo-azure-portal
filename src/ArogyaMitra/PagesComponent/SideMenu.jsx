import { Lucide } from "@/base-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Appointment from "./Appointment";
import DoctorDashboard from "./DoctorDashboard";

function SideMenu() {
  const [selectedContent, setSelectedContent] = useState("Dashboard");
  const navigate = useNavigate();

  const handleSelection = (content) => {
    setSelectedContent(content);
  };
  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, []);

  return (
    <div>
      <style>
        {`
          .content {
            padding: 0 !important;
          }
          .wrapper.wrapper--top-nav .wrapper-box {
            margin-top: 0 !important; 
          }
        `}
      </style>
      <div className="wrapper">
        <div className="my-5 block xl:hidden">
          <div className="flex justify-around border-b-2 pb-2">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                selectedContent === "Dashboard" ? "border-b-2 border-primary text-primary" : "text-gray-600"
              }`}
              onClick={() => handleSelection("Dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                selectedContent === "Appointment" ? "border-b-2 border-primary text-primary" : "text-gray-600"
              }`}
              onClick={() => handleSelection("Appointment")}
            >
              Appointment
            </button>
          </div>
        </div>

        <div className="wrapper-box">
          <nav className="side-nav hidden xl:block">
            <ul>
              <Lucide
                icon="ArrowLeftCircle"
                className="w-8 h-8 cursor-pointer mb-4  text-white"
                onClick={() => navigate("/")}
              />
              <li>
                <button
                  className={`w-full side-menu ${selectedContent === "Dashboard" ? "side-menu--active" : ""}`}
                  onClick={() => handleSelection("Dashboard")}
                >
                  <Lucide icon="LayoutDashboard" className="mr-5" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  className={`w-full side-menu ${selectedContent === "Appointment" ? "side-menu--active" : ""}`}
                  onClick={() => handleSelection("Appointment")}
                >
                  <Lucide icon="Clock" className="mr-5" />
                  Appointment
                </button>
              </li>
            </ul>
          </nav>
          <div className="content">
            {selectedContent === "Dashboard" && <DoctorDashboard />}
            {selectedContent === "Appointment" && <Appointment />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
