import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';

import { LoadingIcon } from '@/base-components';
import UserContext from '../Context/UserContext';
//import { QuickSightEmbedding } from 'amazon-quicksight-embedding-sdk';

export const MetroPolisDashboard = () => {
  const experienceContainerRef = useRef(null);
  const dashboardRef = useRef(null);
  const { userDetails, setUserState, userState } = useContext(UserContext);
  const [embedSearchUrl, setEmbedSearchUrl] = useState('');
  const navigate = useNavigate();
  const [validUser, setValidUser] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    setLoader(true);
    setTimeout(() => {
      setLoader(false);
    }, 2000);
  }, [validUser]);
  const fetchEmbedQSearchUrl = async () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      type: 'Admin',
      q_search: true,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };
    try {
      const response = await fetch('https://zowlvx8au5.execute-api.ap-south-1.amazonaws.com/test', requestOptions);
      const data = await response.json();
      //   const data = {
      //     statusCode: 200,
      //     body: 'https://ap-south-1.quicksight.aws.amazon.com/embedding/72c812b4623d4814be7e10b04a0b85a6/q/search/nre/iJyTCKPPBAL6Dcwvmpmh7o5iMlMp78bZ?identityprovider=quicksight&isauthcode=true&code=AYABeEuL7swmgg8sSPt1M-lquiMAAAABAAdhd3Mta21zAExhcm46YXdzOmttczphcC1zb3V0aC0xOjE5Nzk5NjEyMjE0OTprZXkvZWYwZmM3YmEtMDExZS00MmNjLWJhNDctZWZmNDk1NGU3MTRjALgBAgEAeBDjShnmtNPeT29czTNlsCw0-GSxehGWsmwmcxOpzYMkAb0LDpm2XhJ63vQSQSrSR5YAAAB-MHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAywt9kpU0cTXgGlpWYCARCAOwk1EysdQOrLme66vja2hEz-KX5pJJ99WUfwgUr-34K4KCD7w9bdPKOwD2V15ab4nKxzdXcwUL_uttw5AgAAAAAMAAAQAAAAAAAAAAAAAAAAAE_lEGMP0FiaLPOvM1LDl1T_____AAAAAQAAAAAAAAAAAAAAAQAAAJuUlD3osANy-I_LgpGh3fh3s0PkiJSdmHn7D0fl-D8xIAYQj4e0sv1cpNPHlQnRESAgkS9pnb-dNEzJyWG3cSRBAHyILe2cSEFvr7cIMv-yez7YuB7hXUOIYKCIkE62odmLbwsFWoIDZRFXNuBoJUfwQqAhdCpmgwepeT8LvE3KQ04mdpVBVP82HfEof5y2l1v5fmjjLoMR25qC72juIfOHCWVEo6pOQhePcHw%3D',
      //   };
      //   return data?.body;
      const embedUrl = data.body; // Assuming the server returns an object with 'embedUrl' property
      if (embedUrl && embedUrl.startsWith('https://')) {
        let showResultsAbove = true;
        embedQSearchBar(embedUrl);
        setEmbedSearchUrl(embedUrl);
        // embedQSearchBar(embedUrl, showResultsAbove);
      }
    } catch (error) {
      console.error('Error fetching embed URL:', error);
    }
  };
  const fetchEmbedDashboardUrl = async () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      type: 'Admin',
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };
    try {
      const response = await fetch('https://zowlvx8au5.execute-api.ap-south-1.amazonaws.com/test', requestOptions);
      const data = await response.json();
      //   return data?.body;
      const embedUrl = data.body; // Assuming the server returns an object with 'embedUrl' property
      if (embedUrl && embedUrl.startsWith('https://')) {
        embedDashboard(embedUrl);
      }
      // if (embedUrl) {
      //   embedDashboard(embedUrl);
      // }
    } catch (error) {
      console.error('Error fetching embed URL:', error);
    }
  };
  const embedQSearchBar = async (embedUrl, showResultsAbove) => {
    const { createEmbeddingContext } = QuickSightEmbedding;

    const embeddingContext = await createEmbeddingContext({
      onChange: (changeEvent, metadata) => {
        // Q Search Embedding Context Change
      },
    });

    const frameOptions = {
      url: embedUrl,
      container: experienceContainerRef.current,
      height: '100%',
      width: '1000px',
      position: showResultsAbove ? 'top' : 'bottom',
    };

    const contentOptions = {
      theme: 'MIDNIGHT',
      allowTopicSelection: true,
      position: showResultsAbove ? 'top' : 'bottom',
      onMessage: (messageEvent) => {
        // Q Search Event
      },
    };

    await embeddingContext.embedQSearchBar(frameOptions, contentOptions);
  };

  const embedDashboard = async (embedUrl) => {
    const { createEmbeddingContext } = QuickSightEmbedding;

    const embeddingContext = await createEmbeddingContext({
      onChange: (changeEvent, metadata) => {
        // Context received a change
      },
    });

    const frameOptions = {
      url: embedUrl, // replace this value with the url generated via embedding API
      //   container: '#experience-container',
      container: dashboardRef.current,
      height: '100%',
      width: '100%',

      position: 'relative',
      onChange: (changeEvent, metadata) => {
        switch (changeEvent.eventName) {
          case 'FRAME_MOUNTED': {
            // Do something when the experience frame is mounted
            break;
          }
          case 'FRAME_LOADED': {
            // Do something when the experience frame is loaded
            break;
          }
        }
      },
    };

    const contentOptions = {
      hideTopicName: false,
      theme: 'CLASSIC',
      allowTopicSelection: true,
      onMessage: async (messageEvent, experienceMetadata) => {
        switch (messageEvent.eventName) {
          case 'Q_SEARCH_OPENED': {
            // Do something when Q Search content expanded
            break;
          }
          case 'Q_SEARCH_CLOSED': {
            // Do something when Q Search content collapsed
            break;
          }
          case 'Q_SEARCH_SIZE_CHANGED': {
            // Do something when Q Search size changed
            break;
          }
          case 'CONTENT_LOADED': {
            // Do something when the Q Search is loaded
            break;
          }
          case 'ERROR_OCCURRED': {
            break;
          }
        }
      },
    };
    await embeddingContext.embedDashboard(frameOptions, contentOptions);
  };
  useEffect(() => {
    //adding this below code which will remove padding to the body in case quicksight
    document.body.style.padding = '0';
    const fetchAndEmbed = async () => {
      await fetchEmbedDashboardUrl();
      await fetchEmbedQSearchUrl(); // Fetch and embed Q Search after dashboard
    };
    if (validUser) {
      fetchAndEmbed();
    }
    return () => {
      document.body.style.padding = ''; // Reset to default or previously defined value
    };
  }, [validUser]);

  //  const searchResultsRef = useRef();
  //  useEffect(() => {
  //    const handleOutsideClick = (event) => {
  //      if (searchResultsRef?.current && !searchResultsRef.current.contains(event.target)) {
  //        setShowSearchResults(false);
  //      }
  //    };

  //    document.addEventListener('click', handleOutsideClick);

  //    return () => {
  //      document.removeEventListener('click', handleOutsideClick);
  //    };
  //  }, []);

  return (
    <>
      {loader && <Loading />}
      {validUser ? (
        <div className="w-screen h-screen relative">
          {/* Search bar container */}
          <div className="absolute top-0  w-full bg-[#177199] h-[50px] py-2 z-10 flex gap-10 justify-center ">
            <div className="flex items-center  absolute left-0">
              <img
                src={`/dashboard/images/CT_logo_horizontal.svg`}
                alt=""
                className="h-7 w-[200px] md:ml-5 cursor-pointer"
                onClick={() => navigate('/fintech-forum')}
              />
            </div>
            <div className="z-10  fixed top-2  h-[50px]  ">
              <div className="h-full " ref={experienceContainerRef}></div>
            </div>
          </div>
          <div
            ref={dashboardRef}
            className="flex mx-auto  items-center absolute  top-[50px]   w-[100%] h-[100%]  "
          ></div>
        </div>
      ) : (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
          <div className="bg-white p-5 flex flex-col w-1/3 h-auto box">
            <h1 className="text-center text-2xl font-semibold text-primary my-4">Please Enter Secret Code</h1>
            <div className="flex flex-col justify-center items-center mt-5">
              <input
                type="password"
                className="intro-x login__input form-control py-3 px-4 block my-2 xl:w-[22rem]"
                placeholder="Enter Secret Code"
                onChange={(e) => {
                  setErrorMessage('');
                  setSecretCode(e.target.value);
                }}
              />

              <button
                className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top my-5"
                onClick={() => {
                  if (secretCode === 'DAonAWS@2024') {
                    setValidUser(true);
                  } else {
                    setErrorMessage('Please enter valid secret code');
                  }
                }}
              >
                Validate
              </button>
            </div>
            {errorMessage !== '' && <p className="text-red-500 text-center">{errorMessage}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export const Loading = () => {
  return (
    <div
      // style={{
      //   background: "rgba(5, 5, 5, 0.1)",
      //   backdropFilter: "blur(0.5px)",
      // }}
      className="fixed  top-0 left-0 right-0 bottom-0 z-50"
    >
      <div className="flex justify-center items-center ">
        <div
          className={`fixed  top-1/2
          `}
        >
          <div className="flex flex-col items-center justify-center w-full">
            <LoadingIcon icon="spinning-circles" className="w-16 h-16 my-2 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
