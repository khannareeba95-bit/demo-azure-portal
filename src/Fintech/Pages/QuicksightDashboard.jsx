import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lucide } from "../../base-components";
//import { QuickSightEmbedding } from 'amazon-quicksight-embedding-sdk';

export const QuickSightDashboard = () => {
  const experienceContainerRef = useRef(null);
  const dashboardRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Add state to track embedding context
  const [embeddingContext, setEmbeddingContext] = useState(null);
  const navigate = useNavigate();

  const fetchEmbedQSearchUrl = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      type: "Admin",
      q_search: true,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    try {
      const response = await fetch(import.meta.env.VITE_QUICKSIGHT_API_URL, requestOptions);
      const data = await response.json();
      //   return data?.body;
      const embedUrl = data?.body; // Assuming the server returns an object with 'embedUrl' property
      if (embedUrl && embedUrl.startsWith("https://")) {
        let showResultsAbove = true;
        embedQSearchBar(embedUrl);
        //setEmbedSearchUrl(embedUrl);
        // embedQSearchBar(embedUrl, showResultsAbove);
      }
    } catch (error) {
      console.error("Error fetching embed URL:", error);
    }
  };
  const fetchEmbedDashboardUrl = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      type: "Admin",
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    try {
      const response = await fetch(import.meta.env.VITE_QUICKSIGHT_API_URL, requestOptions);
      const data = await response.json();
      //   return data?.body;
      const embedUrl = data?.body; // Assuming the server returns an object with 'embedUrl' property
      if (embedUrl && embedUrl.startsWith("https://")) {
        embedDashboard(embedUrl);
      } else {
        console.error("Invalid embed URL:", embedUrl);
      }
      // if (embedUrl) {
      //   embedDashboard(embedUrl);
      // }
    } catch (error) {
      console.error("Error fetching embed URL:", error);
    }
  };
  const embedQSearchBar = async (embedUrl, showResultsAbove) => {
    const { createEmbeddingContext } = QuickSightEmbedding;

    const embeddingContext = await createEmbeddingContext({
      onChange: (changeEvent, metadata) => {},
    });

    const frameOptions = {
      url: embedUrl,
      container: experienceContainerRef.current,
      height: "100%",
      width: "100%",
      //position: showResultsAbove ? 'top' : 'bottom',
    };

    const contentOptions = {
      theme: "MIDNIGHT",
      allowTopicSelection: true,
      position: showResultsAbove ? "top" : "bottom",
      onMessage: (messageEvent) => {},
    };

    await embeddingContext.embedQSearchBar(frameOptions, contentOptions);
  };

  const embedDashboard = async (embedUrl) => {
    const { createEmbeddingContext } = QuickSightEmbedding;

    const embeddingContext = await createEmbeddingContext();

    const frameOptions = {
      url: embedUrl,
      container: dashboardRef.current,
      height: "100%",
      width: "100%",
    };

    await embeddingContext.embedDashboard(frameOptions);
  };
  useEffect(() => {
    //adding this below code which will remove padding to the body in case quicksight
    document.body.style.padding = "0";
    const fetchAndEmbed = async () => {
      await fetchEmbedDashboardUrl();
      //  await fetchEmbedQSearchUrl(); // Fetch and embed Q Search after dashboard for old API response format
    };
    fetchAndEmbed();
    return () => {
      document.body.style.padding = ""; // Reset to default or previously defined value
    };
  }, []);
  //  useEffect to handle Q Search embedding when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      // Always fetch fresh URL when opening modal
      fetchEmbedQSearchUrl();
    } else if (embeddingContext) {
      // Clean up when closing modal
      embeddingContext.destroy?.();
      setEmbeddingContext(null);
    }
  }, [drawerOpen]);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 w-full bg-[#177199] h-[50px] py-2 z-10 flex items-center justify-between px-5">
        <img
          src={`/dashboard/images/CT_logo_horizontal.svg`}
          alt=""
          className="h-7 w-[200px] cursor-pointer"
          onClick={() => navigate("/")}
        />
        {/* Search trigger button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm transition"
        >
          <Lucide icon="Search" className="w-4 h-4" />
          Ask a question
        </button>
      </div>

      {/* Dashboard */}
      <div ref={dashboardRef} className="absolute top-[50px] w-full h-[calc(100%-50px)]" />

      {/* Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-[850px] h-[90vh] relative overflow-hidden">
            {/* Header bar sits above the embedded content */}
            <div className="flex justify-end px-3 py-2 bg-white border-b shrink-0">
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-lg font-bold leading-none"
              >
                <Lucide icon="X" className="w-6 h-6" />
              </button>
            </div>

            {/* Content fills remaining height */}
            <div ref={experienceContainerRef} className="w-full" style={{ height: "calc(100% - 41px)" }} />
          </div>

          <div className="absolute inset-0 bg-black/40 -z-10" onClick={() => setDrawerOpen(false)} />
        </div>
      )}
    </div>
  );
};
