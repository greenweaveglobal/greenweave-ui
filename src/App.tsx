import { useState, useEffect } from "react";
import Scanner from "./components/Scanner";
import ProfileDashboard from "./components/ProfileDashboard";
import BiomassFeed from "./components/BiomassFeed";
import MarketDashboard from "./components/MarketDashboard";
import DaoTerminal from "./components/DaoTerminal";
import { nip19, getPublicKey } from "nostr-tools";

export default function App() {
  const [showEve, setShowEve] = useState(false);
  const [fading, setFading] = useState(false);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [npub, setNpub] = useState<string | null>(null);
  const [isIdentityConnected, setIsIdentityConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'SCAN' | 'FEED' | 'MARKET' | 'DAO' | 'ME'>('SCAN');
  const [usdgBalance, setUsdgBalance] = useState<number>(0.00);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadIdentity = () => {
      const nodeKey = localStorage.getItem('greenweave_nsec');
      if (nodeKey) {
        try {
          let secretKeyBytes: Uint8Array;
          if (nodeKey.startsWith('nsec1')) {
            const decoded = nip19.decode(nodeKey);
            if (decoded.type !== 'nsec') throw new Error("Invalid NSEC");
            secretKeyBytes = decoded.data as Uint8Array;
          } else {
            secretKeyBytes = new Uint8Array(nodeKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
          }
          const hexPubkey = getPublicKey(secretKeyBytes);
          setPubkey(hexPubkey);
          setNpub(nip19.npubEncode(hexPubkey));
          setIsIdentityConnected(true);
        } catch (e) {
          console.error("Failed to derive identity from node key", e);
          setIsIdentityConnected(false);
        }
      } else {
        setIsIdentityConnected(false);
        setPubkey(null);
        setNpub(null);
      }
    };

    loadIdentity();
    // Poll for changes or use a custom event if navigating
    const interval = setInterval(loadIdentity, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTranscend = () => {
    setFading(true);
    setTimeout(() => {
      setShowEve(true);
    }, 1200); // 1.2s smooth fade
  };

  const handleConnect = () => {
    // If not connected, prompt the user to go to the ME tab
    setActiveTab('ME');
  };

  const handleLogout = () => {
    localStorage.removeItem('greenweave_nsec');
    setPubkey(null);
    setNpub(null);
    setIsIdentityConnected(false);
  };

  if (showEve) {
    return (
      <div className="animate-in fade-in duration-1000 w-screen h-[100dvh] bg-black overflow-hidden relative">
        <Scanner onClose={() => {
          setShowEve(false);
          setFading(false);
          setActiveTab('SCAN'); // Return to Home dashboard
        }} />
      </div>
    );
  }

  return (
    <div 
      className={`relative w-screen h-[100dvh] bg-black text-amber-500 flex flex-col font-mono selection:bg-amber-500 selection:text-black transition-opacity duration-[1200ms] ease-in-out overflow-hidden ${fading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
    >
      {/* Subtle lighting overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-black to-black opacity-50 pointer-events-none" />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#39FF14] text-black px-6 py-3 font-bold uppercase tracking-widest text-[10px] sm:text-xs rounded shadow-[0_0_20px_rgba(57,255,20,0.5)] animate-in slide-in-from-top-4 fade-in duration-300 text-center w-[90%] max-w-sm">
          {toastMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className={`relative z-10 flex-1 w-full min-h-0 flex flex-col items-center p-6 pb-[120px] ${activeTab === 'SCAN' ? 'justify-center' : 'justify-start'}`}>
        
        {activeTab === 'SCAN' && (
          <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Diamond Logo */}
            <div className="w-14 h-14 mb-8 rotate-45 border-2 border-amber-400 relative flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
               <div className="w-3 h-3 bg-amber-400 shadow-[0_0_15px_#f59e0b]"></div>
            </div>
            
            {/* Title Section */}
            <h1 className="text-4xl font-black tracking-[0.25em] mb-2 text-amber-400 uppercase">
              GREEN WEAVE
            </h1>
            <div className="text-xs tracking-[0.4em] font-bold mb-10 text-amber-500/80 uppercase">
              The Rooting Flow
            </div>
            
            {/* Slogan - High Contrast */}
            <p className="text-sm tracking-wide text-white font-medium mb-12 uppercase leading-relaxed max-w-[280px] mx-auto">
              Every tree, one green thread. <br />
              <span className="text-amber-400 font-bold mt-3 text-lg block tracking-wider">Together, we weave the earth back.</span>
            </p>

            {/* Transition Control - Large & Robust */}
            <button 
              onClick={handleTranscend}
              className="group relative px-8 py-4 border-2 border-[#39FF14] bg-black hover:bg-[#39FF14]/20 transition-all duration-300 cursor-pointer w-full max-w-[240px] shadow-[0_0_15px_rgba(57,255,20,0.2)]"
            >
               <span className="relative z-10 text-sm font-black uppercase tracking-[0.3em] text-[#39FF14] group-hover:text-white transition-all duration-300">
                 [ EVE EYE ]
               </span>
            </button>
          </div>
        )}

        {activeTab === 'MARKET' && (
          <MarketDashboard />
        )}

        {activeTab === 'DAO' && (
          <DaoTerminal npub={npub} onMintUSDG={() => {
            setUsdgBalance(prev => prev + 50);
            setToastMessage("[ CONSENSUS REACHED. 50 USDG MINTED TO RGB VAULT. ]");
            setTimeout(() => setToastMessage(null), 3000);
          }} />
        )}

        {activeTab === 'FEED' && (
          <BiomassFeed />
        )}

        {activeTab === 'ME' && (
          <ProfileDashboard 
            isIdentityConnected={isIdentityConnected}
            pubkey={pubkey}
            npub={npub}
            usdgBalance={usdgBalance}
            onConnect={handleConnect}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Persistence Interface (Fixed Navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-4 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-md mx-auto flex justify-around items-center bg-zinc-900 border-2 border-amber-500/40 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden">
          {(['SCAN', 'FEED', 'MARKET', 'DAO', 'ME'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`flex-1 transition-all duration-300 py-4 text-[10px] tracking-widest uppercase font-black relative flex flex-col items-center gap-1 ${activeTab === tab ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-amber-500/80'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full bg-amber-400 mb-1 transition-all duration-300 ${activeTab === tab ? 'opacity-100 scale-125 shadow-[0_0_8px_#f59e0b]' : 'opacity-0 scale-50'}`} />
              {tab}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
