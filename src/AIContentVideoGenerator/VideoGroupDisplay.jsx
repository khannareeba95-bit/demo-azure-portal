import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, PlayCircle, Film, SquareX } from 'lucide-react';
import { Lucide, Modal, ModalBody } from '@/base-components';

export const VideoGroupDisplay = ({ tab, group, openModal, error, loading, videoGroups, videoIndex }) => {
  const [showMergedVideo, setShowMergedVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentGroupRef = useRef(null);
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === now.toDateString()) {
      return `Today ${time}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${time}`;
    }
    return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} ${time}`;
  };

  //used to show the latest generated video
  useEffect(() => {
    if (tab == 'generate' && videoGroups && videoGroups?.length > 0 && videoIndex === videoGroups?.length) {
      const videoToPlay = videoGroups[0]?.videos[0];
      setIsModalOpen(true);
      setSelectedVideo(videoToPlay);
      currentGroupRef.current = videoGroups[0];
    }
  }, [tab, videoGroups?.videos, videoIndex]);

  // used to play the videos in loop where im checking if the group has ended and if yes then we reset the loop
  const handleVideoEnd = () => {
    const videos = currentGroupRef.current?.videos || group?.videos;
    if (!videos) return;
    const currentIndex = videos?.findIndex((v) => v.id === selectedVideo?.id);

    if (isModalOpen && currentIndex !== -1 && currentIndex < videos?.length - 1) {
      setSelectedVideo(videos[currentIndex + 1]);
    } else if (isModalOpen && currentIndex === videos?.length - 1) {
      setSelectedVideo(videos[0]);
    }
  };

  return (
    <>
      <div className="p-2 bg-slate-50 rounded-lg !m-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-slate-600">
            <span className="font-medium">"{group?.tagline}"</span>
            <span className="mx-2">•</span>
            <span>{formatTimestamp(group?.timestamp)}</span>
          </div>
          {group?.mergedVideoLink && (
            <button
              onClick={() => setShowMergedVideo(!showMergedVideo)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#1e3b8b] hover:text-[#1e3b8b] transition-colors"
            >
              <Film size={16} />
              {showMergedVideo ? 'Hide Combined Version' : 'Play Combined Version'}
              {showMergedVideo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {/* Merged Video Section */}
        {showMergedVideo && group?.mergedVideoLink ? (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm font-medium text-slate-700 mb-2">Combined Clips</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className="group relative  bg-slate-100 rounded-lg "
                onClick={() => openModal(group?.mergedVideoLink, true)}
              >
                <video src={group?.mergedVideoLink} type="video/mp4" className="w-full h-full" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {group?.videos?.map((video) => (
              <div
                key={video?.id}
                className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedVideo(video);
                  setIsModalOpen(true);
                  currentGroupRef.current = group;
                }}
              >
                <video src={video?.videoUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
            <Modal
              show={isModalOpen && selectedVideo}
              size="modal-xl"
              onHidden={() => {
                setSelectedVideo(null);
                setIsModalOpen(false);
                currentGroupRef.current = null;
              }}
              className="overflow-hidden rounded-2xl bg-black/50"
            >
              <button
                className="absolute top-1 right-1 p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors z-50"
                onClick={() => {
                  setIsModalOpen(false);
                  currentGroupRef.current = null;
                }}
                aria-label="Close modal"
              >
                <SquareX className="w-6 h-6" />
              </button>
              <ModalBody className="p-8 bg-white rounded-2xl overflow-hidden max-w-5xl mx-auto">
                <div className="bg-white flex items-center flex-col relative">
                  <div className="relative w-full pt-[56.25%]">
                    <video
                      src={selectedVideo?.videoUrl}
                      controls
                      autoPlay
                      loop={group?.videos?.length === 1}
                      onEnded={handleVideoEnd}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="text-center text-gray-800 mt-4 w-full">{selectedVideo?.description}</div>
                </div>
              </ModalBody>
            </Modal>
          </div>
        )}
      </div>
    </>
  );
};
