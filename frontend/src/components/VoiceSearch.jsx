import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/outline';

const VoiceSearch = ({ onSearch, isListening, setIsListening }) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript && onSearch) {
          onSearch(transcript);
        }
      };
    }
  }, [onSearch, transcript, setIsListening]);

  const startListening = () => {
    if (isSupported && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('Failed to start voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError('');
  };

  if (!isSupported) {
    return (
      <button
        className="p-2 text-gray-400 cursor-not-allowed"
        disabled
        title="Voice search not supported in this browser"
      >
        <MicrophoneIcon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
        title={isListening ? 'Stop voice search' : 'Start voice search'}
      >
        <MicrophoneIcon className="w-5 h-5" />
      </button>

      {/* Transcript display */}
      {transcript && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg p-3 shadow-lg min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Voice Input:</span>
            <button
              onClick={clearTranscript}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Clear transcript"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-900">{transcript}</p>
          {isListening && (
            <div className="mt-2 flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg min-w-[200px]">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
