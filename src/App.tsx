import { useState } from "react";
import GreenWeaveEve from "./GreenWeaveEve";

declare global {
  interface Window {
    nostr?: any;
  }
}

export default function App() {
  const [showEve, setShowEve] = useState(false);
  const [fading, setFading] = useState(false);
  const [pubkey, setPubkey] = useState<string | null>(null);

  const handleTranscend = () => {
    setFading(true);
    setTimeout(() => {
      setShowEve(true);
    }, 1200); // 1.2s smooth fade
  };

  const handleNip07Connect = async () => {
    if (window.nostr) {
      try {
        const key = await window.nostr.getPublicKey();
        setPubkey(key);
      } catch (err) {
        console.error(err);
        alert("Failed to connect Nostr identity.");
      }
    } else {
      alert("Nostr extension not found.");
    }
  };

  if (showEve) {
    return (
      <div className="animate-in fade-in duration-1000 w-screen h-screen bg-black">
        <GreenWeaveEve />
      </div>
    );
  }

  return (
    <div 
      className={`relative w-screen h-screen bg-black text-amber-500 flex flex-col items-center justify-center font-mono selection:bg-amber-500 selection:text-black transition-opacity duration-[1200ms] ease-in-out ${fading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
    >
      {/* Subtle lighting */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-black to-black opacity-50" />
      
      <div className="z-10 flex flex-col items-center w-full max-w-sm px-6 text-center">
        {/* Diamond Logo */}
        <div className="w-12 h-12 mb-8 rotate-45 border border-amber-500/40 relative flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
           <div className="w-2 h-2 bg-amber-500/80 shadow-[0_0_10px_#f59e0b]"></div>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold tracking-[0.2em] mb-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
          GREEN WEAVE
        </h1>
        <div className="text-[10px] tracking-[0.4em] mb-8 opacity-60 uppercase">
          The Rooting Flow
        </div>
        
        {/* Slogan */}
        <p className="text-xs tracking-widest text-amber-500/80 mb-12 uppercase leading-relaxed max-w-[260px] mx-auto">
          Every tree, one green thread. <br />
          <span className="text-amber-400 font-bold mt-2 inline-block drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]">Together, we weave the earth back.</span>
        </p>

        {/* NIP-07 Connect Button (Decorative for now, as requested) */}
        <button 
          onClick={handleNip07Connect}
          className="w-full py-4 mb-6 relative group overflow-hidden border border-amber-500/70 bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] cursor-pointer backdrop-blur-sm"
        >
           <span className="relative z-10 text-xs font-bold uppercase tracking-[0.2em] text-amber-400 group-hover:text-amber-300 transition-colors drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">
             {pubkey ? `CONNECTED: npub1…` : "Connect Identity (NIP-07)"}
           </span>
        </button>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-6"></div>

        {/* The EVE EYE Transition Button */}
        <button 
          onClick={handleTranscend}
          className="group relative px-6 py-3 border border-[#50C878]/30 hover:border-[#50C878]/80 bg-black hover:bg-[#50C878]/10 transition-all duration-500 cursor-pointer w-full max-w-[200px]"
        >
           <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.3em] text-[#50C878]/70 group-hover:text-[#50C878] group-hover:drop-shadow-[0_0_8px_rgba(80,200,120,0.8)] transition-all duration-300">
             [ EVE EYE ]
           </span>
        </button>
      </div>
    </div>
  );
}
