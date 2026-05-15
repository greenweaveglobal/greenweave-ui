import { useEffect, useRef, useState, useCallback } from "react";

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
    addLog("[ANALYZING BIOLOGICAL SIGNATURE...]");
    
    // Pause video to simulate "capture"
    if (videoRef.current) videoRef.current.pause();

    await new Promise(r => setTimeout(r, 2000));
    setStatus("RESULT");
    addLog("[ANALYSIS COMPLETE] MATCH FOUND");
  };

  const handleBroadcast = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    addLog("[INITIATING BROADCAST SEQUENCE]");
    addLog("[BIOMASS VERIFIED] Transferring data...");
    
    setFlash(true);
    playOcularSound('zap');
    setTimeout(() => setFlash(false), 200);

    // Call ZAP Route
    try {
      const zapRes = await fetch('/api/zap', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ amountSats: 21 }) 
      });
      if (zapRes.ok) {
        addLog("[ENERGY TOLL DEDUCTED] 21 Sats routed.");
      } else {
        addLog("ZAP failed: Check connection profile.");
      }
    } catch (err) {
      addLog("ERR: ZAP network offline.");
    }

    // Call Broadcast Route
    try {
      const bRes = await fetch('/api/broadcast', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          message: '[DIRECTIVE COMPLETED] Musa (Banana Tree) analyzed. Energy toll of 21 Sats deducted. #GreenWeave' 
        }) 
      });
      if (bRes.ok) {
        addLog(`[LAYER 0 ETCHED] State preserved on Nostr.`);
      } else {
        addLog("Etching failed.");
      }
    } catch (err) {
      addLog("ERR: Ledger offline.");
    }
    
    setIsProcessing(false);
    // After broadcast, return to scanning after a delay
    setTimeout(() => {
      handleRescan();
    }, 2000);
  };

  const handleRescan = () => {
    setStatus("SCANNING");
    if (videoRef.current) videoRef.current.play();
    addLog("[SYSTEM RESET] SCANNING RESUMED");
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none font-mono">
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
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
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
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-32 h-1 bg-[#50C878]/20 relative overflow-hidden mb-4">
            <div className="absolute inset-0 bg-[#50C878] animate-[ping_1.5s_infinite] shadow-[0_0_15px_#50C878]"></div>
          </div>
          <div className="text-[#50C878] text-[10px] tracking-[0.4em] uppercase animate-pulse">
            Analysis in progress...
          </div>
        </div>
      )}

      {/* Result Card Overlay */}
      {status === 'RESULT' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="w-full max-w-sm bg-black/90 border border-[#50C878]/40 p-6 shadow-[0_0_40px_rgba(80,200,120,0.2)] backdrop-blur-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="text-[10px] text-white/40 uppercase tracking-widest">[ TARGET IDENTIFIED ]</div>
              <div className="w-2 h-2 bg-[#50C878] animate-pulse shadow-[0_0_8px_#50C878]"></div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <div className="text-[8px] text-[#50C878] uppercase mb-1 opacity-60">Species</div>
                <div className="text-xl text-[#50C878] font-bold tracking-wider">Musa (Banana Tree)</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[8px] text-[#50C878] uppercase mb-1 opacity-60">Confidence</div>
                  <div className="text-sm text-white/90">98.7%</div>
                </div>
                <div>
                  <div className="text-[8px] text-[#50C878] uppercase mb-1 opacity-60">Biomass</div>
                  <div className="text-sm text-white/90 font-bold text-[#50C878]">VERIFIED</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleBroadcast}
                disabled={isProcessing}
                className="w-full py-4 bg-[#50C878]/10 border border-[#50C878]/60 hover:bg-[#50C878]/20 text-[#50C878] text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
              >
                {isProcessing ? "[ ETCHING... ]" : "[ BROADCAST TO NOSTR ]"}
              </button>
              <button 
                onClick={handleRescan}
                disabled={isProcessing}
                className="w-full py-2 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white/80 transition-all disabled:opacity-0"
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
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/30 z-20" />
      
      {/* System Status Top Right */}
      <div className="absolute top-4 right-4 text-[8px] text-[#50C878] uppercase tracking-widest z-30 opacity-70 text-right mix-blend-screen drop-shadow-md">
        <div>LAYER 0</div>
        <div>{new Date().toISOString().split("T")[0]}</div>
        <div className="text-[6px] mt-1 opacity-40 italic">{status}</div>
      </div>

      {/* Terminal Overlay */}
      <div className="absolute bottom-8 left-4 z-30 pointer-events-none text-[#50C878] text-[8px] uppercase tracking-widest leading-relaxed drop-shadow-[0_0_2px_rgba(80,200,120,0.8)] mix-blend-screen max-w-[80vw]">
        {logs.map((L, i) => (
          <div key={i} className={`drop-shadow-md ${i === logs.length - 1 ? 'opacity-100 font-bold' : 'opacity-60'}`}>
            {L}
          </div>
        ))}
      </div>

      {/* Scanning Controls */}
      {status === 'SCANNING' && (
        <div className="absolute bottom-10 left-0 right-0 z-40 flex justify-center">
          <button 
            onClick={handleLockTarget}
            className="group relative w-16 h-16 border-2 border-[#50C878]/50 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(80,200,120,0.2)]"
          >
            <div className="w-8 h-8 border border-[#50C878] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-[#50C878] rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -bottom-8 whitespace-nowrap text-[8px] uppercase tracking-[0.4em] text-[#50C878]/70 group-hover:text-[#50C878]">
              Lock Target
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

