import { Auth } from "aws-amplify";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../Context/UserContext";
import { ForgotPassword } from "../ForgotPassword";
import { getProjectPath } from "../utils/constants";

const LoginModal = ({ isOpen, onClose, projectName, onBookDemo }) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    currentStage: "login",
  });
  const { setUserState, userState, updateCurrentUser } = useContext(UserContext);
  const [userCredentials, setUserCredentials] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginWithCloudThat = async () => {
    try {
      // Stay on current project details page and set auto-launch flag
      sessionStorage.setItem("postLoginRedirect", window.location.pathname + window.location.search);
      sessionStorage.setItem("autoLaunchProject", "true");

      onClose();

      await Auth.federatedSignIn({
        customProvider: "demos-cloudthat",
      });
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
    const domain = emailParts?.[1]?.toLowerCase();

    if (email === "") setErrorMessage("Please enter your email");
    else if (password === "") setErrorMessage("Please enter your password");
    else if (domain !== "amazon.com" && domain !== "cloudthat.com") {
      setErrorMessage("Access restricted to CloudThat employees only. Please book a demo for external users.");
      return;
    } else {
      Auth.signIn(email, password)
        .then(async (user) => {
          setUserState({ ...userState, userDetails: user });
          onClose();
          // Set auto-launch flag for ProjectDetails component
          sessionStorage.setItem("autoLaunchProject", "true");
        })
        .catch((err) => {
          console.log("errorWhileLogin", err);
          setErrorMessage(err?.message);
        });
    }
  };

  const handleBookDemo = () => {
    onClose();
    onBookDemo();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Access Demo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {formState?.currentStage === "login" && (
          <>
            <button
              className="w-full py-3 px-4 bg-primary text-white mb-3 hover:scale-105 transition duration-300 rounded-md"
              onClick={loginWithCloudThat}
            >
              Login with CloudThat
            </button>

            <button
              className="w-full py-3 px-4 bg-primary text-white hover:scale-105 transition duration-300 rounded-md"
              onClick={handleLoginWithOthers}
            >
              Login with Amazon
            </button>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Not a CloudThat employee?</p>
              <button
                onClick={handleBookDemo}
                className="w-full py-3 px-4 bg-primary text-white mb-3 hover:scale-105 transition duration-300 rounded-md"
              >
                Book a Demo
              </button>
            </div>
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
              <div>
                <h3 className="font-bold text-xl text-center mb-4">Sign In</h3>
                <form className="flex flex-col">
                  <input
                    type="email"
                    placeholder="Email"
                    value={userCredentials?.email}
                    onChange={(e) => setUserCredentials({ ...userCredentials, email: e?.target?.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={userCredentials?.password}
                    onChange={(e) => setUserCredentials({ ...userCredentials, password: e?.target?.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  {errorMessage && <div className="text-red-500 text-sm mb-3">{errorMessage}</div>}
                  <button
                    type="submit"
                    onClick={signIn}
                    className="w-full py-3 px-4 bg-[#20629b] text-white rounded-md hover:bg-blue-700 transition duration-300 mb-2"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Forgot Password?
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Not a CloudThat employee?</p>
                  <button
                    onClick={handleBookDemo}
                    className="w-full py-3 px-4 bg-[#1a365d] text-white hover:bg-[#2c5282] transition duration-300 rounded-md"
                  >
                    Book a Demo
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
