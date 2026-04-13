import React, { useState } from 'react';
import SideMenu from '../PagesComponent/SideMenu';

function Dashboard() {
  const [validUser, setValidUser] = useState(true); // Changed from false to true
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState(null);
  return (
    <>
      {validUser ? (
        <SideMenu />
      ) : (
        // Commented out secret code UI
        null
        // <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
        //   <div className="bg-white p-5 flex flex-col w-1/3 h-auto box">
        //     <h1 className="text-center text-2xl font-semibold text-primary my-4">Please Enter Secret Code</h1>
        //     <div className="flex flex-col justify-center items-center mt-5">
        //       <input
        //         type="password"
        //         className="intro-x login__input form-control py-3 px-4 block my-2 xl:w-[22rem]"
        //         placeholder="Enter Secret Code"
        //         onChange={(e) => {
        //           setError('');
        //           setSecretCode(e.target.value);
        //         }}
        //       />

        //       <button
        //         className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top my-5"
        //         onClick={() => {
        //           if (secretCode === 'ArogyaMitra#2o25@') {
        //             setValidUser(true);
        //           } else {
        //             setError('Please enter valid secret code');
        //           }
        //         }}
        //       >
        //         Validate
        //       </button>
        //     </div>
        //     {error !== '' && <p className="text-red-500 text-center">{error}</p>}
        //   </div>
        // </div>
      )}
    </>
  );
}

export default Dashboard;