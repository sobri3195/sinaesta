import React, { useState, useEffect, useRef } from 'react';
import { OSCEStation } from '../types';
import { Timer, CheckSquare, AlertCircle, PlayCircle, StopCircle, Mic, MicOff, Activity, Wifi, WifiOff, Volume2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface OSCEModeProps {
  station: OSCEStation;
  onComplete: () => void;
}

// --- Audio Helpers ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createAudioBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] then convert to 16-bit PCM
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const OSCEMode: React.FC<OSCEModeProps> = ({ station, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(station.durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState('');

  // Live API State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<Promise<any> | null>(null);
  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY }));
  
  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      disconnectLiveSession();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Clean up on unmount
  useEffect(() => {
      return () => {
          disconnectLiveSession();
      };
  }, []);

  const toggleCheck = (idx: number) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setCheckedItems(newSet);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Live API Handlers ---

  const connectLiveSession = async () => {
      if (!isActive) {
          alert("Please start the station timer first.");
          return;
      }

      try {
          // 1. Setup Audio Contexts
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          
          // Output Context (24kHz as per guidelines/defaults for high quality)
          const outputCtx = new AudioContextClass({ sampleRate: 24000 });
          audioContextRef.current = outputCtx;
          nextStartTimeRef.current = outputCtx.currentTime;

          // Input Context (16kHz for speech recognition)
          const inputCtx = new AudioContextClass({ sampleRate: 16000 });
          inputContextRef.current = inputCtx;

          // 2. Setup Mic Stream
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
              if (!isMicOn) return; // Mute logic
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createAudioBlob(inputData);
              
              if (sessionRef.current) {
                  sessionRef.current.then(session => {
                      session.sendRealtimeInput({ media: pcmBlob });
                  });
              }
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);

          // 3. Connect to Gemini
          const sessionPromise = aiRef.current.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              config: {
                  responseModalities: [Modality.AUDIO],
                  systemInstruction: `You are a standardized patient in a clinical exam (OSCE). 
                  SCENARIO: ${station.scenario}
                  
                  INSTRUCTIONS:
                  - Act naturally as the patient described.
                  - Answer the doctor's questions based on the scenario.
                  - If the doctor is empathetic, cooperate. If they are rude, be hesitant.
                  - Keep answers concise (1-2 sentences) to keep the conversation flowing.
                  - Do not break character. You are the patient, not an AI.`,
              },
              callbacks: {
                  onopen: () => {
                      setIsLiveConnected(true);
                      console.log("Gemini Live Connected");
                  },
                  onmessage: async (msg: LiveServerMessage) => {
                      const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                      if (audioData) {
                          setAiSpeaking(true);
                          // Decode and schedule playback
                          const ctx = audioContextRef.current;
                          if (ctx) {
                             const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                             const src = ctx.createBufferSource();
                             src.buffer = buffer;
                             src.connect(ctx.destination);
                             
                             // Schedule next chunk
                             const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
                             src.start(startTime);
                             nextStartTimeRef.current = startTime + buffer.duration;
                             
                             src.onended = () => {
                                 sourcesRef.current.delete(src);
                                 if (sourcesRef.current.size === 0) setAiSpeaking(false);
                             };
                             sourcesRef.current.add(src);
                          }
                      }

                      if (msg.serverContent?.interrupted) {
                          // Clear queue if interrupted
                          sourcesRef.current.forEach(s => s.stop());
                          sourcesRef.current.clear();
                          nextStartTimeRef.current = 0;
                          setAiSpeaking(false);
                      }
                  },
                  onclose: () => {
                      setIsLiveConnected(false);
                      setAiSpeaking(false);
                  },
                  onerror: (err) => {
                      console.error("Live API Error:", err);
                      setIsLiveConnected(false);
                  }
              }
          });

          sessionRef.current = sessionPromise;

      } catch (e) {
          console.error("Failed to connect live session", e);
          alert("Could not access microphone or connect to AI service.");
      }
  };

  const disconnectLiveSession = () => {
      if (sessionRef.current) {
          sessionRef.current.then((session: any) => {
              if (session.close) session.close();
          });
          sessionRef.current = null;
      }
      
      // Close Audio Contexts
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      if (inputContextRef.current) {
          inputContextRef.current.close();
          inputContextRef.current = null;
      }

      setIsLiveConnected(false);
      setAiSpeaking(false);
  };

  // --- Render ---

  const score = Array.from(checkedItems).reduce((acc: number, idx: number) => acc + (station.checklist[idx]?.points || 0), 0);
  const maxScore = station.checklist.reduce((acc, item) => acc + item.points, 0);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Virtual OSCE Station</h1>
          <p className="text-gray-500">{station.title}</p>
        </div>
        <div className={`text-3xl font-mono font-bold px-6 py-3 rounded-lg border flex items-center gap-3
          ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-100 text-gray-800 border-gray-200'}
        `}>
          <Timer size={28} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left: Interaction & Scenario */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          
          {/* Virtual Patient Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-lg border border-indigo-800 relative overflow-hidden">
             <div className="flex justify-between items-start mb-6 relative z-10">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                     <Activity className={isLiveConnected ? "text-green-400" : "text-gray-500"} />
                     Virtual Patient
                 </h3>
                 <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1
                     ${isLiveConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}
                 `}>
                     {isLiveConnected ? <Wifi size={12}/> : <WifiOff size={12}/>}
                     {isLiveConnected ? 'ONLINE' : 'OFFLINE'}
                 </div>
             </div>

             {isLiveConnected ? (
                 <div className="flex flex-col items-center justify-center py-4 relative z-10">
                     {/* Visualizer Placeholder */}
                     <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300
                        ${aiSpeaking ? 'border-indigo-400 bg-indigo-500/20 scale-110 shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'border-gray-600 bg-gray-800'}
                     `}>
                         {aiSpeaking ? <Volume2 size={40} className="animate-pulse" /> : <Mic size={40} className="text-gray-500" />}
                     </div>
                     <p className="mt-4 text-sm font-medium text-indigo-200">
                         {aiSpeaking ? "Patient is speaking..." : isMicOn ? "Listening to you..." : "Microphone Muted"}
                     </p>

                     <div className="flex gap-4 mt-6">
                         <button 
                             onClick={() => setIsMicOn(!isMicOn)}
                             className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-white text-indigo-900' : 'bg-red-500 text-white'}`}
                         >
                             {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                         </button>
                         <button 
                             onClick={disconnectLiveSession}
                             className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-bold"
                         >
                             Disconnect
                         </button>
                     </div>
                 </div>
             ) : (
                 <div className="text-center py-6 relative z-10">
                     <p className="text-gray-300 text-sm mb-4">Start the scenario timer first, then connect to begin the voice simulation.</p>
                     <button 
                         onClick={connectLiveSession}
                         disabled={!isActive}
                         className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                     >
                         <Mic size={18} /> Connect Voice
                     </button>
                 </div>
             )}
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
             <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
               <AlertCircle size={20} /> Skenario Klinis
             </h3>
             <p className="text-blue-800 leading-relaxed text-sm">{station.scenario}</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4">Instruksi Peserta</h3>
             <div className="prose prose-sm text-gray-600">
               {station.instruction}
             </div>
             
             {!isActive && timeLeft === station.durationMinutes * 60 && (
               <button 
                 onClick={() => setIsActive(true)}
                 className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
               >
                 <PlayCircle size={20} /> Mulai Station
               </button>
             )}
          </div>
          
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex-1">
            <label className="font-bold text-gray-700 mb-2 block">Clinical Notes (SOAP)</label>
            <textarea 
              className="w-full h-48 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Type your findings here..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={!isActive}
            />
          </div>
        </div>

        {/* Right: Checklist (Assessment) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <CheckSquare size={20} className="text-green-600" /> 
               Checklist Penilaian Mandiri
             </h3>
             <div className="text-sm font-bold text-gray-500">
                Score: <span className="text-indigo-600 text-lg">{score}</span> / {maxScore}
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0">
             <div className="divide-y divide-gray-100">
                {station.checklist.map((item, idx) => (
                   <div key={idx} className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 ${checkedItems.has(idx) ? 'bg-green-50/50' : ''}`}>
                      <button 
                        onClick={() => isActive && toggleCheck(idx)}
                        disabled={!isActive}
                        className={`w-6 h-6 rounded border flex-shrink-0 flex items-center justify-center transition-all mt-0.5
                           ${checkedItems.has(idx) ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 hover:border-green-400'}
                           ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                         {checkedItems.has(idx) && <CheckSquare size={16} />}
                      </button>
                      <div className="flex-1">
                         <p className={`text-sm font-medium ${checkedItems.has(idx) ? 'text-gray-900' : 'text-gray-600'}`}>{item.item}</p>
                         <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-1 inline-block">{item.category} • {item.points} pts</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
             <button 
                onClick={() => {
                    disconnectLiveSession();
                    onComplete();
                }}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black flex items-center justify-center gap-2"
             >
                <StopCircle size={20} /> 
                Selesai & Submit
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSCEMode;