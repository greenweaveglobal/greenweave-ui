import { useState } from "react";
import GreenWeaveEve from "./GreenWeaveEve";

export default function App() {
  const [showEve, setShowEve] = useState(false);
  const [fading, setFading] = useState(false);

  const handleTranscend = () => {
    setFading(true);
    setTimeout(() => {
      setShowEve(true);
    }, 1200); // 1.2s smooth fade
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
      className={`relative w-screen h-screen bg-black text-[#50C878] flex flex-col items-center justify-center font-mono selection:bg-[#50C878] selection:text-black transition-opacity duration-[1200ms] ease-in-out ${fading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
    >
      {/* Matrix-like Background Elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#50C878]/10 via-black to-black opacity-50" />
      
      <div className="z-10 flex flex-col items-center">
        <div className="w-12 h-12 mb-6 border border-[#50C878]/30 relative flex items-center justify-center animate-pulse">
           <div className="w-2 h-2 bg-[#50C878] shadow-[0_0_10px_#50C878]"></div>
        </div>
        
        <div className="text-xs tracking-[0.4em] mb-2 opacity-50 uppercase shadow-[#50C878]">
          Node Gateway
        </div>
        
        <h1 className="text-sm uppercase tracking-widest text-[#50C878]/80 mb-12 text-center max-w-xs leading-relaxed">
          The corporate construct has been pruned. Enter Layer 0.
        </h1>

        {/* The Transition Button */}
        <button 
          onClick={handleTranscend}
          className="group relative px-8 py-3 border border-[#50C878]/40 hover:border-[#50C878] bg-transparent hover:bg-[#50C878]/10 transition-all duration-300 overflow-hidden cursor-pointer"
        >
           <div className="absolute inset-0 bg-[#50C878]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
           <span className="relative z-10 text-xs font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(80,200,120,0.5)] group-hover:text-[#50C878] transition-colors duration-300">
             EVE EYE
           </span>
        </button>

        <div className="mt-8 text-[8px] opacity-30 uppercase tracking-[0.3em]">
          Bypassing NIP-07
        </div>
      </div>
    </div>
  );
}
