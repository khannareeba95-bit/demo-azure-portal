import { Amplify, Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { fetchData } from "./AdminPanel/Api.jsx";
import { SearchProvider } from "./Context/SearchContext.jsx";
import UserContext from "./Context/UserContext";
import AuthConfig from "./config/AuthConfig";
import Router from "./router";
Amplify.configure(AuthConfig);

function App() {
  const navigate = useNavigate();
  const [userState, setUserState] = useState({
    fetchNewData: false,
    successfullyFetchedDetails: false,
    currentPage: window.localStorage.getItem("currentPage") || "/",
  });
  const [metadata, setMetadata] = useState([]);

  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
    updateCurrentUser();
    loadMetadata();
  }, []);

  // Optimized focus-based refresh - only refresh if data is stale (10+ minutes) and on admin panel
  useEffect(() => {
    let lastFetch = Date.now();

    const handleFocus = () => {
      // Only refresh on admin panel pages
      if (!window?.location?.pathname?.includes("admin")) {
        return;
      }

      const timeSinceLastFetch = Date.now() - lastFetch;
      const TEN_MINUTES = 10 * 60 * 1000; // Increased to 10 minutes

      if (timeSinceLastFetch > TEN_MINUTES) {
        loadMetadata();
        lastFetch = Date.now();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const loadMetadata = async () => {
    setMetadata([]); // Clear existing metadata to show loading state
    try {
      const data = await fetchData();

      if (data && Array.isArray(data)) {
        setMetadata(data);
      } else {
        setMetadata([]);
      }
    } catch (error) {
      console.error("APP: Error loading metadata:", error?.message || error);

      setMetadata([]);
    }
  };

  const updateCurrentUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
      if (user) {
        setUserState({
          ...userState,
          userDetails: await user,
        });

        // Check for post-login redirect path (for federated login)
        const postLoginRedirect = window.sessionStorage.getItem("postLoginRedirect");
        //  navigate(postLoginRedirect || "/");
        if (postLoginRedirect) {
          navigate(postLoginRedirect);
          window.sessionStorage.removeItem("postLoginRedirect");
        } else {
          navigate(window?.localStorage?.getItem("currentPage") || "/");
        }
      }
    } catch (err) {}
  };

  return (
    <UserContext.Provider
      value={{
        userDetails: userState?.userDetails,
        userState,
        setUserState,
        updateCurrentUser,
        metadata,
        setMetadata,
        refreshMetadata: loadMetadata,
      }}
    >
      <SearchProvider>
        <RecoilRoot>
          <Router />
        </RecoilRoot>
      </SearchProvider>
    </UserContext.Provider>
  );
}

export default App;
