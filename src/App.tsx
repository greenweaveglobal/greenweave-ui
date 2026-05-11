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
  const [isIdentityConnected, setIsIdentityConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'HOME' | 'MAP' | 'FEED' | 'ME'>('HOME');

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
        setIsIdentityConnected(true);
      } catch (err) {
        console.error(err);
        alert("Failed to connect Nostr identity: " + (err as Error).message);
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
      className={`relative w-screen h-screen bg-black text-amber-500 flex flex-col font-mono selection:bg-amber-500 selection:text-black transition-opacity duration-[1200ms] ease-in-out ${fading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
    >
      {/* Subtle lighting */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-black to-black opacity-50 pointer-events-none" />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto w-full flex flex-col items-center justify-center pt-8 pb-24">
        
        {activeTab === 'HOME' && (
          <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-500">
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
        )}

        {activeTab === 'MAP' && (
          <div className="text-xs tracking-widest text-amber-500/50 uppercase animate-in fade-in duration-500">
            [ Map Module Offline ]
          </div>
        )}

        {activeTab === 'FEED' && (
          <div className="text-xs tracking-widest text-amber-500/50 uppercase animate-in fade-in duration-500">
            [ Feed Module Offline ]
          </div>
        )}

        {activeTab === 'ME' && (
          <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in duration-500">
            {!isIdentityConnected ? (
              <div className="flex flex-col items-center w-full">
                <div className="text-2xl mb-4 text-amber-500/60 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">🔒</div>
                
                <button 
                  onClick={handleNip07Connect}
                  className="w-full py-4 mb-6 relative group overflow-hidden border border-amber-500/70 bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] cursor-pointer backdrop-blur-sm"
                >
                   <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400 group-hover:text-amber-300 transition-colors drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">
                     [ UNLOCK IDENTITY (NIP-07) ]
                   </span>
                </button>
                <div className="text-[10px] tracking-widest text-amber-500/60 uppercase leading-relaxed max-w-[200px] mx-auto">
                  Enter your garden to manage your biomass assets.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start w-full text-left">
                <div className="text-xs tracking-widest text-amber-400 mb-8 border-b border-amber-500/30 pb-2 w-full uppercase">
                  Heritage Garden Profile
                </div>
                
                <div className="text-[10px] text-amber-500/60 mb-2 uppercase tracking-widest">
                  N-PUB IDENTITY:
                </div>
                <div className="text-xs text-amber-500 mb-8 break-all font-mono opacity-80 bg-amber-500/5 p-3 rounded-sm border border-amber-500/10 w-full">
                  {pubkey}
                </div>
                
                <div className="text-[10px] text-amber-500/60 mb-2 uppercase tracking-widest">
                  BIOMASS STATS:
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  <div className="border border-amber-500/20 p-4 pb-3 bg-amber-500/5 flex flex-col">
                    <div className="text-2xl text-amber-400 mb-1 font-light">0</div>
                    <div className="text-[8px] uppercase tracking-widest text-amber-500/60">Scans</div>
                  </div>
                  <div className="border border-amber-500/20 p-4 pb-3 bg-amber-500/5 flex flex-col">
                    <div className="text-2xl text-amber-400 mb-1 font-light">0</div>
                    <div className="text-[8px] uppercase tracking-widest text-amber-500/60">Sats Paid</div>
                  </div>
                </div>

                <div className="text-[10px] text-amber-500/60 mb-4 uppercase tracking-widest">
                  ROADMAP:
                </div>
                <ul className="text-xs text-amber-500/80 uppercase tracking-widest space-y-3 opacity-90 w-full">
                  <li className="flex items-center"><span className="text-[#50C878] mr-3">✔</span> EVE EYE INITIALIZED</li>
                  <li className="flex items-center"><span className="text-amber-500/30 mr-3">_</span> NOSTR RELAY SYNC</li>
                  <li className="flex items-center"><span className="text-amber-500/30 mr-3">_</span> BIOLOGICAL MASS MARKET</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation Bar (Bottom) */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-center pb-8 pt-4 bg-gradient-to-t from-black via-black to-transparent">
        <div className="flex space-x-2 bg-black/60 backdrop-blur-md px-6 py-3 border border-amber-500/20 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          {['HOME', 'MAP', 'FEED', 'ME'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)}
              className={`transition-all duration-300 px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-bold relative ${activeTab === tab ? 'text-amber-400' : 'text-amber-500/40 hover:text-amber-500/80'}`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-3 right-3 h-[1px] bg-amber-400 shadow-[0_0_5px_#f59e0b]"></div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
