import { Preview, PreviewComponent, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@/base-components";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Lucide from "../../base-components/lucide";
import CREDIQ from "./CREDIQ";
import OCRDashboard from "./OCRDashboard";

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "ocr" ? 1 : 0;

  const handleTabChange = (index) => {
    navigate(`?tab=${index === 0 ? "crediq" : "ocr"}`);
  };
  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, []);

  return (
    <>
      <div className="my-5 flex items-center ">
        <Lucide
          icon="ArrowLeftCircle"
          className="w-10 h-10 cursor-pointer my-5 mx-5"
          onClick={() => {
            navigate("/");
          }}
        />
        <h1 className=" text-2xl text-[#1a3b8b] font-bold ">IntelliDoc</h1>
      </div>
      <PreviewComponent className="intro-y box mt-5 min-h-screen ">
        {({ toggle }) => (
          <>
            <div className="p-5">
              <Preview>
                <TabGroup selectedIndex={activeTab} onChange={handleTabChange}>
                  <TabList className="nav-link-tabs">
                    <Tab
                      className="w-full cursor-default border-none text-left text-2xl text-[#e9e8ea] py-2"
                      tag="button"
                    ></Tab>
                    {/* <Tab className="w-full py-2" tag="button">
                      OCR Dashboard
                    </Tab> */}
                  </TabList>
                  <TabPanels className="mt-5">
                    <TabPanel className="leading-relaxed">{activeTab === 0 && <CREDIQ key="crediq" />}</TabPanel>
                    <TabPanel className="leading-relaxed">{activeTab === 1 && <OCRDashboard key="ocr" />}</TabPanel>
                  </TabPanels>
                </TabGroup>
              </Preview>
            </div>
          </>
        )}
      </PreviewComponent>
    </>
  );
}

export default Dashboard;
