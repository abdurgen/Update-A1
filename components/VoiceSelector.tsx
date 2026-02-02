
import React from 'react';
import { VoiceOption } from '../types';

interface VoiceSelectorProps {
  options: VoiceOption[];
  selectedVoiceId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ options, selectedVoiceId, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          disabled={disabled}
          className={`p-3 rounded-lg text-left transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
            ${selectedVoiceId === option.id 
              ? 'bg-cyan-500 text-white shadow-lg' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <p className="font-semibold">{option.name}</p>
          <p className="text-xs opacity-80">{option.description}</p>
        </button>
      ))}
    </div>
  );
};

export default VoiceSelector;
