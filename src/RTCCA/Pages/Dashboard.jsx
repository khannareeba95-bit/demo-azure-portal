import { Auth } from 'aws-amplify';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import UserContext from '../../Context/UserContext';
import AudioGallery from '../PagesComponents/AudioGallery';
import { JSONDATA } from '../utils/Constant';
import { JSONDATA as CTJSON } from '../utils/CtConstants';
import AudioPlayer from '../PagesComponents/AudioPlayer';
import { SentimentAnalysisPanel } from '../PagesComponents/SentimentAnalysisPanel';
import { IssueResolutionPanel } from '../PagesComponents/IssueResolutionPanel';
import { FinalReport } from '../PagesComponents/FinalReport';
import Lucide from '../../base-components/lucide/index';
import { BarChart2, BookCopy, ChevronRight, Headset, MessageSquareDot, Proportions } from 'lucide-react';
import { KeynotePanel } from '../PagesComponents/KeyNote';
import { RecommendationPanel } from '../PagesComponents/RecommendationPanel';

export const RTCCA = () => {
  const { userDetails, userState, setUserState } = useContext(UserContext);
  const navigate = useNavigate();
  const [audioPlayers, setAudioPlayers] = useState([]);
  const [audioPlayersCT, setAudioPlayersCT] = useState([]);
  const [loader, setLoader] = useState(false);
  const [statusOfInstance, setStatusOfInstance] = useState('InService');
  const [sentimentAnalysisResponses, setSentimentAnalysisResponses] = useState({});
  const [sentimentAnalysisResponsesCT, setSentimentAnalysisResponsesCT] = useState({});
  const [recommendedSolutions, setRecommendedSolutions] = useState({});
  const [recommendedSolutionsCT, setRecommendedSolutionsCT] = useState({});
  const [activeVideos, setActiveVideos] = useState([]);
  const [activeVideosCT, setActiveVideosCT] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(1);
  const [selectedAudioCT, setSelectedAudioCT] = useState(1);
  const [finalReport, setFinalReport] = useState({});
  const [finalReportCT, setFinalReportCT] = useState({});
  const [finalStudentReportCT, setFinalStudentReportCT] = useState({});
  const audioRefs = useRef([]);
  const [selection, setSelection] = useState('RTCCA Recordings');
  //const [keynoteResponses, setKeynoteResponses] = useState({});
  const [keynoteResponsesCT, setKeynoteResponsesCT] = useState({});
  const [recommendationResponses, setRecommendationResponses] = useState([]);

  const formatTitle = (title) => {
    let formattedTitle = title.replaceAll('__', ' - ').replaceAll('_', ' ');
    return formattedTitle;
  };

  useEffect(() => {
    document.title = 'Generative AI';
    window.localStorage.setItem('currentPage', window.location.pathname);
    let formattedAudios;
    if (selection === 'RTCCA Recordings') {
      formattedAudios = Object.entries(JSONDATA).map(([title, sources], index) => {
        const formattedTitle = formatTitle(title);
        return {
          id: index + 1,
          title: formattedTitle,
          source: sources[0],
        };
      });
      setAudioPlayers(formattedAudios);
      // setFinalReport(prev => {
      //   let rep = {};
      //   formattedAudios?.map(audio => rep[audio?.id] = "");
      //   return rep
      // })
    } else {
      formattedAudios = Object.entries(CTJSON).map(([title, sources], index) => {
        const formattedTitle = formatTitle(title);
        return {
          id: index + 1,
          title: formattedTitle,
          source: sources[0],
        };
      });
      setAudioPlayersCT(formattedAudios);
      // setFinalReportCT(prev => {
      //   let rep = {};
      //   formattedAudios?.map(audio => rep[audio?.id] = "");
      //   return rep
      // })
    }
    // Create audio players from JSONDATA
    // const formattedAudios = Object.entries(JSONDATA).map(([title, sources], index) => {
    //   const formattedTitle = formatTitle(title);
    //   return {
    //     id: index + 1,
    //     title: formattedTitle,
    //     source: sources[0],
    //   };
    // });

    const initialAudios = formattedAudios;
  }, [selection]);

  const handleSentimentAnalysis = (audioId, data) => {
    setSentimentAnalysisResponses((prev) => ({
      ...prev,
      [audioId]: [...(prev[audioId] || []), data],
    }));
  };

  const handleRecommendedSolution = (audioId, data) => {
    setRecommendedSolutions((prev) => ({
      ...prev,
      [audioId]: data,
    }));
  };
  const handleSentimentAnalysisCT = (audioId, data) => {
    setSentimentAnalysisResponsesCT((prev) => ({
      ...prev,
      [audioId]: [...(prev[audioId] || []), data],
    }));
  };

  const handleRecommendedSolutionCT = (audioId, data) => {
    setRecommendedSolutionsCT((prev) => ({
      ...prev,
      [audioId]: data,
    }));
  };

  const handleKeynoteResponseCT = (audioId, data) => {
    setKeynoteResponsesCT((prev) => ({
      ...prev,
      [audioId]: [...(prev[audioId] || []), data],
    }));
  };

  let audioPlayerFiltered = useMemo(() => {
    return audioPlayers?.find((audio) => audio?.id === selectedAudio);
  }, [selectedAudio, audioPlayers]);
  let audioPlayerFilteredCT = useMemo(() => {
    return audioPlayersCT?.find((audio) => audio?.id === selectedAudioCT);
  }, [selectedAudioCT, audioPlayersCT]);

  return (
    <>
      <div className="my-5 flex items-center ">
        <Lucide
          icon="ArrowLeftCircle"
          className="w-10 h-10 cursor-pointer my-5 mx-5"
          onClick={() => {
            navigate('/');
          }}
        />
        <h1 className=" text-2xl text-[#1a3b8b] font-bold ">
          VOCAL
        </h1>
      </div>
      {loader && <Loading />}
      <div className="flex flex-col h-screen bg-slate-50 rounded-lg overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[200px] border-r bg-white overflow-y-auto">
            <div className="border-b bg-gray-50">
              <div className="flex overflow-hidden">
                <h2
                  onClick={() => setSelection('RTCCA Recordings')}
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center cursor-pointer border-b-2 transition-colors ${
                    selection === 'RTCCA Recordings'
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  VOCAL Recordings
                </h2>
                <h2
                  onClick={() => setSelection('CloudThat Recordings')}
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center cursor-pointer border-b-2 transition-colors ${
                    selection === 'CloudThat Recordings'
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  CloudThat Recordings
                </h2>
              </div>
            </div>
            {selection === 'RTCCA Recordings' ? (
              <div className="divide-y">
                {audioPlayers.map((audio) => (
                  <div
                    key={audio.id}
                    className={`p-4 cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                      selectedAudio === audio.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => setSelectedAudio(audio.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        {selectedAudio === audio.id ? (
                          <div className="w-1 h-8 bg-[#1e3b8a] rounded-sm"></div>
                        ) : (
                          <div className="w-1 h-8 bg-transparent"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{audio.title}</p>
                        <p className="text-sm text-gray-500">{audio.duration}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-gray-400 ${selectedAudio === audio.id ? '#1e3b8a' : ''}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {audioPlayersCT.map((audio) => (
                  <div
                    key={audio.id}
                    className={`p-4 cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                      selectedAudioCT === audio.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => setSelectedAudioCT(audio.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        {selectedAudioCT === audio.id ? (
                          <div className="w-1 h-8 bg-[#1e3b8a] rounded-sm"></div>
                        ) : (
                          <div className="w-1 h-8 bg-transparent"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{audio.title}</p>
                        <p className="text-sm text-gray-500">{audio.duration}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 ${selectedAudioCT === audio.id ? '#1e3b8a' : ''}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {selection === 'RTCCA Recordings' ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Audio {selectedAudio}</h2>
                {audioPlayers.length > 0 && audioPlayerFiltered ? (
                  <AudioPlayer
                    audioRefs={audioRefs}
                    activeVideos={activeVideos}
                    setActiveVideos={setActiveVideos}
                    key={`audio-player-${audioPlayerFiltered?.id}`}
                    audio={audioPlayerFiltered}
                    audioId={audioPlayerFiltered?.id}
                    onSentimentAnalysis={(data) => handleSentimentAnalysis(audioPlayerFiltered?.id, data)}
                    onRecommendedSolution={(data) => handleRecommendedSolution(audioPlayerFiltered?.id, data)}
                    selection={selection}
                  />
                ) : (
                  'Audio recording is not available.'
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  {
                    <div
                      style={{
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      className="flex-1 bg-white rounded-lg  overflow-auto max-h-[400px]"
                    >
                      <h1 className="text-[18px] flex items-center gap-2 sticky top-0 p-4 bg-white text-[#1a3b8b] font-[600]  pb-[15px] mb-[5px]">
                        <BarChart2 className="text-gray-400" size={24} />
                        Customer Sentiment Analysis
                      </h1>

                      <div className="w-[97%] mx-auto h-[1px] bg-[#e9e8ea] mb-2" />

                      {!sentimentAnalysisResponses.hasOwnProperty(selectedAudio) ? (
                        <div className="text-center py-8 text-gray-500">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <BarChart2 className="text-gray-600" size={24} />
                          </div>
                          <p className="text-gray-600 text-md font-semibold mt-2">
                            Analysis results will appear here when processing is complete
                          </p>
                        </div>
                      ) : (
                        <SentimentAnalysisPanel
                          sentimentAnalysisResponses={sentimentAnalysisResponses}
                          audioPlayers={audioPlayers}
                          audioId={selectedAudio}
                          responses={sentimentAnalysisResponses?.[selectedAudio] || []}
                          index={1}
                        />
                      )}
                    </div>
                  }

                  <div
                    style={{
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    className="flex-1 bg-white rounded-lg overflow-auto max-h-[400px]"
                  >
                    <h1 className="text-[18px] flex items-center gap-2 sticky top-0 p-4 bg-white text-[#1a3b8b] font-[600]  pb-[15px] mb-[5px]">
                      <MessageSquareDot className="text-gray-400" size={24} />
                      Recommended Solutions
                    </h1>

                    <div className="w-[97%] mx-auto h-[1px] bg-[#e9e8ea] mb-2" />

                    {!recommendedSolutions.hasOwnProperty(selectedAudio) ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <MessageSquareDot className="text-gray-600" size={24} />
                        </div>
                        <p className="text-gray-600 font-semibold text-md mt-2">
                          Play an audio to see recommended solutions
                        </p>
                      </div>
                    ) : (
                      <IssueResolutionPanel
                        audioPlayers={audioPlayers}
                        audioId={selectedAudio}
                        solutions={recommendedSolutions?.[selectedAudio] || []}
                      />
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <h1 className="text-[18px] flex items-center gap-2 sticky top-0 p-4 bg-white text-[#1a3b8b] font-[600]  pb-[15px] mb-[5px]">
                      <Proportions className="text-gray-600" size={24} />
                      Report
                    </h1>
                  </div>
                  <div className="w-full">
                    <FinalReport
                      audioTitle={audioPlayers?.find((audio) => audio?.id === selectedAudio)?.title}
                      audio={audioPlayerFiltered}
                      selectedAudio={selectedAudio}
                      finalReport={finalReport}
                      setFinalReport={setFinalReport}
                      recommendedSolutions={recommendedSolutions}
                      selection={selection}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Audio {selectedAudioCT}</h2>
                {audioPlayersCT.length > 0 && audioPlayerFilteredCT ? (
                  <AudioPlayer
                    audioRefs={audioRefs}
                    activeVideos={activeVideosCT}
                    setActiveVideos={setActiveVideosCT}
                    key={`audio-player-${audioPlayerFilteredCT?.id}`}
                    audio={audioPlayerFilteredCT}
                    audioId={audioPlayerFilteredCT?.id}
                    onSentimentAnalysis={(data) => handleSentimentAnalysisCT(audioPlayerFilteredCT?.id, data)}
                    onRecommendedSolution={(data) => handleRecommendedSolutionCT(audioPlayerFilteredCT?.id, data)}
                    selection={selection}
                    onKeynoteResponse={(data) => handleKeynoteResponseCT(audioPlayerFilteredCT?.id, data)}
                    recommendationResponses={recommendationResponses}
                    setRecommendationResponses={setRecommendationResponses}
                  />
                ) : (
                  'Audio recording is not available.'
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                  {
                    <div
                      style={{
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      className="flex-1 bg-white rounded-lg  overflow-auto max-h-[350px]"
                    >
                      <h1 className="text-[18px] flex items-center gap-2 sticky top-0 p-4 bg-white text-[#1a3b8b] font-[600]  pb-[15px] mb-[5px]">
                        <BarChart2 className="text-gray-400" size={24} />
                        Customer Sentiment Analysis
                      </h1>

                      <div className="w-[97%] mx-auto h-[1px] bg-[#e9e8ea] mb-2" />

                      {!sentimentAnalysisResponsesCT.hasOwnProperty(selectedAudioCT) ? (
                        <div className="text-center py-8 text-gray-500">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <BarChart2 className="text-gray-600" size={24} />
                          </div>
                          <p className="text-gray-600 text-md font-semibold mt-2">
                            Analysis results will appear here when processing is complete
                          </p>
                        </div>
                      ) : (
                        <SentimentAnalysisPanel
                          sentimentAnalysisResponses={sentimentAnalysisResponsesCT}
                          audioPlayers={audioPlayersCT}
                          audioId={selectedAudioCT}
                          responses={sentimentAnalysisResponsesCT?.[selectedAudioCT] || []}
                          index={1}
                        />
                      )}
                    </div>
                  }

                  <div
                    style={{
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    className="flex-1 bg-white rounded-lg overflow-auto max-h-[350px]"
                  >
                    <h1 className="text-[18px] flex items-center gap-2 sticky top-0 p-4 bg-white text-[#1a3b8b] font-[600]  pb-[15px] mb-[5px]">
                      <MessageSquareDot className="text-gray-400" size={24} />
                      Recommended Solutions
                    </h1>

                    <div className="w-[97%] mx-auto h-[1px] bg-[#e9e8ea] mb-2" />

                    <RecommendationPanel recommendationResponses={recommendationResponses} audioId={selectedAudioCT} />
                  </div>
                  {/*  Keynote */}
                  <div
                    style={{
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    className="flex-1 bg-white rounded-lg overflow-auto max-h-[350px]"
                  >
                    <h1 className="text-[18px] flex items-center gap-2 sticky top-0 p-4 bg-white text-[#1a3b8b] font-[600] pb-[15px] mb-[5px]">
                      <BookCopy className="text-gray-400" size={24} />
                      Keynote
                    </h1>
                    <div className="w-[97%] mx-auto h-[1px] bg-[#e9e8ea] mb-2" />
                    <KeynotePanel
                      keynoteResponses={keynoteResponsesCT?.[selectedAudioCT] || []}
                      audioId={selectedAudioCT}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <h1 className="text-[18px] flex items-center gap-2 sticky top-0 p-4 bg-white text-[#1a3b8b] font-[600]  pb-[15px] mb-[5px]">
                      <Proportions className="text-gray-600" size={24} />
                      Report
                    </h1>
                  </div>
                  <div className="w-full">
                    <FinalReport
                      audioTitle={audioPlayersCT?.find((audio) => audio?.id === selectedAudioCT)?.title}
                      audio={audioPlayerFilteredCT}
                      selectedAudio={selectedAudioCT}
                      finalReport={finalReportCT}
                      setFinalReport={setFinalReportCT}
                      recommendedSolutions={recommendedSolutionsCT}
                      selection={selection}
                      finalStudentReportCT={finalStudentReportCT}
                      setFinalStudentReportCT={setFinalStudentReportCT}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const Loading = () => {
  return (
    <div
      style={{
        background: 'rgba(5, 5, 5, 0.1)',
        backdropFilter: 'blur(0.5px)',
      }}
      className="fixed top-0 left-0 right-0 bottom-0"
    >
      <div className="flex justify-center items-center">
        <div className="fixed top-1/2">
          <Loader />
        </div>
      </div>
    </div>
  );
};

export const Loader = () => {
  return (
    <div className="dot-spinner">
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
    </div>
  );
};
