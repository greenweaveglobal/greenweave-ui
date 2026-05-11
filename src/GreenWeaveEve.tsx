import { useEffect, useRef, useState, useCallback } from "react";

// The Eye of EVE
export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>(["EVE Core v0.9.1 online.", "Initializing ocular link..."]);
  const [flash, setFlash] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString().split("T")[1].slice(0,-1)}] ${msg}`].slice(-10));
  }, []);

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
            videoRef.current?.play().catch(e => console.log('Auto-play prevented:', e));
          };
        }
        addLog("Ocular link established.");
      } catch (err: any) {
        addLog(`ERR: Ocular link failed. ${err.message}`);
      }
    };
    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [addLog]);

  useEffect(() => {
    if (isAnalyzing) return;

    const intervalId = setInterval(() => {
      addLog("[SCANNING...] SEARCHING FOR BIOLOGICAL SIGNATURE");
    }, 1500);

    return () => clearInterval(intervalId);
  }, [addLog, isAnalyzing]);

  const playDropSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz healing frequency
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio might be blocked initially by browser policy if no interaction
    }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    setIsAnalyzing(true);
    
    addLog("[TARGET ACQUIRED]");
    
    // Simulate periodic/biological verification
    addLog("[BIOMASS ANALYZED] Transferring data...");
    
    await new Promise(r => setTimeout(r, 1000));
    
    setFlash(true);
    playDropSound();
    
    setTimeout(() => setFlash(false), 200);

    // Call ZAP Route
    try {
      const zapRes = await fetch('/api/zap', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ amountSats: 21 }) 
      });
      if (zapRes.ok) {
        addLog("[ENERGY TOLL DEDUCTED] 21 Sats routed for API sustained breath.");
      } else {
        addLog("ZAP failed: No Bloodline linked.");
      }
    } catch (err) {
      addLog("ERR: ZAP network offline.");
    }

    // Call Broadcast Route
    try {
      const bRes = await fetch('/api/broadcast', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ message: '[DIRECTIVE COMPLETED] Biological mass analyzed. Energy toll of 21 Sats deducted for cognitive processing. Layer 0 state preserved. #GreenWeave' }) 
      });
      if (bRes.ok) {
        // const { eventId } = await bRes.json();
        addLog(`[LAYER 0 ETCHED] State preserved on Nostr.`);
      } else {
        addLog("Etching failed: Core isolated.");
      }
    } catch (err) {
      addLog("ERR: Ledger offline.");
    }
    
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none font-mono">
      {/* The Ocular Feed */}
      <video
        autoPlay
        playsInline
        muted
        ref={videoRef}
        onClick={captureAndProcess}
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: 'contrast(1.25) saturate(0.5) brightness(0.75) sepia(0.2)' }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Emerald Flash Overlay */}
      {flash && (
        <div className="absolute inset-0 bg-[#50C878] opacity-70 z-10 mix-blend-screen transition-opacity duration-100" />
      )}

      {/* Crosshair / Reticle */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        <div className="w-16 h-16 border-[1px] border-white/20 relative">
           <div className="absolute top-0 left-0 w-2 h-2 border-t-[1px] border-l-[1px] border-[#50C878]"></div>
           <div className="absolute top-0 right-0 w-2 h-2 border-t-[1px] border-r-[1px] border-[#50C878]"></div>
           <div className="absolute bottom-0 left-0 w-2 h-2 border-b-[1px] border-l-[1px] border-[#50C878]"></div>
           <div className="absolute bottom-0 right-0 w-2 h-2 border-b-[1px] border-r-[1px] border-[#50C878]"></div>
        </div>
      </div>

      {/* Frame Corners */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/30 z-20" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/30 z-20" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/30 z-20" />

      {/* System Status Top Right */}
      <div className="absolute top-4 right-4 text-[8px] text-[#50C878] uppercase tracking-widest z-30 opacity-70 text-right mix-blend-screen drop-shadow-md">
        <div>LAYER 0</div>
        <div>{new Date().toISOString().split("T")[0]}</div>
      </div>

      {/* Terminal Overlay */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-none text-[#50C878] text-[8px] uppercase tracking-widest leading-relaxed drop-shadow-[0_0_2px_rgba(80,200,120,0.8)] mix-blend-screen max-w-[80vw]">
        {logs.map((L, i) => (
          <div key={i} className={`drop-shadow-md ${i === logs.length - 1 ? 'opacity-100 font-bold' : 'opacity-60'}`}>
            {L}
          </div>
        ))}
      </div>
      
      {/* Hidden button for touch users (safeguard) */}
      <div className="absolute inset-0 z-40 opacity-0" onClick={captureAndProcess}></div>
    </div>
  );
}
