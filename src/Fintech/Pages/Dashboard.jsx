import { Auth } from "aws-amplify";
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../Context/UserContext";
import { data } from "../../assets/json/Fintech.json";

export const Fintech = () => {
  const navigate = useNavigate();
  const { userDetails, setUserState, userState } = useContext(UserContext);
  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
  }, []);

  return (
    <div className="mx-auto bg-[#fafafd] w-screen min-h-screen">
      <nav className="flex w-full md:flex-row flex-col  py-5 px-10 items-center justify-between">
        <img
          alt="logo"
          src="https://www.cloudthat.com/wp-content/themes/masterstudy-child/newfiles/images/logo.png"
          className="h-10 w-15 sm:mb-10 md:mb-0 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <button
          className="rounded-md  md:mt-0  mt-3 flex items-center hover:scale-110 md:w-48 hover:duration-300 bg-[#0056cd]  text-white shadow-2xl justify-center ring-0 focus:outline-0 border-none"
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
      </nav>
      {userDetails && (
        <div className="w-full flex items-center justify-end px-10 ">
          <h2 className="text-black text-sm text-center">
            You are logged in as {userDetails?.attributes?.email}
          </h2>
        </div>
      )}
      <div
        className={`grid-container mx-auto lg:p-10 grid  p-5 lg:px-10 mb-10 cursor-pointer gap-8 justify-center  ${
          data?.length > 1 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {data?.map((item, index) => (
          <div
            key={index}
            className="bg-slate-300 flex flex-col items-center rounded-lg h-auto w-full border-2 cursor-pointer hover:scale-105 hover:duration-300"
            onClick={() => {
              if (item?.path.includes("http")) {
                window.open(`${item?.path}`, "_blank");
              } else {
                navigate(`${item?.path}`);
              }
            }}
          >
            <img
              // src={`./src/assets/images/${item?.img}`}
              src={`/dashboard/images/${item?.img}`}
              className="w-full md:h-40 xl:h-72 rounded-lg hover:opacity-70 "
            />
            <h2 className="lg:text-xl font-semibold text-center p-2 text-sm text-[#20629B]">
              {item?.title}
            </h2>
          </div>
        ))}
      </div>
      <footer
        className="mx-auto w-full bg-black bottom-0 fixed
      "
      >
        <div className="flex flex-col w-full h-auto bg-black">
          <div className="flex w-full items-center justify-center h-auto py-5">
            <p className="text-white md:text-sm text-[12px] text-center">
              <span className="custom-text">
                © COPYRIGHT {new Date().getFullYear()} CLOUDTHAT TECHNOLOGIES
                PRIVATE LIMITED · ALL RIGHTS RESERVED ·
              </span>{" "}
              <a
                target="_blank"
                href="https://www.cloudthat.com/privacy-policy/"
                className="custom-link"
                rel="noreferrer"
              >
                PRIVACY POLICY
              </a>{" "}
              ·{" "}
              <a
                target="_blank"
                href="https://www.cloudthat.com/terms-of-use/"
                className="custom-link"
                rel="noreferrer"
              >
                TERMS OF USE
              </a>{" "}
              ·{" "}
              <a
                target="_blank"
                href="https://www.cloudthat.com/disclaimer/"
                className="custom-link"
                rel="noreferrer"
              >
                DISCLAIMER
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
