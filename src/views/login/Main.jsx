import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import dom from "@left4code/tw-starter/dist/js/dom";
import logoUrl from "@/assets/images/CT_logo.png";
import illustrationUrl from "@/assets/images/illustration.svg";
import { useEffect } from "react";
import { Auth } from "aws-amplify";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../Context/UserContext";
import ForgotPassword from "../ForgotPassword";

function Main() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    currentStage: "login",
    showOtp: false,
    otp: "",
    individualName: "",
    individualEmail: "",
    individualMobile: "",
    individualPassword: "",
    individualConfirmPassword: "",
  });
  const [askForOTP, setAskForOTP] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const { setUserState, userState, updateCurrentUser } =
    useContext(UserContext);
  const [userCredentials, setUserCredentials] = useState({
    email: "",
    password: "",
  });
  const [userForChangePassword, setUserForChangePassword] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const loginWithCloudThat = async () => {
    try {
      const user = await Auth.federatedSignIn({
        customProvider: "demos-cloudthat",
      });
      if (user) {
        let currentPath = window.location.pathname;
        if (currentPath === "/login") {
          let nextPage = window.localStorage.getItem("currentPage") || "";
          navigate(nextPage || "/");
        } else {
          navigate(-1); // Go back to previous page
        }
      }
    } catch (error) {
      console.log("error signing in", error);
    }
  };

  const handleLoginWithOthers = () => {
    setFormState({
      currentStage: "amazonLogin",
    });
    setErrorMessage("");
  };

  const signIn = async (e) => {
    e.preventDefault();
    let email = userCredentials?.email;
    let password = userCredentials?.password;
    const emailParts = email?.split("@");
    const domain = emailParts[1]?.toLowerCase();
    if (email === "") setErrorMessage("Please enter your email");
    else if (password === "") setErrorMessage("Please enter your password");
    else if (domain !== "amazon.com" && domain !== "cloudthat.com")
      setErrorMessage("Please enter valid email");
    else {
      Auth.signIn(email, password)
        .then(async (user) => {
          if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
            setUserForChangePassword(user);
            setShowChangePassword(true);
          } else {
            setUserState({ ...userState, userDetails: user });
            let nextPage = "dashboard";
            navigate("/" + nextPage);
          }
        })
        .catch((err) => {
          console.log("errorWhileLogin", err);
          if (err?.message?.includes("User is not confirmed.")) {
            setFormState({ ...formState, currentStage: "showOtp" });
          }
          setErrorMessage(err.message);
        });
    }
  };

  const changeState = (param, value) => {
    setFormState({ ...formState, [param]: value });
  };

  const signUp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formState?.individualName) setErrorMessage("Please enter your name");
    else if (!formState?.individualEmail) setErrorMessage("Please enter email");
    else if (!formState?.individualPassword)
      setErrorMessage("Please enter your password");
    else if (
      formState?.individualPassword !== formState?.individualConfirmPassword
    )
      setErrorMessage("Password doesn't match");
    else {
      const emailParts = formState?.individualEmail?.split("@");
      const domain = emailParts[1]?.toLowerCase();
      if (domain !== "amazon.com" && domain !== "cloudthat.com")
        setErrorMessage("Please enter valid email");
      else {
        Auth.signUp({
          username: formState?.individualEmail,
          password: formState?.individualPassword,
          attributes: {
            email: formState?.individualEmail,
            name: formState?.individualName,
          },
        })
          .then((result) => {
            setAskForOTP(true);
          })
          .catch((err) => {
            console.log("err", err);
            setErrorMessage(err.message);
          });
      }
    }
  };
  const verifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedOTP = formState?.otp?.trim();
    if (trimmedOTP) {
      let email = formState?.individualEmail;
      let password = formState?.individualPassword;
      Auth.confirmSignUp(email, trimmedOTP)
        .then(async (result) => {
          Auth.signIn(email, password).then(async (result) => {
            await updateCurrentUser();
            navigate("/");
          });
        })
        .catch((err) => {
          console.log("errMessage", err);
          setErrorMessage(err.message);
        });
    } else {
      setErrorMessage("Please enter OTP");
    }
  };
  const changePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) setErrorMessage("Please enter your new password");
    else if (!newPasswordConfirmation)
      setErrorMessage("Please enter your new password confirmation");
    else if (newPassword !== newPasswordConfirmation)
      setErrorMessage("Password and password confirmation do not match");
    else {
      Auth.completeNewPassword(userForChangePassword, newPassword)
        .then(async (user) => {
          setUserState({ ...userState, userDetails: user });
          let response = await updateCurrentUser();
          navigate("/");
        })
        .catch((err) => {
          console.log("err", err);
          setErrorMessage(err.message);
        });
    }
  };
  useEffect(() => {
    dom("body").removeClass("main").removeClass("error-page").addClass("login");
  }, []);

  return (
    <>
      <div>
        <div className="container sm:px-10">
          <div className="block xl:grid grid-cols-2 gap-4">
            {/* BEGIN: Login Info */}
            <div className="hidden xl:flex flex-col min-h-screen">
              <a href="/" className="-intro-x flex items-center pt-5">
                <img
                  alt="Icewall Tailwind HTML Admin Template"
                  className="w-auto h-6"
                  src={logoUrl}
                />
              </a>
              <div className="my-auto">
                <img
                  alt="Midone Tailwind HTML Admin Template"
                  className="-intro-x w-1/2 -mt-16"
                  src={illustrationUrl}
                />
                <div className="-intro-x text-white font-medium text-4xl leading-tight mt-10">
                  Demos | cloudthat.com
                </div>
              </div>
            </div>
            {/* END: Login Info */}
            {/* BEGIN: Login Form */}
            <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
              <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
                <div className="intro-x mt-2 text-slate-400 xl:hidden text-center">
                  Demos | cloudthat.com
                </div>
                <div className="intro-x mt-8">
                  {formState?.currentStage === "login" && (
                    <>
                      <button
                        className="btn btn-primary py-3 px-4 w-full xl:mr-3 align-top mb-3"
                        onClick={loginWithCloudThat}
                      >
                        Login with CloudThat
                      </button>

                      
                    </>
                  )}
                </div>
                {formState?.currentStage === "amazonLogin" && (
                  <>
                    {showForgotPassword ? (
                      <ForgotPassword
                        setFormState={setFormState}
                        formState={formState}
                        setShowForgotPassword={setShowForgotPassword}
                        showForgotPassword={showForgotPassword}
                      />
                    ) : (
                      <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
                        <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">
                          Sign In
                        </h2>
                        <div className="intro-x mt-8">
                          <input
                            type="text"
                            className="intro-x login__input form-control py-3 px-4 block"
                            placeholder="Email"
                            required
                            onChange={(e) =>
                              setUserCredentials({
                                ...userCredentials,
                                email: e.target.value.trim(),
                              })
                            }
                            disabled={showChangePassword}
                          />
                          <input
                            type="password"
                            className="intro-x login__input form-control py-3 px-4 block mt-4"
                            placeholder="Password"
                            required
                            onChange={(e) =>
                              setUserCredentials({
                                ...userCredentials,
                                password: e.target.value.trim(),
                              })
                            }
                            disabled={showChangePassword}
                          />
                          {showChangePassword && (
                            <>
                              <input
                                type="password"
                                className="intro-x login__input form-control py-3 px-4 block mt-4"
                                placeholder="New Password"
                                required
                                onChange={(e) =>
                                  setNewPassword(e.target.value.trim())
                                }
                              />
                              <input
                                type="password"
                                className="intro-x login__input form-control py-3 px-4 block mt-4"
                                placeholder="Confirm Password"
                                required
                                onChange={(e) =>
                                  setNewPasswordConfirmation(
                                    e.target.value.trim()
                                  )
                                }
                              />
                            </>
                          )}
                        </div>
                        <div className="intro-x flex text-slate-600 dark:text-slate-500 text-xs sm:text-sm mt-4">
                          <div className="flex items-center mr-auto">
                            <input
                              id="remember-me"
                              type="checkbox"
                              className="form-check-input border mr-2"
                            />
                            <label
                              className="cursor-pointer select-none"
                              htmlFor="remember-me"
                            >
                              Remember me
                            </label>
                          </div>
                          <span
                            class="cursor-pointer"
                            onClick={() =>
                              setShowForgotPassword(!showForgotPassword)
                            }
                          >
                            Forgot Password?
                          </span>
                        </div>
                        {errorMessage && (
                          <div className=" text-red-600 dark:text-red-400 text-sm mt-4 text-center">
                            {errorMessage}
                          </div>
                        )}
                        <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                          {showChangePassword ? (
                            <button
                              className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
                              onClick={changePassword}
                            >
                              Change Password
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
                              onClick={signIn}
                            >
                              Login
                            </button>
                          )}
                          <button
                            className="btn btn-outline-secondary py-3 px-4 w-full xl:w-32 mt-3 xl:mt-0 align-top"
                            onClick={() => {
                              setFormState({
                                ...formState,
                                currentStage: "showSignUp",
                              });
                              setErrorMessage("");
                            }}
                          >
                            Register
                          </button>
                        </div>
                        <div className="intro-x mt-10 xl:mt-8 text-slate-600 dark:text-slate-500 text-center xl:text-left">
                          By signin up, you agree to our
                          <a
                            className="text-primary dark:text-slate-200 ml-1 mr-1"
                            href=""
                          >
                            Terms and Conditions
                          </a>
                          &amp;
                          <a
                            className="text-primary dark:text-slate-200 ml-1"
                            href=""
                          >
                            Privacy Policy
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {formState?.currentStage === "showSignUp" && (
                  <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
                    <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
                      <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">
                        Sign Up
                      </h2>
                      <div className="intro-x mt-8">
                        {!askForOTP && (
                          <>
                            <input
                              type="text"
                              className="intro-x login__input form-control py-3 px-4 block mt-4"
                              placeholder="Full Name"
                              onChange={(e) =>
                                changeState(
                                  "individualName",
                                  e.target.value.trim()
                                )
                              }
                              required
                              readOnly={askForOTP}
                            />
                          </>
                        )}
                        <input
                          type="text"
                          className="intro-x login__input form-control py-3 px-4 block mt-4"
                          placeholder="Email"
                          value={formState.individualEmail}
                          onBlur={(e) => {
                            if (e.target.value === "") {
                              setErrorMessage(
                                "Please enter a valid e-mail address"
                              );
                            } else {
                              setErrorMessage();
                            }
                          }}
                          onChange={(e) =>
                            changeState(
                              "individualEmail",
                              e.target.value?.toLowerCase().trim()
                            )
                          }
                          required
                          readOnly={askForOTP}
                        />

                        {!askForOTP && (
                          <>
                            <input
                              type="password"
                              className="intro-x login__input form-control py-3 px-4 block mt-4"
                              placeholder="Password"
                              onChange={(e) =>
                                changeState(
                                  "individualPassword",
                                  e.target.value.trim()
                                )
                              }
                              required
                              readOnly={askForOTP}
                            />
                            {!askForOTP && (
                              <input
                                type="password"
                                className="intro-x login__input form-control py-3 px-4 block mt-4"
                                placeholder="Password Confirmation"
                                onChange={(e) =>
                                  changeState(
                                    "individualConfirmPassword",
                                    e.target.value.trim()
                                  )
                                }
                                required
                              />
                            )}
                            {errorMessage && (
                              <div className=" text-red-600 dark:text-red-400 text-sm mt-4 text-center">
                                {errorMessage}
                              </div>
                            )}
                            <div className="intro-x mt-10 xl:mt-8 text-slate-600 dark:text-slate-500 text-center xl:text-left">
                              By signin up, you agree to our
                              <a
                                className="text-primary dark:text-slate-200 ml-1 mr-1"
                                href=""
                              >
                                Terms and Conditions
                              </a>
                              &amp;
                              <a
                                className="text-primary dark:text-slate-200 ml-1"
                                href=""
                              >
                                Privacy Policy
                              </a>
                            </div>
                            <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                              <button
                                className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
                                onClick={signUp}
                                disabled={askForOTP}
                              >
                                Register
                              </button>
                              <button
                                className="btn btn-outline-secondary py-3 px-4 w-full xl:w-32 mt-3 xl:mt-0 align-top"
                                onClick={() =>
                                  setFormState({
                                    ...formState,
                                    currentStage: "login",
                                  })
                                }
                              >
                                Sign in
                              </button>
                            </div>
                          </>
                        )}

                        {askForOTP && (
                          <>
                            <a
                              href=""
                              className="intro-x text-slate-500 block mt-2 text-xs sm:text-sm"
                            >
                              What is a secure password?
                            </a>
                            <input
                              type="text"
                              className="intro-x login__input form-control py-3 px-4 block mt-4"
                              placeholder="OTP Confirmation"
                              onChange={(e) =>
                                setFormState({
                                  ...formState,
                                  otp: e.target.value.trim(),
                                })
                              }
                            />
                            {errorMessage && (
                              <div className="text-red-600 dark:text-red-400 text-sm mt-4 text-center">
                                {errorMessage}
                              </div>
                            )}
                            <div className=" mt-5 xl:mt-8 text-center w-full">
                              <button
                                type="button"
                                className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
                                onClick={verifyOTP}
                              >
                                Submit
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* END: Login Form */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
