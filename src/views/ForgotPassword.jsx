import { useContext, useState } from "react";
import UserContext from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";

export default function ForgotPassword({
  setFormState,
  formState,
  setShowForgotPassword,
  showForgotPassword,
}) {
  const { userDetails } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [otpSent, setOTPSent] = useState(false);
  const [OTP, setOTP] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [message, setMessage] = useState();

  const forgotPassword = async (e) => {
    e.preventDefault();
    if (email === "") setErrorMessage("Please enter your email");
    else {
      Auth.forgotPassword(email)
        .then((data) => {
          setOTPSent(true);
        })
        .catch((err) => {
          setErrorMessage(err.message);
        });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (OTP === "") setErrorMessage("Please enter your OTP");
    else if (password === "") setErrorMessage("Please enter your password");
    else if (password !== confirmPassword)
      setErrorMessage("Password doesn't match");
    else {
      Auth.forgotPasswordSubmit(email, OTP, password)
        .then((data) => {
          setIsPasswordChanged(true);
          setErrorMessage(null);
          setMessage("Password changed successfully");
          setTimeout(() => {
            setFormState({ ...formState, currentStage: "login" });
            setShowForgotPassword(!showForgotPassword);
          }, 2000);
        })
        .catch((err) => {
          setErrorMessage(err.message);
        });
    }
  };
  return (
    <>
      <div className="container sm:px-10">
        <div className="block xl:grid grid-cols-2 gap-4">
          {/* BEGIN: Login Form */}
          <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
            <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
              <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">
                Forgot Password
              </h2>
              <div className="intro-x mt-8">
                <input
                  type="text"
                  className="intro-x login__input form-control py-3 px-4 block"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                />
              </div>
              {errorMessage && !otpSent && (
                <div className=" text-red-600 dark:text-red-400 text-sm mt-4 text-center">
                  {errorMessage}
                </div>
              )}
              {!otpSent ? (
                <div className=" mt-5 xl:mt-8 text-center xl:text-left flex justify-center">
                  <button
                    className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
                    onClick={forgotPassword}
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <div className="intro-x mt-8">
                  <input
                    type="number"
                    className="intro-x login__input form-control py-3 px-4 block mb-3"
                    placeholder="OTP"
                    required
                    onChange={(e) => setOTP(e.target.value)}
                    disabled={isPasswordChanged}
                  />

                  <input
                    type="password"
                    className="intro-x login__input form-control py-3 px-4 block mb-3"
                    placeholder="Password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPasswordChanged}
                  />
                  <input
                    type="password"
                    className="intro-x login__input form-control py-3 px-4 block"
                    placeholder="Confirm Password"
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPasswordChanged}
                  />
                  {errorMessage && otpSent && (
                    <div className=" text-red-600 dark:text-red-400 text-sm mt-4 text-center">
                      {errorMessage}
                    </div>
                  )}
                  <div className=" mt-5 xl:mt-8 text-center xl:text-left flex justify-center">
                    <button
                      className="btn btn-primary w-full py-3 px-4 xl:w-32 xl:mr-3 align-top"
                      onClick={changePassword}
                    >
                      Submit
                    </button>
                  </div>
                  {message && (
                    <div className="text-green-600 dark:text-green-400 text-sm mt-4">
                      {message}
                    </div>
                  )}
                </div>
              )}

              <div className="flex text-slate-600 dark:text-slate-500 text-xs sm:text-sm mt-4">
                <div className="flex items-center mr-auto"></div>
                <span
                  className="mx-2 cursor-pointer"
                  onClick={() => {
                    setFormState({ ...formState, currentStage: "login" });
                    setShowForgotPassword(!showForgotPassword);
                  }}
                >
                  Login
                </span>{" "}
                |{" "}
                <span
                  className="mx-2 cursor-pointer"
                  href=""
                  onClick={() => {
                    setFormState({ ...formState, currentStage: "showSignUp" });
                    setShowForgotPassword(!showForgotPassword);
                  }}
                >
                  Register
                </span>
              </div>
            </div>
          </div>
          {/* END: Login Form */}
        </div>
      </div>
    </>
  );
}
