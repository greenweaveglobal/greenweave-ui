import { useState } from "react";
import { Zap, Heart, MessageSquare } from "lucide-react";
import ZapModal from "./ZapModal";

const MOCK_FEED = [
  {
    id: "1",
    author: "RootNode_Alpha",
    species: "Musa (Banana Tree)",
    location: "Amazon Basin / Layer 0",
    confidence: 98.7,
    timestamp: "2 HOURS AGO",
    description: "High biomass density detected. Vital carbon sink active.",
    energyToll: 21,
    image: "https://images.unsplash.com/photo-1598112972545-84373a441112?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "2",
    author: "LeafProphet",
    species: "Adansonia (Baobab)",
    location: "Sub-Saharan Node / Layer 1",
    confidence: 95.2,
    timestamp: "5 HOURS AGO",
    description: "Ancient biological reservoir preserved. Connectivity stable.",
    energyToll: 42,
    image: "https://images.unsplash.com/photo-1518384401463-d38760fa6fca?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "3",
    author: "GreenVanguard",
    species: "Sequoiadendron (Giant Sequoia)",
    location: "Sierra Nevada / Layer 2",
    confidence: 99.1,
    timestamp: "8 HOURS AGO",
    description: "Massive carbon sequestration unit verified. Structural integrity optimal.",
    energyToll: 84,
    image: "https://images.unsplash.com/photo-1542316496-e263004d80be?q=80&w=800&auto=format&fit=crop"
  }
];

export default function BiomassFeed() {
  const [activeZapTarget, setActiveZapTarget] = useState<string | null>(null);

  return (
    <div className="w-full max-w-sm flex-1 flex flex-col pt-4 overflow-hidden animate-in fade-in duration-500">
      <div className="px-4 text-xs font-black text-amber-500/40 mb-6 uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
        LIVE BIOMASS STREAM: LAYER 0 - VERIFIED
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-48 scrollbar-hide">
        <div className="flex flex-col gap-10">
          {MOCK_FEED.map((item) => (
            <div key={item.id} className="bg-zinc-950 border-2 border-amber-500/10 shadow-2xl relative group">
              {/* Image Evidence Block */}
              <div className="relative w-full h-48 overflow-hidden border-b border-amber-500/10">
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
                  <div className="bg-zinc-900 border border-zinc-800 px-2 py-1 text-[8px] text-zinc-500 font-mono">
                    SIG: {item.id.repeat(4)}...
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
