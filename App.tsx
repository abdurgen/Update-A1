
import React, { useState, useCallback } from 'react';
import { enhanceScript, generateVoice } from './services/geminiService';
import { createWavBlob } from './utils/audioUtils';
import { VoiceOption, PrebuiltVoice } from './types';
import VoiceSelector from './components/VoiceSelector';
import AudioPlayer from './components/AudioPlayer';
import ToggleSwitch from './components/ToggleSwitch';

const voiceOptions: VoiceOption[] = [
  { id: 'Aura', name: 'Aura', description: 'Calm & Storyteller', geminiVoice: 'Kore' },
  { id: 'Leo', name: 'Leo', description: 'Loud & Motivational', geminiVoice: 'Fenrir' },
  { id: 'Seraph', name: 'Seraph', description: 'Deep & Authoritative', geminiVoice: 'Charon' },
  { id: 'Jaxx', name: 'Jaxx', description: 'Energetic & Fun', geminiVoice: 'Puck' },
  { id: 'Nova', name: 'Nova', description: 'Warm & Clear', geminiVoice: 'Zephyr' },
];

const App: React.FC = () => {
  const [inputScript, setInputScript] = useState<string>('');
  const [outputScript, setOutputScript] = useState<string>('');
  const [isTwoVoicesMode, setIsTwoVoicesMode] = useState(false);
  const [selectedVoice1, setSelectedVoice1] = useState<PrebuiltVoice>(voiceOptions[3].geminiVoice); // Jaxx
  const [selectedVoice2, setSelectedVoice2] = useState<PrebuiltVoice>(voiceOptions[4].geminiVoice); // Nova
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState({ script: false, voice: false });
  const [error, setError] = useState<string | null>(null);

  const handleMakeScript = useCallback(async () => {
    if (!inputScript.trim()) {
      setError('Input script cannot be empty.');
      return;
    }
    setIsLoading(prev => ({ ...prev, script: true }));
    setError(null);
    setAudioBlob(null);
    try {
      const enhanced = await enhanceScript(inputScript);
      setOutputScript(enhanced);
    } catch (err) {
      setError('Failed to enhance script. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(prev => ({ ...prev, script: false }));
    }
  }, [inputScript]);

  const handleGenerateVoice = useCallback(async () => {
    if (!outputScript.trim()) {
      setError('Output script is empty. Please generate a script first.');
      return;
    }
    if (isTwoVoicesMode && selectedVoice1 === selectedVoice2) {
      setError('Please select two different voices for Speaker 1 and Speaker 2.');
      return;
    }
    setIsLoading(prev => ({ ...prev, voice: true }));
    setError(null);
    setAudioBlob(null);
    try {
      const base64Audio = await generateVoice(
        outputScript,
        selectedVoice1,
        isTwoVoicesMode ? selectedVoice2 : undefined
      );
      const wavBlob = createWavBlob(base64Audio);
      setAudioBlob(wavBlob);
    } catch (err) {
      setError('Failed to generate voice. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(prev => ({ ...prev, voice: false }));
    }
  }, [outputScript, selectedVoice1, selectedVoice2, isTwoVoicesMode]);
  
  const loading = isLoading.script || isLoading.voice;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Text to Script Voice
          </h1>
          <p className="mt-2 text-lg text-gray-400">Transform your text into a powerful, voice-ready script.</p>
        </header>

        <main className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 shadow-lg">
            <label htmlFor="input-script" className="block text-sm font-medium text-gray-300 mb-2">
              Input Script
            </label>
            <textarea
              id="input-script"
              rows={6}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
              placeholder="Paste your script here..."
              value={inputScript}
              onChange={(e) => setInputScript(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleMakeScript}
              disabled={loading}
              className="mt-4 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 ease-in-out disabled:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading.script ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enhancing Script...
                </>
              ) : (
                'Make Script'
              )}
            </button>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 shadow-lg">
            <label htmlFor="output-script" className="block text-sm font-medium text-gray-300 mb-2">
              Output New Script
            </label>
            <textarea
              id="output-script"
              rows={8}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
              placeholder="Your enhanced script will appear here..."
              value={outputScript}
              readOnly
            />
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold text-gray-200">Choose Voice Model</h2>
               <ToggleSwitch 
                  checked={isTwoVoicesMode}
                  onChange={setIsTwoVoicesMode}
                  labelLeft="Single"
                  labelRight="Two Voices"
                />
            </div>
            
            {isTwoVoicesMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div>
                  <h3 className="text-center font-semibold mb-3 text-gray-400">Speaker 1</h3>
                  <VoiceSelector
                    options={voiceOptions}
                    selectedVoiceId={voiceOptions.find(v => v.geminiVoice === selectedVoice1)?.id || ''}
                    onSelect={(voiceId) => {
                      const voice = voiceOptions.find(v => v.id === voiceId);
                      if (voice) setSelectedVoice1(voice.geminiVoice);
                    }}
                    disabled={loading}
                  />
                </div>
                <div className="border-t md:border-t-0 md:border-l border-gray-700 mt-6 md:mt-0 pt-6 md:pt-0 md:pl-6">
                   <h3 className="text-center font-semibold mb-3 text-gray-400">Speaker 2</h3>
                  <VoiceSelector
                    options={voiceOptions}
                    selectedVoiceId={voiceOptions.find(v => v.geminiVoice === selectedVoice2)?.id || ''}
                    onSelect={(voiceId) => {
                      const voice = voiceOptions.find(v => v.id === voiceId);
                      if (voice) setSelectedVoice2(voice.geminiVoice);
                    }}
                    disabled={loading}
                  />
                </div>
              </div>
            ) : (
              <VoiceSelector
                options={voiceOptions}
                selectedVoiceId={voiceOptions.find(v => v.geminiVoice === selectedVoice1)?.id || ''}
                onSelect={(voiceId) => {
                  const voice = voiceOptions.find(v => v.id === voiceId);
                  if (voice) setSelectedVoice1(voice.geminiVoice);
                }}
                disabled={loading}
              />
            )}


            <button
              onClick={handleGenerateVoice}
              disabled={loading || !outputScript}
              className="mt-6 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-all duration-300 ease-in-out disabled:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading.voice ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Voice...
                </>
              ) : (
                'Generate Voice'
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-center" role="alert">
              <p>{error}</p>
            </div>
          )}

          {audioBlob && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 shadow-lg">
              <AudioPlayer audioBlob={audioBlob} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
