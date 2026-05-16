import { useState } from "react";

export default function MarketDashboard() {
  return (
    <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in duration-500">
      <h1 className="text-2xl font-black tracking-[0.25em] mb-2 text-[#39FF14] uppercase w-full border-b-2 border-[#39FF14]/30 pb-4">
        MARKET PROTOCOL
      </h1>
      <div className="text-[10px] tracking-[0.4em] font-bold mb-8 text-[#39FF14]/80 uppercase">
        Decentralized Trading
      </div>

      <div className="w-full space-y-4">
        {/* Bounty */}
        <div className="w-full bg-zinc-950 border border-[#39FF14]/30 p-4 relative group text-left shadow-[0_0_15px_rgba(57,255,20,0.05)] text-white font-mono flex flex-col gap-3">
           <div className="flex justify-between items-start">
             <div>
               <div className="text-xs text-zinc-500 tracking-widest uppercase mb-1">Biomass Bounty</div>
               <div className="text-sm text-[#39FF14] font-black tracking-widest">S-QUAD-99X</div>
             </div>
             <div className="text-right">
                <div className="text-sm font-black text-amber-400">150,000 SATS</div>
                <div className="text-xs text-zinc-500">45 USDG</div>
             </div>
           </div>
           <div className="text-[10px] text-zinc-400 leading-relaxed border-l border-[#39FF14]/30 pl-2">
             Verify 50 saplings in coordinates [CLASSIFIED]. Protocol requirements: Genesis Node Auth required.
           </div>
           <button className="w-full mt-2 py-2 border border-[#39FF14] text-[#39FF14] text-xs font-black tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors uppercase">
              [ EXECUTE CONTRACT ]
           </button>
        </div>

        {/* Bond */}
         <div className="w-full bg-zinc-950 border border-[#39FF14]/30 p-4 relative group text-left shadow-[0_0_15px_rgba(57,255,20,0.05)] text-white font-mono flex flex-col gap-3">
           <div className="flex justify-between items-start">
             <div>
               <div className="text-xs text-zinc-500 tracking-widest uppercase mb-1">Genesis Bond</div>
               <div className="text-sm text-cyan-400 font-black tracking-widest">AQUA-YIELD-1</div>
             </div>
             <div className="text-right">
                <div className="text-sm font-black text-cyan-400">100 USDG</div>
                <div className="text-xs text-zinc-500">Fixed APY</div>
             </div>
           </div>
           <div className="text-[10px] text-zinc-400 leading-relaxed border-l border-cyan-400/30 pl-2">
             Fund water desalination unit for Sector 7. Mature yield distributed in RGB assets.
           </div>
           <button className="w-full mt-2 py-2 border border-cyan-400 text-cyan-400 text-xs font-black tracking-widest hover:bg-cyan-400 hover:text-black transition-colors uppercase">
              [ ACQUIRE BOND ]
           </button>
        </div>
      </div>
    </div>
  );
}
