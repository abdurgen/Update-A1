
import React, { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioBlob: Blob;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBlob }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startedAtRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  useEffect(() => {
    // Cleanup on new audio blob
    const stopAudio = () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      setIsPlaying(false);
      pausedAtRef.current = 0;
      startedAtRef.current = 0;
    };
    
    stopAudio();

    const loadAudio = async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const arrayBuffer = await audioBlob.arrayBuffer();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
    };

    loadAudio();

    return stopAudio;
  }, [audioBlob]);
  
  const play = () => {
    if (!audioContextRef.current || !audioBufferRef.current || isPlaying) return;
    
    sourceRef.current = audioContextRef.current.createBufferSource();
    sourceRef.current.buffer = audioBufferRef.current;
    sourceRef.current.playbackRate.value = playbackRate;
    sourceRef.current.connect(audioContextRef.current.destination);
    
    sourceRef.current.onended = () => {
        if(audioContextRef.current && audioContextRef.current.currentTime - startedAtRef.current >= audioBufferRef.current.duration / playbackRate){
            setIsPlaying(false);
            pausedAtRef.current = 0;
        }
    };
    
    startedAtRef.current = audioContextRef.current.currentTime - pausedAtRef.current;
    sourceRef.current.start(0, pausedAtRef.current);
    
    setIsPlaying(true);
  };

  const pause = () => {
    if (!sourceRef.current || !audioContextRef.current) return;
    
    pausedAtRef.current = audioContextRef.current.currentTime - startedAtRef.current;
    sourceRef.current.stop();
    sourceRef.current = null;
    setIsPlaying(false);
  };
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (sourceRef.current) {
      sourceRef.current.playbackRate.value = newRate;
    }
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_voice.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePlayPause}
          className="p-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
        <div className="flex items-center space-x-2 w-full max-w-xs">
           <span className="text-sm text-gray-400">Speed:</span>
           <input
             type="range"
             min="0.5"
             max="2.0"
             step="0.1"
             value={playbackRate}
             onChange={handleSpeedChange}
             className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
           />
           <span className="text-sm font-mono text-cyan-400 w-10 text-center">{playbackRate.toFixed(1)}x</span>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="mt-4 w-full flex justify-center items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Voice
      </button>
    </div>
  );
};

export default AudioPlayer;
