
import React from 'react';
import { Direction } from './types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface TouchControlsProps {
  onDirectionChange: (direction: Direction) => void;
  onStart?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onDirectionChange,
  onStart,
}) => {
  return (
    <div className="mt-4 select-none touch-manipulation">
      {/* Touch controls layout */}
      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
        {/* Top row - Up button */}
        <div className="col-start-2">
          <button
            className="w-full p-2 bg-gray-200 rounded-md flex items-center justify-center"
            onClick={() => onDirectionChange('UP')}
            onTouchStart={(e) => {
              e.preventDefault();
              onDirectionChange('UP');
            }}
          >
            <ChevronUp size={24} />
          </button>
        </div>
        
        {/* Middle row - Left, Start/Play, Right */}
        <div>
          <button
            className="w-full p-2 bg-gray-200 rounded-md flex items-center justify-center"
            onClick={() => onDirectionChange('LEFT')}
            onTouchStart={(e) => {
              e.preventDefault();
              onDirectionChange('LEFT');
            }}
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        
        <div>
          {onStart && (
            <button
              className="w-full p-2 bg-green-500 text-white rounded-md flex items-center justify-center"
              onClick={onStart}
              onTouchStart={(e) => {
                e.preventDefault();
                onStart();
              }}
            >
              <Play size={24} />
            </button>
          )}
        </div>
        
        <div>
          <button
            className="w-full p-2 bg-gray-200 rounded-md flex items-center justify-center"
            onClick={() => onDirectionChange('RIGHT')}
            onTouchStart={(e) => {
              e.preventDefault();
              onDirectionChange('RIGHT');
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Bottom row - Down button */}
        <div className="col-start-2">
          <button
            className="w-full p-2 bg-gray-200 rounded-md flex items-center justify-center"
            onClick={() => onDirectionChange('DOWN')}
            onTouchStart={(e) => {
              e.preventDefault();
              onDirectionChange('DOWN');
            }}
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
