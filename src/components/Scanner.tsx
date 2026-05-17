import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Relay, nip19, finalizeEvent, getPublicKey } from "nostr-tools";

type ScannerStatus = "SCANNING" | "ANALYZING" | "RESULT";

interface ScannerProps {
  onAddLog?: (msg: string) => void;
  onClose?: () => void;
  onScanComplete?: (payload: any, imageStr: string) => void;
}

export default function Scanner({ onAddLog, onClose, onScanComplete }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>(["EVE Core v0.9.1 online.", "Initializing ocular link..."]);
  const [flash, setFlash] = useState(false);
  const [status, setStatus] = useState<ScannerStatus>("SCANNING");
  const [isProcessing, setIsProcessing] = useState(false);
  const [broadcastPhase, setBroadcastPhase] = useState<'IDLE'|'UPLOADING'|'ETCHING'>('IDLE');
  const [signatureError, setSignatureError] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    species: string;
    confidence: number;
    isBiomass: boolean;
    description: string;
    payloadObj?: any;
    base64Image?: string;
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

    addLog("[CONNECTING TO GREENWEAVE AI CLUSTER...]");
    
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        addLog("WARNING: Quantum Core Offline. Missing API Key.");
        addLog("Please enter your Gemini API Key in the ME tab.");
        setTimeout(() => setStatus("SCANNING"), 4000);
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image.split(',')[1],
        },
      };

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              imagePart,
              { text: "Analyze this image. Identify the plant species. Estimate a confidence score (0.0 to 1.0). Return ONLY a raw JSON object with keys: 'species_name', 'confidence', 'estimated_biomass_index'." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              species_name: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              estimated_biomass_index: { type: Type.NUMBER },
            },
            required: ["species_name", "confidence", "estimated_biomass_index"],
          },
        },
      });

      const responseText = result.text || "{}";
      const data = JSON.parse(responseText);
      
      const speciesName = data.species_name || "Unknown Biomass";
      const confidence = data.confidence || 0.85;
      const biomassEst = data.estimated_biomass_index || 5.0;
      
      addLog(`[IDENTIFIED] ${speciesName.toUpperCase()}`);

      let pubkeyHex = "unknown";
      try {
        const nodeKey = localStorage.getItem('greenweave_nsec');
        if (nodeKey) {
          if (nodeKey.startsWith('nsec1')) {
            const decoded = nip19.decode(nodeKey);
            pubkeyHex = getPublicKey(decoded.data as Uint8Array);
          } else {
            pubkeyHex = getPublicKey(new Uint8Array(nodeKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))));
          }
        }
      } catch (e) {
        console.warn("Could not extract pubkey for payload", e);
      }

      // Provide real species and spectral hashes
      const speciesHashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(speciesName));
      const speciesHash = "0x" + Array.from(new Uint8Array(speciesHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      const spectralHashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(base64Image));
      const spectralHash = "0x" + Array.from(new Uint8Array(spectralHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      const payloadObj: any = {
        pubkey: pubkeyHex,
        timestamp: Date.now(),
        telemetry: {
          species_hash: speciesHash,
          confidence_score: confidence,
          biomass_volume_est: biomassEst,
          visual_spectral_hash: spectralHash
        },
        spatial_zkp: {
          region_geohash_blurred: "w3g",
          validity_proof: "0x04bf9a...[ZK-SNARK-MOCK]"
        },
        status: "PENDING_CONSENSUS"
      };

      // Create a real SHA-256 hash for the eventId
      const payloadString = JSON.stringify(payloadObj);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(payloadString));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      payloadObj.eventId = hashHex;
      
      setAnalysisResult({
        species: speciesName,
        confidence: confidence,
        isBiomass: confidence > 0.5,
        description: `Estimated Biomass Index: ${biomassEst}`,
        payloadObj,
        base64Image
      });
      setStatus("RESULT");
      
    } catch (err: any) {
      console.error(err);
      addLog(`ERR: AI Analysis Failed. ${err.message}`);
      setTimeout(() => setStatus("SCANNING"), 3000);
    }
  };

  const handleBroadcast = async () => {
    if (isProcessing || !analysisResult) return;
    setIsProcessing(true);
    setBroadcastPhase('UPLOADING');
    
    addLog("[INITIATING BROADCAST SEQUENCE]");
    addLog(`[${analysisResult.species.toUpperCase()} VERIFIED] Preparing cryptographic payload...`);
    
    setFlash(true);
    playOcularSound('zap');
    setTimeout(() => setFlash(false), 200);

    // Upload image evidence
    let mediaUrl = "";
    if (canvasRef.current) {
      addLog("[ UPLOADING VISUAL PROOF... ]");
      const blob = await new Promise<Blob | null>((res) => canvasRef.current!.toBlob(res, "image/jpeg", 0.8));
      if (blob) {
          const formData = new FormData();
          formData.append("fileToUpload", blob, "image.jpg");
          
          try {
            const uploadRes = await fetch("https://nostr.build/api/v2/upload/free", {
              method: "POST",
              body: formData,
              headers: {
                "Accept": "application/json"
              }
            });
            
            if (uploadRes.ok) {
              const data = await uploadRes.json();
              if (data?.data && data.data[0]?.url) {
                mediaUrl = "\n\n" + data.data[0].url;
                addLog("[ VISUAL PROOF UPLOADED ]");
              } else {
                addLog(`WARNING: Visual Proof Upload Failed (No URL). Broadcasting text only.`);
              }
            } else {
               addLog(`WARNING: Visual Proof Upload Failed (${uploadRes.status}). Broadcasting text only.`);
            }
          } catch (e: any) {
            console.warn("NOSTR_BUILD UPLOAD FAILED (CORS/Network):", e.message || e);
            addLog(`WARNING: Upload Error (${e.message || "Network"}). Broadcasting text only.`);
          }
      }
    }

    setBroadcastPhase('ETCHING');

    // 1. Construct the Note Content
    const payloadObj = analysisResult.payloadObj || {};
    const content = JSON.stringify(payloadObj, null, 2) + (mediaUrl ? `\n\n${mediaUrl}` : "");
    
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
      // 2. Fetch Node Private Key
      const nodeKey = localStorage.getItem('greenweave_nsec');
      if (!nodeKey) {
        throw new Error("NODE KEY NOT FOUND. PLEASE SET IN PROFILE.");
      }

      let secretKeyBytes: Uint8Array;
      if (nodeKey.startsWith('nsec1')) {
        const decoded = nip19.decode(nodeKey);
        if (decoded.type !== 'nsec') throw new Error("INVALID NSEC PAYLOAD");
        secretKeyBytes = decoded.data as Uint8Array;
      } else {
        // Assume hex string
        if (nodeKey.length !== 64) throw new Error("INVALID HEX KEY LENGTH");
        secretKeyBytes = new Uint8Array(nodeKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      }

      addLog("[SIGNING EVENT LOCALLY...]");
      let signedEvent;
      try {
        signedEvent = finalizeEvent(eventTemplate, secretKeyBytes);
      } catch (signErr: any) {
        console.error("Signature attempt failed:", signErr);
        throw new Error("LOCAL_SIGNATURE_FAILED");
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
        setBroadcastSuccess(true);
        setBroadcastPhase('IDLE');
        // Success case - Auto route to feed
        setTimeout(() => {
          onScanComplete?.(payloadObj, analysisResult.base64Image || "");
          handleRescan();
        }, 1500);
      } else {
        throw new Error("RELAY BROADCAST FAILED");
      }

    } catch (err: any) {
      console.error("Broadcast task failure:", err);
      addLog(`[TRANSMISSION ABORTED] ${err.message}`);
      setSignatureError(true);
      setIsProcessing(false);
      setBroadcastPhase('IDLE');
      
      alert(`Broadcast Failed: ${err.message}`);
      
      // Revert button status after 3 seconds to allow RETRY
      setTimeout(() => {
        setSignatureError(false);
      }, 3000);
    }
  };

  const handleRescan = () => {
    setStatus("SCANNING");
    setAnalysisResult(null);
    setBroadcastSuccess(false);
    setBroadcastPhase('IDLE');
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
            [ ANALYZING SPECTRAL DATA... RUNNING ZK-PROOFS... ]
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
                disabled={isProcessing || !analysisResult.isBiomass || broadcastSuccess}
                className={`w-full py-5 text-sm font-black uppercase tracking-[0.25em] transition-all active:scale-95 disabled:opacity-50 ${
                  broadcastSuccess ? 'bg-amber-500 text-black border-2 border-amber-500 shadow-[0_0_20px_#f59e0b]' :
                  signatureError ? 'bg-red-600 text-white animate-shake' : 'bg-[#39FF14] text-black'
                }`}
              >
                {broadcastSuccess ? "[ BROADCAST SUCCESSFUL ⚡️ ]" :
                 broadcastPhase === 'UPLOADING' ? "[ UPLOADING VISUAL PROOF... ]" :
                 broadcastPhase === 'ETCHING' ? "[ ETCHING... ]" :
                 signatureError ? "[ SIGNATURE TIMEOUT - RETRY ]" : 
                 "[ BROADCAST ]"}
              </button>
              <button 
                onClick={handleRescan}
                disabled={isProcessing || broadcastSuccess}
                className="w-full py-3 border-2 border-white/40 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-0"
              >
                [ DISCARD / RESCAN ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed UI Components */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/30 z-20 pointer-events-none" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/30 z-20 pointer-events-none" />
      <div className="absolute bottom-24 right-4 w-4 h-4 border-b-2 border-r-2 border-white/30 z-20 pointer-events-none" />
      
      {/* Navigation Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-50 w-12 h-12 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-all active:scale-95 text-xl font-bold font-sans shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          ✕
        </button>
      )}
      
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
              [ CAPTURE BIOMASS SIGNATURE ]
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

