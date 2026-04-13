import React, { useState } from 'react';
import { FaPlay } from 'react-icons/fa';

const AudioThumbnail = ({ audio, handleAudioClick, selectedAudio }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`audio-thumbnail relative rounded-lg cursor-pointer ${
        selectedAudio?.id === audio?.id ? 'shadow-2xl border-2 bg-[#0F4E83] border-none' : 'border-6 border-transparent'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleAudioClick(audio)}
    >
      <div
        className={`flex flex-col items-center p-2 justify-center text-center ${
          selectedAudio === null && 'shadow-md rounded-lg'
        }  `}
      >
        {/* Replace with an audio icon or custom design */}
        <img src="/rtcca/assets/images_thumb.jpg" alt="Audio Icon" className="cursor-pointer rounded-lg " />
        <h2 className="text-sm text-white font-medium mt-2">{audio?.title}</h2>
      </div>
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FaPlay className="text-[#d0b92b] text-2xl" />
        </div>
      )}
    </div>
  );
};

export default AudioThumbnail;
