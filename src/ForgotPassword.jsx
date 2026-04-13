import { useContext, useState } from 'react';
import UserContext from './Context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';

export const ForgotPassword = ({ setFormState, formState, setShowForgotPassword, showForgotPassword }) => {
  const { userDetails } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [otpSent, setOTPSent] = useState(false);
  const [OTP, setOTP] = useState('');
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [message, setMessage] = useState();

  const forgotPassword = async (e) => {
    e.preventDefault();
    if (email === '') setErrorMessage('Please enter your email');
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
    if (OTP === '') setErrorMessage('Please enter your OTP');
    else if (password === '') setErrorMessage('Please enter your password');
    else if (password !== confirmPassword) setErrorMessage("Password doesn't match");
    else {
      Auth.forgotPasswordSubmit(email, OTP, password)
        .then((data) => {
          setIsPasswordChanged(true);
          setErrorMessage(null);
          setMessage('Password changed successfully');
          setTimeout(() => {
            setFormState({ ...formState, currentStage: 'login' });
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
      <div className="my-auto mx-auto xl:ml-20  dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0  w-full sm:w-3/4 md:w-auto ">
        <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">Forgot Password ?</h2>
        <form className="intro-x mt-8">
          <div className="intro-x mt-8">
            <input
              type="email"
              className=" py-3 px-4 block w-full  shadow-lg ring-0 focus:outline-0 border-none"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
            />
          </div>
          {errorMessage && !otpSent && (
            <div className=" text-red-600 dark:text-red-400 text-sm mt-4">{errorMessage}</div>
          )}
          {!otpSent ? (
            <div className=" mt-5 xl:mt-8 text-center xl:text-left">
              <button
                className="bg-[#20629b] w-full hover:scale-110 shadow-lg ring-0 focus:outline-0 border-none text-white py-3 px-4  align-top transition duration-500 ease-in-out"
                onClick={forgotPassword}
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="intro-x mt-8">
              <input
                type="number"
                className="mt-2  py-3 px-4 block w-full  shadow-lg ring-0 focus:outline-0 border-none"
                placeholder="OTP"
                required
                onChange={(e) => setOTP(e.target.value)}
                disabled={isPasswordChanged}
              />

              <input
                type="password"
                className="mt-2 py-3 px-4 block w-full  shadow-lg ring-0 focus:outline-0 border-none"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPasswordChanged}
              />
              <input
                type="password"
                className="mt-2 py-3 px-4 block w-full  shadow-lg ring-0 focus:outline-0 border-none"
                placeholder="Confirm Password"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPasswordChanged}
              />
              {errorMessage && otpSent && (
                <div className=" text-red-600 dark:text-red-400 text-sm mt-4">{errorMessage}</div>
              )}
              <div className=" mt-5 xl:mt-8 text-center xl:text-left">
                <button
                  className="bg-[#20629b] w-full hover:scale-110 shadow-lg ring-0 focus:outline-0 border-none text-white py-3 px-4  align-top transition duration-500 ease-in-out"
                  onClick={changePassword}
                >
                  Submit
                </button>
              </div>
              {message && <div className="text-green-600 dark:text-green-400 text-sm mt-4">{message}</div>}
            </div>
          )}
          <div className="flex text-slate-600 dark:text-slate-500 text-xs sm:text-sm mt-4">
            <div className="flex items-center mr-auto"></div>
            <span
              className="mx-2 cursor-pointer"
              onClick={() => {
                setFormState({ ...formState, currentStage: 'login' });
                setShowForgotPassword(!showForgotPassword);
              }}
            >
              Login
            </span>{' '}
            |{' '}
            <span
              className="mx-2 cursor-pointer"
              href=""
              onClick={() => {
                setFormState({ ...formState, currentStage: 'showSignUp' });
                setShowForgotPassword(!showForgotPassword);
              }}
            >
              Register
            </span>
          </div>
        </form>
      </div>
    </>
  );
};
