import { useContext } from "react";
import { useRoutes } from "react-router-dom";
import { ContentGenerate } from "../AIContentVideoGenerator/Main";

import AdminPanel from "../AdminPanel/Main";
import ArogyaMitra from "../ArogyaMitra/Pages/Dashboard";
import UserContext from "../Context/UserContext";
import { EY } from "../EY/Pages/Dashboard";
import { Fintech } from "../Fintech/Pages/Dashboard";
import { QuickSightDashboard } from "../Fintech/Pages/QuicksightDashboard";
import { GenAIJAM } from "../GenAI_JAM/Pages/Dashboard";
import { GenAi } from "../GenAi/Pages/Dashboard";
import { GenAIDoc } from "../GenAi/Pages/GenAIDoc";
import GenAIResumes from "../GenAi/Pages/GenAIResumes";
import { GenAiVideos } from "../GenAi/Pages/GenAIVideos";
import { ReqApproval } from "../GenAi/PagesComponents/RequestApprovalForm";
import InterviewTrack from "../InterviewTrack/Pages/Dashboard";
import OCR from "../OCR/Pages/Dashboard";
import { Observability } from "../Observability/Pages/Dashboard";
import Bot from "../PharmaBot/Pages/Bot";
import { RTCCA } from "../RTCCA/Pages/Dashboard";
import SEOOptimization from "../SEOOptimization/Main";
import { WiproDashboard } from "../Wipro/Pages/Dashboard";
import AdminRoute from "../components/AdminRoute";
import TopMenu from "../layouts/top-menu/Main";
import { checkAdminAccess } from "../utils/adminAuth";
import BlankPage from "../views/BlankPage";
import Dashboard from "../views/Dashboard";
import LandingPage from "../views/LandingPage";
import { ProjectDetails } from "../views/ProjectDetails";
import Login from "../views/login/Main";
function Router() {
  const userContext = useContext(UserContext);
  const { userDetails } = userContext;
  const isAdmin = checkAdminAccess(userDetails);

  const commonRoutes = [
    {
      path: "/",
      element: <TopMenu />,
      children: [
        {
          path: "/",
          element: <Dashboard />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        // {
        //   path: "/itc",
        //   element: <ITC />,
        // },

        {
          path: "/intellidoc",
          element: <OCR />,
        },
        {
          path: "/vocal",
          element: <RTCCA />,
        },
        {
          path: "/questa",
          element: <GenAiVideos />,
        },
        {
          path: "/genai/resumes",
          element: <GenAIResumes />,
        },
        {
          path: "/genai/doc",
          element: <GenAIDoc />,
        },
        {
          path: "/project-details",
          element: <ProjectDetails />,
        },
        {
          path: "/project-details/:projectName",
          element: <ProjectDetails />,
        },
        {
          path: "/adminpanel",
          element: (
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          ),
        },

        {
          path: "/ey",
          element: <EY />,
        },
        {
          path: "/knowledgesathi",
          element: <GenAIJAM />,
        },
        // MOVED: Catch-all route should be INSIDE TopMenu children, at the END
        // {
        //   path: "*",
        //   element: <ErrorPage />,
        // },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/landing",
      element: <LandingPage />,
    },
    {
      path: "/quicksight",
      element: <QuickSightDashboard />,
    },
    // REMOVED: Don't put catch-all here at root level
  ];

  const topMenuRoute = commonRoutes?.find((route) => route.path === "/");
  if (topMenuRoute && topMenuRoute.children) {
    // Insert these BEFORE the catch-all route (which is now at the end of children)
    const catchAllRoute = topMenuRoute.children.pop(); // Remove catch-all temporarily

    topMenuRoute.children.push(
      {
        path: "/vistora",
        element: userDetails ? <ContentGenerate /> : <Dashboard />,
      },
      {
        path: "/hire",
        element: userDetails ? <InterviewTrack /> : <Dashboard />,
      },
      {
        path: "/arogya-mitra",
        element: userDetails ? <ArogyaMitra /> : <Dashboard />,
      },
      {
        path: "/vendoriq",
        element: userDetails ? <Bot /> : <Dashboard />,
      },
      {
        path: "/elevateseo",
        element: userDetails ? <SEOOptimization /> : <Dashboard />,
      },
      {
        path: "/blank",
        element: <BlankPage />,
      },
      {
        path: "/genai",
        element: userDetails ? <GenAi /> : <Dashboard />,
      },
      {
        path: "/fintech-forum",
        element: userDetails ? <Fintech /> : <Dashboard />,
      },
      {
        path: "/observability",
        element: userDetails ? <Observability /> : <Dashboard />,
      },
      {
        path: "/wipro",
        element: userDetails ? <WiproDashboard /> : <Dashboard />,
      }
    );

    // Add catch-all back at the very end
    topMenuRoute.children.push(catchAllRoute);
  }

  const routes = userDetails ? [...commonRoutes, { path: "genai/request", element: <ReqApproval /> }] : commonRoutes;

  return useRoutes(routes);
}

export default Router;
