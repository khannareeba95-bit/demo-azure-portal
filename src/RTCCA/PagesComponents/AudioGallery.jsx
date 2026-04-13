import React from 'react';
import AudioThumbnail from './AudioThumbnail';

const AudioGallery = ({ audios, handleAudioClick, selectedAudio }) => {
  return (
    <>
      <div className="w-full flex lg:flex-col lg:p-5 flex-row md:overflow-x-hidden md:overflow-y-auto">
        <div
          className={`${
            selectedAudio === null ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4' : 'flex  flex-row md:flex-col'
          }  pb-5 px-2  max-h-[80vh] ${
            selectedAudio !== null && 'border-[#e2e8f0] lg:border-r border-opacity-20'
          }  gap-4    lg:pr-4 overflow-auto`}
        >
          {audios?.map((audio) => (
            <AudioThumbnail
              key={audio.id}
              audio={audio}
              handleAudioClick={handleAudioClick}
              selectedAudio={selectedAudio}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AudioGallery;
