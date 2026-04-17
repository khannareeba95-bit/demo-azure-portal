import React, { useEffect, useRef, useState, useContext } from 'react';
import fetchData from '../../config/ApiCall';
import UserContext from '../../Context/UserContext';

const AudioPlayer = ({
  activeVideos,
  setActiveVideos,
  audio,
  audioId,
  onSentimentAnalysis,
  onRecommendedSolution,
  selection,
  onKeynoteResponse,
  recommendationResponses,
  setRecommendationResponses,
}) => {
  const audioRef = useRef(null);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalsPassed, setIntervalsPassed] = useState(0);
  const [recommendedSolutionCalled, setRecommendedSolutionCalled] = useState(false);
  const { userDetails } = useContext(UserContext);
  const [keynoteIntervalsPassed, setKeynoteIntervalsPassed] = useState(0);
  const [keynoteResponses, setKeynoteResponses] = useState([]);
  // Adding  new state for recommended solutions
  const [recommendationIntervalsPassed, setRecommendationIntervalsPassed] = useState(0);

  const callSentimentalAnalysis = async (startTime, endTime) => {
    try {
      const payload = {
        start: startTime,
        end: endTime,
        object_key: audio?.source?.split('/').pop().split('.')[0],
      };
      const url = import.meta.env.VITE_RTCCA_API_URL + '/get-sentiment';
      const response = await fetchData(payload, url);
      if (response && response.statusCode === 200) {
        const data = {
          sentiment: response?.body?.sentiment,
          Start_Time: response?.Start_Time,
          End_Time: response?.End_Time,
        };
        onSentimentAnalysis(data);
      } else if (response?.errorMessage) {
        setError('Something went wrong..');
      }
    } catch (error) {
      console.log('error', error);
      setError('Something went wrong..');
    }
  };

  const callRecommendedSolution = async (startTime, endTime) => {
    try {
      const payload = {
        start: startTime,
        end: endTime,
        object_key: audio?.source?.split('/').pop().split('.')[0],
      };
      const url = import.meta.env.VITE_RTCCA_API_URL + '/get-recommendation';
      const response = await fetchData(payload, url);
      if (response && response?.statusCode === 200) {
        const data = [
          {
            time: response?.End_Time,
            solution: response?.body,
          },
        ];
        onRecommendedSolution(data);
      } else if (response?.errorMessage) {
        setErrorMessage('Something went wrong..');
      }
    } catch (error) {
      console.log('error', error);
      setErrorMessage('Something went wrong..');
    }
  };
  // Add keynote API call function
  const callKeynoteAPI = async (startTime, endTime, previousKeynotes = []) => {
    try {
      const payload = {
        start: startTime,
        end: endTime,
        object_key: audio?.source?.split('/').pop().split('.')[0],
        keynote: previousKeynotes.join(' '), // Concatenate all previous keynotes
      };

      const url = import.meta.env.VITE_RTCCA_API_URL + '/get-keynote';
      const response = await fetchData(payload, url);

      if (response && response?.statusCode === 200) {
        const keynoteData = {
          startTime,
          endTime,
          keynote: response?.keynote || '',
          timestamp: new Date().toISOString(),
        };

        setKeynoteResponses((prev) => [...prev, keynoteData]);
        onKeynoteResponse(keynoteData);
      }
    } catch (error) {
      console.log('Keynote API error', error);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    if (audioRef.current.ended) {
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      const currentTime = audioRef.current.currentTime;
      const currentInterval = Math.floor(currentTime / 10) * 10;
      const keynoteInterval = Math.floor(currentTime / 20) * 20; // 20-second intervals for keynote
      const recommendationInterval = Math.floor(currentTime / 60) * 60; // 60-second intervals for recommendations

      // Call recommended solution after 30 seconds
      if (currentTime >= 30 && !recommendedSolutionCalled && selection === 'RTCCA Recordings') {
        callRecommendedSolution('00:00:00', '00:02:00');
        setRecommendedSolutionCalled(true);
      }

      // Call sentiment analysis every 10 seconds
      if (currentInterval > intervalsPassed * 10) {
        const newIntervalsPassed = currentInterval / 10;
        setIntervalsPassed(newIntervalsPassed);

        const intervalStart = Math.floor(currentInterval / 120) * 120;
        const startMinutes = Math.floor(intervalStart / 60);
        const startSeconds = (intervalStart % 60).toString().padStart(2, '0');

        const endMinutes = Math.floor(currentInterval / 60);
        const endSeconds = (currentInterval % 60).toString().padStart(2, '0');

        const startTime = `00:${startMinutes.toString().padStart(2, '0')}:${startSeconds}`;
        const endTime = `00:${endMinutes.toString().padStart(2, '0')}:${endSeconds}`;

        callSentimentalAnalysis(startTime, endTime);
      }
      // Call keynote API  and Recommendation API for Cloudthat Recordings
      if (selection === 'CloudThat Recordings') {
        if (keynoteInterval > keynoteIntervalsPassed * 20 && currentTime >= 20) {
          const newKeynoteIntervalsPassed = keynoteInterval / 20;
          setKeynoteIntervalsPassed(newKeynoteIntervalsPassed);

          const startMinutes = Math.floor((keynoteInterval - 20) / 60);
          const startSeconds = ((keynoteInterval - 20) % 60).toString().padStart(2, '0');
          const endMinutes = Math.floor(keynoteInterval / 60);
          const endSeconds = (keynoteInterval % 60).toString().padStart(2, '0');

          const startTime = `00:${startMinutes.toString().padStart(2, '0')}:${startSeconds}`;
          const endTime = `00:${endMinutes.toString().padStart(2, '0')}:${endSeconds}`;

          // Get all previous keynote responses
          const previousKeynotes = keynoteResponses?.map((item) => item?.keynote);
          callKeynoteAPI(startTime, endTime, previousKeynotes);
        }
        // Call recommended solution every 60 seconds (1 minute)
        if (recommendationInterval > recommendationIntervalsPassed * 60 && currentTime >= 60) {
          const newRecommendationIntervalsPassed = recommendationInterval / 60;
          setRecommendationIntervalsPassed(newRecommendationIntervalsPassed);

          // Get all previous keynote responses to send with recommendation
          const previousKeynotes = keynoteResponses?.map((item) => item?.keynote);
          callRecommendedSolutionForCT(previousKeynotes);
        }
      }
    }
  };

  const callRecommendedSolutionForCT = async (previousKeynotes = []) => {
    try {
      const payload = {
        keynote: previousKeynotes.join(' '), // Only keynote, no time parameters
      };
      const url = import.meta.env.VITE_RTCCA_API_URL + '/get-recommendation-with-keynote';
      const response = await fetchData(payload, url);
      if (response && response?.statusCode === 200) {
        const recommendationData = {
          solution: response?.recommendations,
          timestamp: new Date().toISOString(),
        };

        setRecommendationResponses((prev) => [...prev, recommendationData]);
        onRecommendedSolution([recommendationData]);
      } else if (response?.errorMessage) {
        setErrorMessage('Something went wrong..');
      }
    } catch (error) {
      console.log('error', error);
      setErrorMessage('Something went wrong..');
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;

    const handlePlay = () => {
      setActiveVideos((prev) => [...prev, audio?.id]);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setActiveVideos(activeVideos?.filter((_, i) => i + 1 != audio?.id));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setActiveVideos(activeVideos?.filter((_, i) => i + 1 != audio?.id));
    };

    if (audioElement && userDetails) {
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handleEnded);
    }

    return () => {
      if (audioElement && userDetails) {
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, [userDetails]);

  // Set up the interval for checking audio time
  useEffect(() => {
    let timeUpdateInterval;

    if (isPlaying) {
      timeUpdateInterval = setInterval(handleTimeUpdate, 1000);
    }

    return () => {
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
      }
    };
  }, [isPlaying, intervalsPassed, recommendedSolutionCalled]);

  return (
    <div
      style={{
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
      className="w-full bg-white p-5 rounded-lg relative"
    >
      {!userDetails && (
        <div className="absolute left-0 right-0 bottom-0 top-0 z-10 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm">
          <span className="text-primary font-bold text-lg px-4 py-2 bg-white rounded-xl shadow-sm">
            Please login to access the audio
          </span>
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">{audio.title}</span>

          {/* {activeVideos?.includes(audio?.id) && (
            <div className="relative inline-flex h-3 w-3">
              <div className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></div>
              <div className="relative inline-flex h-3 w-3 rounded-full bg-green-400"></div>
            </div>
          )} */}
        </div>
      </div>

      <audio ref={audioRef} src={audio?.source} controls className="w-full" disabled={!userDetails}></audio>

      {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
    </div>
  );
};

export default AudioPlayer;
