import React, { useEffect, useRef, useState } from 'react';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { CustomSlider } from './Main';
export const VideoGeneratorUI = ({ prompt, setPrompt, chunks, setChunks, seed, setSeed, generateVideo, loading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const settingsButtonRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !settingsButtonRef.current.contains(event.target)
      ) {
        setShowAdvanced(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="border-t border-slate-200 p-4  bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Try: 'Salad with vegetables'"
            className="form-control flex-1"
          />
          <div className="relative">
            <button
              ref={settingsButtonRef}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              aria-expanded={showAdvanced}
              aria-controls="advanced-settings"
            >
              <Settings2 size={16} className="text-slate-500" />
              Content Settings
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAdvanced && (
              <div
                ref={popupRef}
                id="advanced-settings"
                className="absolute bottom-full right-[-40px] mb-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 animate-in zoom-in-95 duration-100"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
                }}
              >
                <div className="p-4 space-y-6 w-full">
                  <div className=" w-full flex items-center">
                    <label className="text-sm font-medium text-slate-700 w-[40%] ">No of videos:</label>

                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={chunks}
                      onChange={(e) => setChunks(Number(e.target.value))}
                      className="form-control w-20"
                      title="Number of videos to generate"
                    />
                  </div>

                  <div className=" w-full flex items-center">
                    <label className="text-sm font-medium text-slate-700 w-[40%] ">Seed: </label>

                    <CustomSlider seed={seed} setSeed={setSeed} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <button onClick={generateVideo} disabled={loading} className="btn btn-primary">
            Create Content
          </button>
        </div>
      </div>
    </div>
  );
};
