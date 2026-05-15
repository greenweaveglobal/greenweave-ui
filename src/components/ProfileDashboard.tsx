interface ProfileDashboardProps {
  isIdentityConnected: boolean;
  pubkey: string | null;
  npub: string | null;
  onConnect: () => void;
  onLogout: () => void;
}

export default function ProfileDashboard({ 
  isIdentityConnected, 
  pubkey, 
  npub, 
  onConnect, 
  onLogout 
}: ProfileDashboardProps) {
  if (!isIdentityConnected) {
    return (
      <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in duration-500">
        <div className="text-4xl mb-6 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] uppercase font-black">
          [ AUTH REQUIRED ]
        </div>
        
        <div className="w-full p-6 border-2 border-amber-500/20 bg-amber-950/10 mb-8 text-left">
          <div className="text-[10px] text-amber-500/40 mb-3 font-bold uppercase tracking-widest">Digital Manifesto</div>
          <p className="text-xs text-amber-400/80 leading-relaxed font-bold tracking-tight">
            I weave my digital soul into the green earth. Identity is the seed; decentralization is the soil.
          </p>
        </div>

        <button 
          onClick={onConnect}
          className="w-full py-5 mb-8 relative group overflow-hidden border-2 border-amber-400 bg-amber-500/20 hover:bg-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.2)] cursor-pointer backdrop-blur-sm"
        >
           <span className="relative z-10 text-base font-black uppercase tracking-[0.2em] text-amber-400 group-hover:text-black transition-colors">
             [ UNLOCK IDENTITY ]
           </span>
        </button>
        <div className="text-sm font-bold tracking-widest text-white uppercase leading-relaxed max-w-[240px] mx-auto">
          Connect to manage your <span className="text-amber-400">biomass assets</span>.
        </div>
      </div>
    );
  }

  const shortenedNpub = npub ? `${npub.slice(0, 8)}...${npub.slice(-8)}` : "Unknown";

  return (
    <div className="flex flex-col items-start w-full max-w-sm px-6 text-left animate-in fade-in duration-500 h-full overflow-y-auto">
      <div className="text-sm font-black tracking-[0.2em] text-amber-400 mb-8 border-b-2 border-amber-500/30 pb-3 w-full uppercase flex justify-between items-center">
        <span>Heritage Cluster Node</span>
        <span className="text-[10px] text-[#39FF14] animate-pulse">● ACTIVE</span>
      </div>
      
      {/* Identity Card */}
      <div className="w-full bg-zinc-900 border-2 border-amber-500/20 p-5 mb-8 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          {/* Identicon Placeholder */}
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-900 border-2 border-amber-400 flex items-center justify-center relative shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <div className="text-2xl font-black text-black">NW</div>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]"></div>
          </div>
          <div>
            <div className="text-xs font-black text-amber-500/60 uppercase tracking-widest mb-1">Authenticated npub</div>
            <div className="text-sm font-black text-white tracking-widest uppercase">{shortenedNpub}</div>
          </div>
        </div>

        <div className="text-[10px] font-bold text-amber-500/40 mb-2 uppercase tracking-widest">Full Hex Identity</div>
        <div className="text-[10px] font-bold text-amber-600 break-all font-mono bg-black/40 p-3 border border-amber-500/10 rounded">
          {pubkey}
        </div>
      </div>
      
      <div className="text-xs font-bold text-amber-500/80 mb-3 uppercase tracking-widest">
        BIOMASS PORTFOLIO:
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        <div className="border-2 border-amber-500/30 p-5 bg-zinc-900 flex flex-col shadow-lg">
          <div className="text-3xl font-black text-amber-400 mb-1">0</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white">Signs Cataloged</div>
        </div>
        <div className="border-2 border-amber-500/30 p-5 bg-zinc-900 flex flex-col shadow-lg">
          <div className="text-3xl font-black text-amber-400 mb-1">21</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white">Sats Rooted</div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-3 border-2 border-red-500/40 text-red-500 text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all bg-red-500/5 mb-4"
      >
        [ DISCONNECT NODE ]
      </button>

      <div className="text-[10px] font-bold text-amber-500/40 mb-4 uppercase tracking-widest text-center w-full">
        v0.9.1.5-SECURE
      </div>
    </div>
  );
}
