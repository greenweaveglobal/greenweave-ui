import { useState, useEffect } from "react";
import { Zap, Heart, MessageSquare } from "lucide-react";
import { SimplePool, nip19, getPublicKey } from "nostr-tools";
import ZapModal from "./ZapModal";

interface LivePost {
  id: string;
  author: string;
  pubkey: string;
  timestamp: string;
  content: string;
  species: string;
  confidence: string;
  description: string;
  location: string;
  energyToll: number;
  image?: string;
  createdAt: number;
}

function getRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp * 1000;
  const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
  if (mins < 60) return `${mins} MINS AGO`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} HOURS AGO`;
  return `${Math.round(hours / 24)} DAYS AGO`;
}

export default function BiomassFeed() {
  const [activeZapTarget, setActiveZapTarget] = useState<string | null>(null);
  const [livePosts, setLivePosts] = useState<LivePost[]>([]);

  useEffect(() => {
    let active = true;
    const pool = new SimplePool();
    const relays = ['wss://nos.lol', 'wss://relay.primal.net', 'wss://relay.damus.io'];

    let userPubkey = "";
    const nodeKey = localStorage.getItem('greenweave_nsec');
    if (nodeKey) {
      try {
        let secretKeyBytes: Uint8Array;
        if (nodeKey.startsWith('nsec1')) {
          const decoded = nip19.decode(nodeKey);
          if (decoded.type === 'nsec') {
             secretKeyBytes = decoded.data as Uint8Array;
             userPubkey = getPublicKey(secretKeyBytes);
          }
        } else if (nodeKey.length === 64) {
          secretKeyBytes = new Uint8Array(nodeKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
          userPubkey = getPublicKey(secretKeyBytes);
        }
      } catch(e) {}
    }

    const sub = pool.subscribeMany(
      relays,
      [
        {
          kinds: [1],
          '#t': ['GreenWeave', 'BiomassProof'],
          limit: 20
        }
      ] as any,
      {
        onevent(event) {
          if (!active) return;
          const text = event.content;
          
          let species = "Unknown Biomass";
          const targetMatch = text.match(/Target:\s*([^\n]+)/);
          if (targetMatch) species = targetMatch[1].trim();

          let confidence = "??";
          const confMatch = text.match(/Confidence:\s*([^\n]+)/);
          if (confMatch) confidence = confMatch[1].trim();

          const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
          let image = "https://picsum.photos/seed/greenweave" + event.id.substring(0,4) + "/600/400";
          if (urlMatch) {
            image = urlMatch[1];
          }

          let location = "Unknown Sector / Layer 0";
          const lTag = event.tags.find(t => t[0] === 'l');
          if (lTag && lTag[1]) {
            location = lTag[1];
          }
          
          let desc = text;
          desc = desc.replace(/Biomass Genesis Scan initiated\.?/gi, '');
          desc = desc.replace(/Target:[^\n]+/gi, '');
          desc = desc.replace(/Status:[^\n]+/gi, '');
          desc = desc.replace(/Confidence:[^\n]+/gi, '');
          if (urlMatch) desc = desc.replace(urlMatch[1], '');
          desc = desc.trim();
          if (!desc) desc = "Biological data secured. Asset pending Genesis verification.";

          const authorNpub = nip19.npubEncode(event.pubkey);
          const authorShort = authorNpub.slice(0, 10) + "...";

          const newPost = {
            id: event.id,
            author: authorShort,
            pubkey: event.pubkey,
            createdAt: event.created_at,
            timestamp: getRelativeTime(event.created_at),
            content: event.content,
            species,
            confidence: confidence.replace('%',''),
            description: desc.length > 150 ? desc.substring(0, 150) + "..." : desc,
            location,
            energyToll: 21,
            image
          };

          setLivePosts(prev => {
            if (prev.find(p => p.id === newPost.id)) return prev;
            let updated = [...prev, newPost];
            
            // Apply sorting logic
            updated = updated.sort((a,b) => {
              if (userPubkey) {
                if (a.pubkey === userPubkey && b.pubkey !== userPubkey) return -1;
                if (b.pubkey === userPubkey && a.pubkey !== userPubkey) return 1;
              }
              return b.createdAt - a.createdAt;
            });
            
            return updated;
          });
        }
      }
    );

    return () => {
      active = false;
      sub.close();
    }
  }, []);

  return (
    <div className="w-full max-w-sm flex-1 flex flex-col pt-4 overflow-hidden animate-in fade-in duration-500">
      <div className="px-4 text-xs font-black text-amber-500/40 mb-6 uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
        LIVE BIOMASS STREAM: LAYER 0 - VERIFIED
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-48 scrollbar-hide">
        <div className="flex flex-col gap-10">
          {livePosts.length === 0 ? (
            <div className="text-center text-zinc-600 text-xs font-black uppercase tracking-widest mt-10">
              [ SCANNING RELAYS... ]
            </div>
          ) : livePosts.map((item) => (
            <div key={item.id} className="bg-zinc-950 border-2 border-amber-500/10 shadow-2xl relative group">
              {/* Image Evidence Block */}
              <div className="relative w-full h-48 overflow-hidden border-b border-amber-500/10 bg-zinc-900">
                <img 
                  src={item.image} 
                  alt={item.species}
                  className="w-full h-full object-cover filter contrast-125 brightness-75 grayscale-[20%] group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                {/* Cyberpunk Tint & HUD Overlays */}
                <div className="absolute inset-0 bg-[#39FF14]/10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-3 left-3 bg-black/80 border border-[#39FF14]/50 px-2 py-1 flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#39FF14] animate-pulse" />
                  <span className="text-[8px] text-[#39FF14] font-black uppercase tracking-widest">SCAN_DATA: 0X{item.id}</span>
                </div>
                
                <div className="absolute bottom-3 right-3 text-[10px] text-white/50 font-mono">
                  {item.location.split(' / ')[0]}
                </div>
              </div>

              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[10px] text-[#39FF14] font-black uppercase tracking-tighter">@{item.author}</div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase">{item.timestamp}</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 px-2 py-1 text-[8px] text-zinc-500 font-mono overflow-hidden text-ellipsis max-w-24 whitespace-nowrap">
                    SIG: {item.id.substring(0, 8)}...
                  </div>
                </div>

                {/* Species Display */}
                <div className="mb-4">
                  <div className="text-2xl text-white font-black uppercase leading-none mb-1 tracking-tight">
                    {item.species.split(' ')[0]} <span className="text-amber-500 text-sm block mt-1">{item.species.split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    LOC: {item.location}
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-medium mb-6 bg-zinc-900/50 p-3 italic border-l-2 border-[#39FF14]/50">
                  "{item.description}"
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-zinc-900">
                  <div>
                    <div className="text-[8px] text-zinc-600 font-black uppercase mb-1">Confidence</div>
                    <div className="text-sm text-white font-black tracking-widest">{item.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-zinc-600 font-black uppercase mb-1">Energy Toll</div>
                    <div className="text-sm text-[#39FF14] font-black tracking-widest">{item.energyToll} SATS</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveZapTarget(item.author)}
                    className="flex-1 py-3 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all active:scale-95 shadow-[0_4px_10px_rgba(234,179,8,0.2)]"
                  >
                    <Zap size={14} fill="currentColor" />
                    ZAP SATS
                  </button>
                  <button className="p-3 border-2 border-zinc-800 text-zinc-500 hover:text-red-500 transition-all">
                    <Heart size={16} />
                  </button>
                  <button className="p-3 border-2 border-zinc-800 text-zinc-500 hover:text-blue-500 transition-all">
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ZapModal 
        isOpen={!!activeZapTarget} 
        onClose={() => setActiveZapTarget(null)} 
        targetName={activeZapTarget || ""}
      />
    </div>
  );
}
