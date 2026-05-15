import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Relay } from "nostr-tools";

type ScannerStatus = "SCANNING" | "ANALYZING" | "RESULT";

interface ScannerProps {
  onAddLog?: (msg: string) => void;
}

export default function Scanner({ onAddLog }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>(["EVE Core v0.9.1 online.", "Initializing ocular link..."]);
  const [flash, setFlash] = useState(false);
  const [status, setStatus] = useState<ScannerStatus>("SCANNING");
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    species: string;
    confidence: number;
    isBiomass: boolean;
    description: string;
  } | null>(null);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
    const logEntry = `[${timestamp}] ${msg}`;
    setLogs((prev) => [...prev, logEntry].slice(-10));
    onAddLog?.(logEntry);
  }, [onAddLog]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error('Auto-play blocked:', e));
          };
        }
        addLog("Ocular link established.");
      } catch (err: any) {
        addLog(`ERR: Ocular link failed. ${err.message}`);
      }
    };
    if (status === "SCANNING") {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [addLog, status]);

  useEffect(() => {
    if (status !== "SCANNING") return;

    const intervalId = setInterval(() => {
      addLog("[SCANNING...] SEARCHING FOR BIOLOGICAL SIGNATURE");
    }, 1500);

    return () => clearInterval(intervalId);
  }, [addLog, status]);

  const playOcularSound = (type: 'lock' | 'zap' = 'lock') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type === 'lock' ? 'square' : 'sine';
      osc.frequency.setValueAtTime(type === 'lock' ? 880 : 432, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  const handleLockTarget = async () => {
    if (status !== "SCANNING") return;
    
    playOcularSound('lock');
    setStatus("ANALYZING");
    addLog("[TARGET ACQUIRED]");
    addLog("[EXTRACTING FRAME FOR ANALYTICS...]");
    
    // Pause video to simulate "capture"
    if (videoRef.current) videoRef.current.pause();

    // Capture Frame
    let base64Image = "";
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        base64Image = canvas.toDataURL('image/jpeg', 0.8);
      }
    }

    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        addLog("WARNING: Quantum Core Offline.");
        addLog("Please enter your Gemini API Key in the ME tab.");
        setTimeout(() => setStatus("SCANNING"), 4000);
        return;
      }

      addLog("[CONNECTING TO GREENWEAVE AI CLUSTER...]");
      
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image.split(',')[1],
        },
      };

      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              imagePart,
              { text: "Analyze this image. Identify the plant species. Return ONLY a valid JSON object with keys: 'species' (string), 'confidence' (number), 'isBiomass' (boolean), and 'description' (short sentence)." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              species: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              isBiomass: { type: Type.BOOLEAN },
              description: { type: Type.STRING },
            },
            required: ["species", "confidence", "isBiomass", "description"],
          },
        },
      });

      const responseText = result.text || "{}";
      const data = JSON.parse(responseText);
      
      if (!data.species) throw new Error("Invalid Analysis Data");

      setAnalysisResult(data);
      setStatus("RESULT");
      addLog(`[ANALYSIS COMPLETE] ${data.species.toUpperCase()} IDENTIFIED`);
    } catch (err: any) {
      console.error(err);
      addLog(`ERR: AI Analysis Failed. ${err.message}`);
      // Fallback or allow rescan
      setTimeout(() => setStatus("SCANNING"), 3000);
    }
  };

  const handleBroadcast = async () => {
    if (isProcessing || !analysisResult) return;
    setIsProcessing(true);
    
    addLog("[INITIATING BROADCAST SEQUENCE]");
    addLog(`[${analysisResult.species.toUpperCase()} VERIFIED] Preparing cryptographic payload...`);
    
    setFlash(true);
    playOcularSound('zap');
    setTimeout(() => setFlash(false), 200);

    // 1. Construct the Note Content
    const dispConfidence = (analysisResult.confidence * 100).toFixed(1) + '%';
    const content = `Biomass Genesis Scan initiated.\nTarget: ${analysisResult.species}\nStatus: Living Asset Confirmed. 🌱⚡️\nConfidence: ${dispConfidence}\n\n${analysisResult.description}`;
    
    const eventTemplate = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["t", "GreenWeave"],
        ["t", "BiomassProof"],
        ["l", "latitude,longitude", "geohash"], // NIP-52 Location
        ["rgb_anchor", "pending_genesis_bond"], // The Bridge to RGB Layer 2
        ["client", "GreenWeave_EVE"]
      ],
      content: content,
    };

    try {
      // 2. Request Signature via NIP-07
      if (!(window as any).nostr) {
        throw new Error("NOSTR SIGNER (NIP-07) NOT DETECTED");
      }

      addLog("[TRANSMITTING TO CRYPTO-SIGNER...]");
      // Defensive handling for signEvent to prevent state crash on mobile popup block
      let signedEvent;
      try {
        signedEvent = await (window as any).nostr.signEvent(eventTemplate);
      } catch (signErr: any) {
        console.error("Signature attempt failed:", signErr);
        throw new Error(signErr.message || "SIGNATURE_REJECTED_OR_BLOCKED");
      }
      
      addLog("[SIGNATURE VERIFIED]");

      // 3. Broadcast to Relays
      addLog("[BROADCASTING TO RELAYS...]");
      const relays = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net'];
      let successfulPublishes = 0;

      const publishPromises = relays.map(async (url) => {
        try {
          const relay = await Relay.connect(url);
          await relay.publish(signedEvent);
          successfulPublishes++;
          relay.close();
          addLog(`[RELAY-OK] ${url.replace('wss://', '')}`);
        } catch (e) {
          console.error(`Relay failure: ${url}`, e);
        }
      });

      await Promise.allSettled(publishPromises);

      if (successfulPublishes > 0) {
        addLog(`[BIOMASS PERMANENTLY ETCHED] SUCCESSFUL ON ${successfulPublishes} RELAYS.`);
        
        setIsProcessing(false);
        // Success case - go back to scanning
        setTimeout(() => {
          handleRescan();
        }, 4000);
      } else {
        throw new Error("RELAY BROADCAST FAILED");
      }

    } catch (err: any) {
      console.error("Broadcast task failure:", err);
      addLog(`[TRANSMISSION ABORTED] ${err.message}`);
      setSignatureError(true);
      setIsProcessing(false);
      
      // Prompt user about bunker / popup issues
      const isPopupError = err.message.includes("blocked") || err.message.includes("popup");
      const errorMsg = isPopupError 
        ? "POPUP BLOCKED: Please enable popups for this site or open your nsec.app tab."
        : "Bunker connection failed or timed out. Please ensure your key storage app (e.g., nsec.app) is open and wake it up, then try again.";
      
      alert(`WARNING: ${errorMsg}`);
      
      // Revert button status after 3 seconds to allow RETRY
      setTimeout(() => {
        setSignatureError(false);
      }, 3000);
    }
  };

  const handleRescan = () => {
    setStatus("SCANNING");
    setAnalysisResult(null);
    if (videoRef.current) videoRef.current.play();
    addLog("[SYSTEM RESET] SCANNING RESUMED");
  };

  return (
    <div className="relative w-screen h-[100dvh] bg-black overflow-hidden select-none font-mono">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* The Ocular Feed */}
      <video
        autoPlay
        playsInline
        muted
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${status === 'ANALYZING' ? 'opacity-40 grayscale blur-sm' : 'opacity-100'}`}
        style={{ filter: 'contrast(1.25) saturate(0.5) brightness(0.75) sepia(0.2)' }}
      />

      {/* Emerald Flash Overlay */}
      {flash && (
        <div className="absolute inset-0 bg-[#50C878] opacity-70 z-50 mix-blend-screen transition-opacity duration-100" />
      )}

      {/* Crosshair / Reticle */}
      {status === 'SCANNING' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center pb-20">
          <div className="w-24 h-24 border-[1px] border-white/20 relative animate-pulse">
             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#50C878]"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#50C878]"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#50C878]"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#50C878]"></div>
             <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-[#50C878]/30"></div>
             <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-[#50C878]/30"></div>
          </div>
        </div>
      )}

      {/* Analyzing Animation */}
      {status === 'ANALYZING' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pb-20">
          <div className="w-32 h-1 bg-[#50C878]/20 relative overflow-hidden mb-4">
            <div className="absolute inset-0 bg-[#50C878] animate-[ping_1.5s_infinite] shadow-[0_0_15px_#50C878]"></div>
          </div>
          <div className="text-[#50C878] text-[10px] tracking-[0.4em] uppercase animate-pulse">
            AI Cluster analyzing frame...
          </div>
        </div>
      )}

      {/* Result Card Overlay - High Contrast */}
      {status === 'RESULT' && analysisResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 pb-24 animate-in fade-in zoom-in duration-300 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-950 border-4 border-[#39FF14] p-8 shadow-[0_0_60px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start mb-8">
              <div className="text-xs text-white font-black uppercase tracking-[0.2em] border-b-2 border-[#39FF14]/40 pb-1">[ TARGET IDENTIFIED ]</div>
              <div className="w-4 h-4 bg-[#39FF14] shadow-[0_0_15px_#39FF14]"></div>
            </div>

            <div className="space-y-6 mb-10">
              <div>
                <div className="text-[10px] text-[#39FF14] font-black uppercase mb-1 tracking-widest">Biological Species</div>
                <div className="text-3xl text-white font-black tracking-tight leading-none uppercase">
                  {analysisResult.species.split(' ')[0]} 
                  <span className="text-[#39FF14] block mt-1">({analysisResult.species.split(' ').slice(1).join(' ') || 'Plant'})</span>
                </div>
                <p className="text-[10px] text-white/60 font-bold mt-2 uppercase leading-tight italic">
                  {analysisResult.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <div className="text-[10px] text-[#39FF14] font-black uppercase mb-1">Confidence</div>
                  <div className="text-lg text-white font-black">{(analysisResult.confidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#39FF14] font-black uppercase mb-1">Status</div>
                  <div className="text-lg text-[#39FF14] font-black">{analysisResult.isBiomass ? 'VERIFIED' : 'FAILED'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleBroadcast}
                disabled={isProcessing || !analysisResult.isBiomass}
                className={`w-full py-5 text-sm font-black uppercase tracking-[0.25em] transition-all active:scale-95 disabled:opacity-50 ${
                  signatureError ? 'bg-red-600 text-white animate-shake' : 'bg-[#39FF14] text-black'
                }`}
              >
                {isProcessing ? "[ ETCHING... ]" : signatureError ? "[ SIGNATURE TIMEOUT - RETRY ]" : "[ BROADCAST ]"}
              </button>
              <button 
                onClick={handleRescan}
                disabled={isProcessing}
                className="w-full py-3 border-2 border-white/40 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-0"
              >
                [ DISCARD / RESCAN ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed UI Components */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/30 z-20" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/30 z-20" />
      <div className="absolute bottom-24 right-4 w-4 h-4 border-b-2 border-r-2 border-white/30 z-20" />
      
      {/* System Status Top Right */}
      <div className="absolute top-6 right-6 text-xs text-[#39FF14] font-black uppercase tracking-[0.2em] z-30 mix-blend-screen text-right">
        <div>LAYER 0</div>
        <div className="text-white">{new Date().toISOString().split("T")[0]}</div>
        <div className="text-[10px] mt-2 bg-black/80 px-2 py-0.5 border border-[#39FF14]/40 font-bold">{status}</div>
      </div>

      {/* Terminal Overlay - Bold & Sharp */}
      <div className="absolute bottom-24 left-6 z-30 pointer-events-none text-[#39FF14] text-[10px] font-bold uppercase tracking-wider leading-relaxed max-w-[85vw]">
        {logs.map((L, i) => (
          <div key={i} className={`mb-1 ${i === logs.length - 1 ? 'opacity-100 text-sm font-black' : 'opacity-90'}`}>
            {L}
          </div>
        ))}
      </div>

      {/* Scanning Controls */}
      {status === 'SCANNING' && (
        <div className="absolute bottom-28 left-0 right-0 z-40 flex justify-center">
          <button 
            onClick={handleLockTarget}
            className="group relative w-20 h-20 border-4 border-[#39FF14] rounded-full flex items-center justify-center bg-zinc-900 transition-all hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(57,255,20,0.4)]"
          >
            <div className="w-10 h-10 border-2 border-[#39FF14] rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-[#39FF14] rounded-full animate-pulse shadow-[0_0_10px_#39FF14]"></div>
            </div>
            <div className="absolute -bottom-10 whitespace-nowrap text-xs font-black uppercase tracking-[0.3em] text-[#39FF14]">
              [ LOCK TARGET ]
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

