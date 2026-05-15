interface ProfileDashboardProps {
  isIdentityConnected: boolean;
  pubkey: string | null;
  onConnect: () => void;
}

export default function ProfileDashboard({ isIdentityConnected, pubkey, onConnect }: ProfileDashboardProps) {
  if (!isIdentityConnected) {
    return (
      <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in duration-500">
        <div className="text-2xl mb-4 text-amber-500/60 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">🔒</div>
        
        <button 
          onClick={onConnect}
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
    );
  }

  return (
    <div className="flex flex-col items-start w-full max-w-sm px-6 text-left animate-in fade-in duration-500">
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
  );
}
