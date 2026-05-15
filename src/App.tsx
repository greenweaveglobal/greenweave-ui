import { useState, useEffect } from "react";
import Scanner from "./components/Scanner";
import ProfileDashboard from "./components/ProfileDashboard";

export default function App() {
  const [showEve, setShowEve] = useState(false);
  const [fading, setFading] = useState(false);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [isIdentityConnected, setIsIdentityConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'HOME' | 'MAP' | 'FEED' | 'ME'>('HOME');

  useEffect(() => {
    const handleAuth = (e: any) => {
      if (e.detail.type === 'login' || e.detail.type === 'signup') {
        setPubkey(e.detail.pubkey);
        setIsIdentityConnected(true);
      }
    };
    document.addEventListener('nlAuth', handleAuth);
    return () => document.removeEventListener('nlAuth', handleAuth);
  }, []);

  const handleTranscend = () => {
    setFading(true);
    setTimeout(() => {
      setShowEve(true);
    }, 1200); // 1.2s smooth fade
  };

  const handleNip07Connect = () => {
    document.dispatchEvent(new CustomEvent('nlLaunch', { detail: 'welcome' }));
  };

  if (showEve) {
    return (
      <div className="animate-in fade-in duration-1000 w-screen h-screen bg-black">
        <Scanner />
      </div>
    );
  }

  return (
    <div 
      className={`relative w-screen h-screen bg-black text-amber-500 flex flex-col font-mono selection:bg-amber-500 selection:text-black transition-opacity duration-[1200ms] ease-in-out ${fading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
    >
      {/* Subtle lighting overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-black to-black opacity-50 pointer-events-none" />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto w-full flex flex-col items-center justify-center pt-8 pb-24">
        
        {activeTab === 'HOME' && (
          <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Diamond Logo */}
            <div className="w-12 h-12 mb-8 rotate-45 border border-amber-500/40 relative flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
               <div className="w-2 h-2 bg-amber-500/80 shadow-[0_0_10px_#f59e0b]"></div>
            </div>
            
            {/* Title Section */}
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

            {/* Transition Control */}
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
          <ProfileDashboard 
            isIdentityConnected={isIdentityConnected}
            pubkey={pubkey}
            onConnect={handleNip07Connect}
          />
        )}
      </main>

      {/* Persistence Interface (Navigation) */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-center pb-8 pt-4 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
        <div className="flex space-x-2 bg-black/60 backdrop-blur-md px-6 py-3 border border-amber-500/20 shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-auto">
          {(['HOME', 'MAP', 'FEED', 'ME'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
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
