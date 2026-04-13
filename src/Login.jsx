import { Auth } from "aws-amplify";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "/genai/assets/Logo.png";
import illustrationUrl from "/genai/assets/illustration.svg";
import UserContext from "./Context/UserContext";
import { ForgotPassword } from "./ForgotPassword";
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
        let nextPage =
          window.localStorage.getItem("currentPage") || "dashboard";
        navigate("/" + nextPage);
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

          setErrorMessage(err.message);
        });
    }
  };
  return (
    <div className=" flex w-screen min-h-screen items-center justify-center">
      <div className="flex relative min-h-screen w-full  overflow-hidden lg:shadow-lg ">
        <div className="hidden md:flex flex-col min-h-full w-full bg-[#20629b] flex-1 items-center justify-center ">
          <a href="" className="-intro-x flex ">
            <img
              alt=""
              className="w-[230px] h-[40px] absolute top-4 left-4 lg:left-12"
              src={logoUrl}
            />
          </a>
          <div className=" flex flex-col items-center justify-center">
            <img alt="" className="-intro-x w-3/4 " src={illustrationUrl} />
            <div className=" text-white font-medium lg:text-4xl md:text-3xl leading-tight mt-10 text-center">
              Demos | cloudthat.com
            </div>
          </div>
        </div>

        <div className="flex  items-center justify-center flex-1 bg-[#fafafd] rounded-md w-full ">
          <div className=" flex flex-col md:max-h-[500px]  lg:max-h-[600px] md:p-2 p-5 xl:p-0 items-center justify-center   w-full">
            <div className=" mt-2 text-slate-400 xl:hidden text-center  ">
              Demos | cloudthat.com
            </div>
            <div className="mt-2 xl:mt-8 text-center xl:text-left flex-col w-full  flex  items-center justify-center md:p-4 xl:p-40 ">
              {formState?.currentStage === "login" && (
                <>
                  <button
                    className=" py-3 px-4 w-[100%]  align-top bg-[#20629b] text-white mb-3 hover:scale-110 hover:border-none  ring-0 focus:outline-0 transition duration-500 ease-in-out"
                    onClick={loginWithCloudThat}
                  >
                    Login with CloudThat
                  </button>

                  <button
                    className=" py-3 px-4 w-[100%]  align-top bg-[#20629b] text-white hover:scale-110 transition duration-500 ease-in-out "
                    onClick={handleLoginWithOthers}
                  >
                    Login with Amazon
                  </button>
                </>
              )}
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
                    <div className="mx-auto py-5 md:py-0  xl:px-10  w-full  ">
                      <h2 className=" font-bold text-2xl xl:text-3xl text-center ">
                        Sign In
                      </h2>
                      <>
                        <form className="flex flex-col w-full items-center justify-center p-5 md:p-0 ">
                          <div className=" mt-2 w-full  md:p-5">
                            <input
                              type="email"
                              placeholder="Email"
                              value={userCredentials.email}
                              onChange={(e) => setUserCredentials({...userCredentials, email: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className=" mt-2 w-full  md:p-5">
                            <input
                              type="password"
                              placeholder="Password"
                              value={userCredentials.password}
                              onChange={(e) => setUserCredentials({...userCredentials, password: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          {errorMessage && (
                            <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
                          )}
                          <button
                            type="submit"
                            onClick={signIn}
                            className="w-full mt-4 py-3 px-4 bg-[#20629b] text-white rounded-md hover:bg-blue-700 transition duration-300"
                          >
                            Sign In
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="mt-2 text-blue-600 hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </form>
                      </>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
