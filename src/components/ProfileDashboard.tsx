import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { SimplePool, nip19, getPublicKey } from "nostr-tools";

interface ProfileDashboardProps {
  isIdentityConnected: boolean;
  pubkey: string | null;
  npub: string | null;
  usdgBalance: number;
  setUsdgBalance: (val: number | ((prev: number) => number)) => void;
  nodeConnectionStatus: 'SYNCING' | 'CONNECTED';
  isLightningConnected: boolean;
  isSandbox?: boolean;
  tsatsBalance?: number;
  setTsatsBalance?: (val: number | ((prev: number) => number)) => void;
  onConnect: () => void;
  onLogout: () => void;
  setToastMessage: (msg: string | null) => void;
}

export default function ProfileDashboard({ 
  isIdentityConnected, 
  pubkey, 
  npub, 
  usdgBalance,
  setUsdgBalance,
  nodeConnectionStatus,
  isLightningConnected,
  isSandbox,
  tsatsBalance,
  setTsatsBalance,
  onConnect, 
  onLogout,
  setToastMessage
}: ProfileDashboardProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);

  const [nodeKeyInput, setNodeKeyInput] = useState("");
  const [hasNodeKey, setHasNodeKey] = useState(false);
  const [profile, setProfile] = useState<{ name?: string, display_name?: string, picture?: string } | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [localToastMessage, setLocalToastMessage] = useState<string | null>(null);

  const fetchProfileData = async () => {
    if (!isIdentityConnected) return;
    setIsFetchingProfile(true);

    let pubkeyHex = "";
    try {
      const storedNodeKey = localStorage.getItem('greenweave_nsec') || "";
      if (storedNodeKey.startsWith('nsec')) {
        const decoded = nip19.decode(storedNodeKey);
        pubkeyHex = getPublicKey(decoded.data as Uint8Array);
      } else if (storedNodeKey.startsWith('npub')) {
        pubkeyHex = nip19.decode(storedNodeKey).data as string;
      } else if (storedNodeKey.length === 64) {
        pubkeyHex = getPublicKey(new Uint8Array(storedNodeKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))));
      } else {
        throw new Error("Unknown key format");
      }
    } catch (e) {
      console.error("Key derivation failed", e);
      setIsFetchingProfile(false);
      return;
    }

    const pool = new SimplePool();
    const relays = [
      'wss://purplepag.es', 
      'wss://relay.nostr.band',
      'wss://nos.lol',
      'wss://relay.damus.io'
    ];
    try {
      const events = await pool.querySync(relays, {
        kinds: [0],
        authors: [pubkeyHex],
        limit: 10
      });
      console.log("Fetched Kind 0:", events);
      if (events.length > 0) {
        events.sort((a, b) => b.created_at - a.created_at);
        try {
          if (events[0].content) {
            const profileData = JSON.parse(events[0].content);
            setProfile(profileData);
          } else {
            console.warn("Profile event had empty content.");
          }
        } catch (e) {
          console.error("Failed to parse kind 0 event content:", e);
        }
      }
    } catch (e) {
      console.error("Failed to fetch profile metadata:", e);
    } finally {
      pool.close(relays);
      setIsFetchingProfile(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (active) {
      fetchProfileData();
    }
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdentityConnected, pubkey]);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setHasApiKey(true);
    }
    const savedNodeKey = localStorage.getItem('greenweave_nsec');
    if (savedNodeKey) {
      setHasNodeKey(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('gemini_api_key', apiKeyInput.trim());
      setHasApiKey(true);
      setApiKeyInput("");
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setHasApiKey(false);
  };

  const handleSaveNodeKey = () => {
    if (nodeKeyInput.trim()) {
      localStorage.setItem('greenweave_nsec', nodeKeyInput.trim());
      setHasNodeKey(true);
      setNodeKeyInput("");
    }
  };

  const handleClearNodeKey = () => {
    localStorage.removeItem('greenweave_nsec');
    setHasNodeKey(false);
  };

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

        <div className="w-full mb-8 flex flex-col gap-3">
          <div className="text-xs font-bold text-amber-500/80 mb-3 uppercase tracking-widest text-left">
            [ INITIALIZE NODE ]
          </div>
          <input 
            type="password"
            placeholder="ENTER NODE KEY (NSEC/HEX)"
            className="w-full bg-black border-2 border-amber-500/30 p-4 text-white font-mono text-sm focus:border-amber-400 outline-none transition-all placeholder:text-amber-900"
            value={nodeKeyInput}
            onChange={(e) => setNodeKeyInput(e.target.value)}
          />
          <button 
            onClick={handleSaveNodeKey}
            className="w-full py-5 relative group overflow-hidden border-2 border-amber-400 bg-amber-500/20 hover:bg-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.2)] cursor-pointer backdrop-blur-sm"
          >
             <span className="relative z-10 text-base font-black uppercase tracking-[0.2em] text-amber-400 group-hover:text-black transition-colors">
               [ UNLOCK IDENTITY ]
             </span>
          </button>
        </div>
        
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
      
      {/* Faucet for Sandbox Mode */}
      {isSandbox && (
        <div className="w-full bg-[#F59E0B]/10 border-2 border-[#F59E0B]/50 p-4 mb-8 flex flex-col gap-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <div className="text-[10px] text-[#F59E0B] font-black uppercase tracking-widest text-center border-b border-[#F59E0B]/30 pb-2">
            [ GENESIS FAUCET (SANDBOX MODE) ]
          </div>
          <div className="flex gap-2 w-full mt-2">
            <button 
              onClick={() => {
                 setTsatsBalance?.(prev => prev + 20000);
                 setToastMessage("[ FAUCET ] Mock TSATS claimed successfully.");
                 setTimeout(() => setToastMessage(null), 3000);
              }}
              className="flex-1 py-3 text-[9px] bg-black border border-[#F59E0B] text-[#F59E0B] font-black uppercase tracking-wide hover:bg-[#F59E0B] hover:text-black transition-colors"
            >
              [ CLAIM MOCK TSATS ]
            </button>
            <button 
              onClick={() => {
                 setUsdgBalance?.(prev => prev + 100);
                 setToastMessage("[ FAUCET ] Mock TUSDG minted directly to local RGB state.");
                 setTimeout(() => setToastMessage(null), 3000);
              }}
              className="flex-1 py-3 text-[9px] bg-black border border-[#10B981] text-[#10B981] font-black uppercase tracking-wide hover:bg-[#10B981] hover:text-black transition-colors"
            >
              [ CLAIM MOCK TUSDG ]
            </button>
          </div>
        </div>
      )}

      {/* Identity Card */}
      <div className="w-full flex flex-col items-center justify-center p-6 border border-[#39FF14]/50 rounded-lg bg-black/40 min-h-[140px] gap-3 mb-8 shadow-[0_0_20px_rgba(57,255,20,0.1)] relative">
        {profile?.picture ? (
          <img 
            src={profile.picture} 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-2 border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.5)] object-cover shrink-0" 
          />
        ) : (
          <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border-2 border-[#39FF14] flex items-center justify-center relative shadow-[0_0_10px_rgba(57,255,20,0.5)]">
             <div className="text-2xl font-black text-[#39FF14]">{profile?.name ? profile.name.charAt(0).toUpperCase() : (profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : "NW")}</div>
          </div>
        )}
        
        <div className="w-full flex flex-col items-center">
          <div className="text-lg text-[#39FF14] font-mono tracking-widest text-center">
             {profile?.name || profile?.display_name || "ANONYMOUS NODE"}
          </div>
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono text-zinc-400 tracking-widest">
                {shortenedNpub}
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(npub || "")}
                className="text-zinc-500 hover:text-[#39FF14] transition-colors shrink-0"
                title="Copy npub"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
            <button 
              onClick={fetchProfileData}
              disabled={isFetchingProfile}
              className="text-xs text-[#39FF14]/70 hover:text-[#39FF14] cursor-pointer underline decoration-dashed transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 uppercase tracking-widest"
              title="Force fetch newest profile data"
            >
              {isFetchingProfile ? "[ SYNCING... ]" : "[ REFRESH METADATA ]"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Quantum Core Settings */}
      <div className="w-full mb-6">
        <div className="text-xs font-bold text-amber-500/80 mb-3 uppercase tracking-widest">
          [ QUANTUM CORE: GEMINI API KEY ]
        </div>
        
        {hasApiKey ? (
          <div className="bg-zinc-900 border-2 border-[#39FF14]/30 p-4 flex flex-col gap-3 shadow-lg">
            <div className="text-sm font-black text-[#39FF14] uppercase tracking-widest">
              [ API KEY: SECURED ]
            </div>
            <button 
              onClick={handleClearKey}
              className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/30 py-2 hover:bg-red-500 hover:text-white transition-all"
            >
              [ CLEAR KEY ]
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="password"
              placeholder="ENTER QUANTUM CORE KEY"
              className="w-full bg-black border-2 border-amber-500/30 p-4 text-white font-mono text-sm focus:border-amber-400 outline-none transition-all placeholder:text-amber-900"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            <button 
              onClick={handleSaveKey}
              className="w-full py-3 bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95"
            >
              SAVE KEY
            </button>
          </div>
        )}
      </div>

      {/* Node Private Key Settings */}
      <div className="w-full mb-10">
        <div className="text-xs font-bold text-amber-500/80 mb-3 uppercase tracking-widest">
          [ NODE PRIVATE KEY (NSEC/HEX) ]
        </div>
        
        {hasNodeKey ? (
          <div className="bg-zinc-900 border-2 border-[#39FF14]/30 p-4 flex flex-col gap-3 shadow-lg">
            <div className="text-sm font-black text-[#39FF14] uppercase tracking-widest">
              [ NODE KEY: SECURED ]
            </div>
            <button 
              onClick={handleClearNodeKey}
              className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/30 py-2 hover:bg-red-500 hover:text-white transition-all"
            >
              [ CLEAR NODE KEY ]
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="password"
              placeholder="ENTER NSEC OR HEX"
              className="w-full bg-black border-2 border-amber-500/30 p-4 text-white font-mono text-sm focus:border-amber-400 outline-none transition-all placeholder:text-amber-900"
              value={nodeKeyInput}
              onChange={(e) => setNodeKeyInput(e.target.value)}
            />
            <button 
              onClick={handleSaveNodeKey}
              className="w-full py-3 bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95"
            >
              SAVE NODE KEY
            </button>
          </div>
        )}
      </div>
      {/* RGB Asset Vault */}
      <div className="w-full mb-10">
        <div className="text-xs font-bold text-[#10B981] mb-3 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
          [ RGB ASSET VAULT ]
        </div>
        
        <div className="bg-black border-2 border-[#10B981] p-5 flex flex-col gap-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
           <div className="flex justify-between items-center w-full mb-2">
             <span className="text-xs text-zinc-400 font-mono tracking-widest uppercase">Asset</span>
             <span className="text-[10px] text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded-sm uppercase tracking-wider">Client Verified</span>
           </div>
           <div className="flex justify-between items-end">
             <span className="text-3xl font-black text-white tracking-wider">{usdgBalance.toFixed(2)}</span>
             <div className="flex flex-col items-end gap-1">
               <span className="text-lg font-bold text-[#10B981] tracking-widest flex items-center gap-2">USDG <span className="text-[10px] bg-amber-500 text-black px-1 py-0.5 font-bold">[ TESTNET ]</span></span>
               {nodeConnectionStatus === 'SYNCING' ? (
                 <span className="text-[8px] font-bold text-amber-500 tracking-widest uppercase">[ NODE STATUS: SYNCING ]</span>
               ) : (
                 <span className="text-[8px] font-bold text-[#10B981] tracking-widest uppercase">[ NODE STATUS: CONNECTED ]</span>
               )}
               {isLightningConnected ? (
                 <span className="text-[8px] font-bold text-[#10B981] tracking-widest uppercase">[ LIGHTNING: WEBLN SECURED ]</span>
               ) : (
                 <span className="text-[8px] font-bold text-red-500 tracking-widest uppercase">[ LIGHTNING: DISCONNECTED ]</span>
               )}
             </div>
           </div>
           {isSandbox && (
            <div className="flex justify-between items-end mt-4 pt-4 border-t border-[#10B981]/20">
              <span className="text-3xl font-black text-white tracking-wider">{(tsatsBalance || 0).toLocaleString()}</span>
              <div className="flex flex-col items-end gap-1">
                <span className="text-lg font-bold text-amber-500 tracking-widest flex items-center gap-2">TSATS <span className="text-[10px] bg-amber-500 text-black px-1 py-0.5 font-bold">[ TESTNET ]</span></span>
              </div>
            </div>
           )}
           <button 
             onClick={() => navigator.clipboard.writeText("rgb:5UQmHEzz-yutdi3a-9KTHgD5-S6Lut5A-0M9DaPQ-X~PHblA")}
             className="text-[10px] text-zinc-500 font-mono mt-2 tracking-widest uppercase text-left hover:text-[#10B981] transition-colors flex items-center gap-2 group w-fit"
             title="Copy Genesis Asset ID"
            >
             Contract: rgb:5UQmHEzz...PHblA
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
           </button>
        </div>
      </div>

      <div className="text-xs font-bold text-amber-500/80 mb-3 uppercase tracking-widest">
        BIOMASS PORTFOLIO:
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div className="border-2 border-amber-500/30 p-5 bg-zinc-900 flex flex-col shadow-lg">
          <div className="text-3xl font-black text-amber-400 mb-1">0</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white">Signs Cataloged</div>
        </div>
        <div className="border-2 border-amber-500/30 p-5 bg-zinc-900 flex flex-col shadow-lg">
          <div className="text-3xl font-black text-amber-400 mb-1">21</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white">Sats Rooted</div>
        </div>
      </div>

      {/* Zap Button */}
      <div className="w-full mb-10 relative">
        {localToastMessage && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] z-50 rounded shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-in slide-in-from-bottom-2">
            {localToastMessage}
          </div>
        )}
        <button 
          onClick={() => {
            setLocalToastMessage("INITIATING LIGHTNING LINK...");
            setTimeout(() => {
              window.location.href = "lightning:playfulwaterfall533492@getalby.com";
              setTimeout(() => setLocalToastMessage(null), 2000);
            }, 800);
          }}
          className="w-full py-5 bg-yellow-500 text-black font-black text-sm uppercase tracking-[0.25em] transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center gap-3 border-2 border-yellow-400 group"
        >
          <Zap size={20} fill="black" className="group-hover:animate-pulse" />
          [ ZAP SATS ⚡️ ]
        </button>
        <p className="text-[10px] text-zinc-500 font-bold mt-2 text-center uppercase tracking-wider">
          Support the GreenWeave Genesis Node
        </p>
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
