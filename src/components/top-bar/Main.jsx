import {
  Dropdown,
  DropdownContent,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Lucide,
} from "@/base-components"; // Replace with actual imports
import { Auth } from "aws-amplify";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { projects } from "../../assets/Examples.json";
import { admindata } from "../../assets/json/AdminPanel.json";
import { useSearch } from "../../Context/SearchContext.jsx";
import UserContext from "../../Context/UserContext";
import { checkAdminAccess } from "../../utils/adminAuth";
import { searchProjects } from "../../utils/searchUtils";

function Main() {
  const { userDetails, setUserState, userState, metadata } = useContext(UserContext);
  const { searchTerm, setSearchTerm } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = checkAdminAccess(userDetails);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const searchRef = useRef(null);

  // Filter projects based on search term using same logic as dashboard
  useEffect(() => {
    if (searchTerm && metadata && metadata.length > 0) {
      const filtered = searchProjects(metadata, searchTerm);

      setFilteredProjects(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredProjects([]);
      setShowDropdown(false);
    }
    setExpandedProject(null);
  }, [searchTerm, metadata]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if we're on a project detail page or any project page
  const isProjectPage = () => {
    const currentPath = location.pathname;
    return (
      currentPath.includes("/project-details/") ||
      (currentPath !== "/" &&
        currentPath !== "/dashboard" &&
        !currentPath.includes("/adminpanel") &&
        !currentPath.includes("/debug")
    ));
  };

  const handleProjectSelect = (project, industryName = null) => {
    setSearchTerm("");
    setShowDropdown(false);
    // Always navigate to project details page
    const projectName = project.title.replace(/\s+/g, "-"); // Replace spaces with hyphens
    const industryParam = industryName ? `?industry=${encodeURIComponent(industryName)}` : "";
    navigate(`/project-details/${projectName}${industryParam}`);
  };

  const handleLogout = async () => {
    try {
      await Auth.signOut();
      setUserState({
        ...userState,
        userDetails: null,
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const breadcrumbData = projects.find((item) => item.path === location.pathname);

  const adminData = admindata.find((item) => item.path === location.pathname);

  return (
    <>
      <div className="top-bar-boxed h-auto lg:h-[70px] z-[51] relative border-b border-white/[0.08] -mt-7 md:-mt-5 -mx-3 sm:-mx-8 px-3 sm:px-8 md:pt-0 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 lg:py-0 lg:h-[70px]">
          <div className="flex items-center justify-between lg:justify-start w-full lg:w-auto">
            <div className="flex items-center">
              <Link to="/" className="-intro-x hidden md:flex">
                <img
                  alt="Icewall Tailwind HTML Admin Template"
                  className="w-auto h-6"
                  src="/assets/images/CT_logo.png"
                  onClick={() => navigate("/")}
                  // onClick={() => window.location.reload()}
                />
              </Link>

              <nav aria-label="breadcrumb" className="-intro-x h-full">
                <ol className="breadcrumb breadcrumb-light">
                  <li className="breadcrumb-item">
                    <Link to="/">Application</Link>
                  </li>
                  {location.pathname === "/" ? (
                    <li className="breadcrumb-item active" aria-current="page">
                      Dashboard
                    </li>
                  ) : location.pathname === "/adminpanel" ? (
                    <li className="breadcrumb-item active" aria-current="page">
                      Admin Panel
                    </li>
                  ) : adminData ? (
                    <li className="breadcrumb-item active" aria-current="page">
                      {adminData.title}
                    </li>
                  ) : (
                    <li className="breadcrumb-item active" aria-current="page">
                      {breadcrumbData?.title}
                    </li>
                  )}
                </ol>
              </nav>
            </div>

            {/* Mobile user menu */}
            <div className="lg:hidden">
              {userDetails ? (
                <>
                  <Dropdown className="intro-x w-8 h-8">
                    <DropdownToggle
                      tag="div"
                      role="button"
                      className="w-auto h-8 rounded-full overflow-hidden shadow-lg image-fit zoom-in scale-110"
                    >
                      <img alt="User Logo" src="/assets/images/user.png" />
                    </DropdownToggle>
                    <DropdownMenu className="w-56">
                      <DropdownContent className="bg-primary/80 before:block before:absolute before:bg-black before:inset-0 before:rounded-md before:z-[-1] text-white">
                        <DropdownHeader tag="div" className="!font-normal">
                          <div className="font-medium">{userDetails?.attributes?.name}</div>
                        </DropdownHeader>
                        <DropdownDivider className="border-white/[0.08]" />
                        <DropdownItem className="hover:bg-white/5" >
                          <Lucide icon="Mail" className="w-4 h-4 mr-2" />
                          {userDetails?.attributes?.email}
                        </DropdownItem>
                        {isAdmin && (
                          <DropdownItem className="hover:bg-white/5" onClick={() => navigate("/adminpanel")}>
                            <Lucide icon="User" className="w-4 h-4 mr-2" />
                            Admin Panel
                          </DropdownItem>
                        )}

                        <DropdownDivider className="border-white/[0.08]" />
                        <DropdownItem className="hover:bg-white/5" onClick={handleLogout}>
                          <Lucide icon="ToggleRight" className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenu>
                  </Dropdown>
                </>
              ) : (
                <button
                  className="btn btn-outline-secondary w-32 inline-block mr-1 mb-2 text-white relative z-50 cursor-pointer"
                  onClick={handleLoginRedirect}
                  style={{ pointerEvents: "auto" }}
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Search Bar - Centered on entire page */}
          <div
            className="flex justify-center mt-3 lg:mt-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:w-screen px-4 lg:px-0"
            style={{ marginLeft: "0px" }}
          >
            <div
              ref={searchRef}
              className="relative w-full max-w-md lg:max-w-none"
              style={{ width: "400px", maxWidth: "90vw" }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm && filteredProjects.length > 0 && setShowDropdown(true)}
                className="search__input w-full py-3 border-transparent bg-slate-200 placeholder-theme-13 focus:bg-white focus:border-theme-9 focus:border-opacity-40 dark:bg-darkmode-400/70 dark:border-transparent dark:placeholder-slate-500 dark:focus:bg-darkmode-400 dark:focus:border-darkmode-400 rounded-full transition-all duration-300"
                placeholder="Search projects"
              />
              <Lucide
                icon="Search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500"
              />

              {/* Dropdown for search results - On all project pages */}
              {isProjectPage() && showDropdown && filteredProjects.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto">
                  {filteredProjects.map((project, index) => {
                    const industries = project.industries || [];
                    const hasMultipleIndustries = industries.length > 1;
                    const isExpanded = expandedProject === index;

                    return (
                      <div key={index} className="border-b border-gray-100 last:border-b-0">
                        <div
                          onClick={() => handleProjectSelect(project)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">{project.title}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {project.Primary_industry && (
                                  <span className="text-xs text-gray-500">({project.Primary_industry})</span>
                                )}
                                {hasMultipleIndustries && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedProject(isExpanded ? null : index);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    +{industries.length - 1} more
                                  </button>
                                )}
                              </div>
                            </div>
                            <Lucide icon="ExternalLink" className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Expanded industries */}
                        {isExpanded && hasMultipleIndustries && (
                          <div className="px-4 pb-3 bg-gray-50">
                            <div className="text-xs text-gray-600 font-medium mb-2">All Industries:</div>
                            <div className="flex flex-wrap gap-1">
                              {industries.map((industry, idx) => {
                                const industryName = industry.name || industry.industry_name || industry;
                                return (
                                  <span
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProjectSelect(project, industryName);
                                    }}
                                    className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full cursor-pointer hover:bg-blue-200 transition-colors duration-200"
                                  >
                                    {industryName}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center">
            {userDetails ? (
              <>
                <Dropdown className="intro-x w-8 h-8">
                  <DropdownToggle
                    tag="div"
                    role="button"
                    className="w-auto h-8 rounded-full overflow-hidden shadow-lg image-fit zoom-in scale-110"
                  >
                    <img alt="User Logo" src="/assets/images/user.png" />
                  </DropdownToggle>
                  <DropdownMenu className="w-56">
                    <DropdownContent className="bg-primary/80 before:block before:absolute before:bg-black before:inset-0 before:rounded-md before:z-[-1] text-white">
                      <DropdownHeader tag="div" className="!font-normal">
                        <div className="font-medium">{userDetails?.attributes?.name}</div>
                      </DropdownHeader>
                      <DropdownDivider className="border-white/[0.08]" />
                      <DropdownItem className="hover:bg-white/5 " >
                        <Lucide icon="Mail" className="w-4 h-4 mr-2" />
                        {userDetails?.attributes?.email}
                      </DropdownItem>
                      {isAdmin && (
                        <DropdownItem className="hover:bg-white/5" onClick={() => navigate("/adminpanel")}>
                          <Lucide icon="User" className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownItem>
                      )}

                      <DropdownDivider className="border-white/[0.08]" />
                      <DropdownItem className="hover:bg-white/5" onClick={handleLogout}>
                        <Lucide icon="ToggleRight" className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownItem>
                    </DropdownContent>
                  </DropdownMenu>
                </Dropdown>
              </>
            ) : (
              <button
                className="btn btn-outline-secondary w-32 inline-block mr-1 mb-2 text-white relative z-50 cursor-pointer"
                onClick={handleLoginRedirect}
                style={{ pointerEvents: "auto" }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
