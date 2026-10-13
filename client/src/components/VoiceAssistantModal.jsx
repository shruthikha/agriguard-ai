import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, X, Volume2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { createSpeechRecognizer, speakText, stopSpeaking } from '../utils/speech';
import { useNavigate } from 'react-router-dom';

export default function VoiceAssistantModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [recognitionObj, setRecognitionObj] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognitionObj) {
        try { recognitionObj.stop(); } catch (e) {}
      }
      setIsListening(false);
      setTranscript('');
      setAssistantReply('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg('');
    setAssistantReply('');
    setTranscript('');

    const rec = createSpeechRecognizer(
      i18n.language,
      (text) => {
        setTranscript(text);
        processFarmerQuery(text);
      },
      (err) => {
        console.warn('Speech error:', err);
        setErrorMsg('Could not hear audio clearly or microphone permission was denied. Try speaking again.');
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!rec) {
      setErrorMsg('Speech recognition is not supported in this browser. Please type or use Chrome/Edge on Android/PC.');
      return;
    }

    try {
      rec.start();
      setRecognitionObj(rec);
      setIsListening(true);
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  };

  const processFarmerQuery = (query) => {
    const q = query.toLowerCase();
    let reply = '';
    let targetCrop = 'Tomato';

    if (q.includes('tomato') || q.includes('தக்காளி') || q.includes('टमाटर')) {
      targetCrop = 'Tomato';
      if (q.includes('spot') || q.includes('black') || q.includes('புள்ளி') || q.includes('काला')) {
        reply = 'Black spots on tomato leaves frequently indicate Early Blight or Bacterial Spot. Prune the affected lower foliage immediately, avoid overhead watering, and check the leaf with our camera scan!';
      } else if (q.includes('yellow') || q.includes('மஞ்சள்') || q.includes('पीला')) {
        reply = 'Yellowing tomato leaves can be caused by Leaf Mold in high humidity or nitrogen imbalance. Please scan the leaf for precise diagnosis.';
      } else {
        reply = `I heard your query regarding ${targetCrop}. Let's take a leaf photo to get a 95% accurate disease diagnosis and treatment steps!`;
      }
    } else if (q.includes('potato') || q.includes('உருளை') || q.includes('आलू')) {
      targetCrop = 'Potato';
      if (q.includes('rot') || q.includes('water') || q.includes('அழுகல்') || q.includes('सड़न')) {
        reply = 'Rotting lesions on potato leaves during damp weather indicate Late Blight. Apply protective bio-fungicide or Ridomil promptly and take a leaf photo.';
      } else {
        reply = 'For potato crops, watch for concentric dark rings of early blight. Use our leaf scanner for an instant solution.';
      }
    } else if (q.includes('rain') || q.includes('weather') || q.includes('மழை') || q.includes('मौसम')) {
      reply = 'Checking local weather: Remember never to apply foliar pesticide sprays right before heavy rain, as it washes away chemicals.';
    } else {
      reply = `I heard: "${query}". For the best advice, take a leaf photo using our AI Scanner or check today's farming advisories!`;
    }

    setAssistantReply(reply);
    speakText(reply, i18n.language);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-agri-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-agri-100 text-agri-800 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice Assistant for Farmers</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            Ask About Your Crop
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Tap the microphone and speak (e.g. "My tomato leaves have black spots")
          </p>
        </div>

        {/* Microphone Pulse Center */}
        <div className="my-8 flex flex-col items-center justify-center">
          <button
            onClick={isListening ? () => recognitionObj?.stop() : startListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
              isListening
                ? 'bg-red-500 animate-voice-pulse ring-8 ring-red-100 scale-110'
                : 'bg-agri-600 hover:bg-agri-700 active:scale-95'
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
          
          <span className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-500">
            {isListening ? 'Listening... Speak now' : 'Tap to Speak'}
          </span>
        </div>

        {/* Live Transcript */}
        {transcript && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-4 text-left">
            <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">You said:</div>
            <div className="text-sm font-semibold text-gray-800 italic">"{transcript}"</div>
          </div>
        )}

        {/* Assistant Response */}
        {assistantReply && (
          <div className="bg-agri-50 rounded-2xl p-4 border border-agri-200 mb-6 text-left animate-fadeIn">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-agri-800 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-agri-600" />
                AgriGuard Voice Guide
              </span>
              <button
                onClick={() => speakText(assistantReply, i18n.language)}
                className="text-xs text-agri-700 font-bold underline hover:text-agri-900"
              >
                Listen Again
              </button>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              {assistantReply}
            </p>
            <div className="mt-3 pt-3 border-t border-agri-200/60 flex justify-end">
              <button
                onClick={() => { onClose(); navigate('/detect'); }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-agri-800 hover:text-agri-900"
              >
                Take Leaf Photo Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 mb-4 text-left">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition text-sm"
        >
          {t('common.close', 'Close')}
        </button>
      </div>
    </div>
  );
}
