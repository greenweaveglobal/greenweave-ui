import { useState } from "react";

interface MarketDashboardProps {
  onSwap: (sats: number, usdg: number) => void;
}

export default function MarketDashboard({ onSwap }: MarketDashboardProps) {
  const [satsToSwap, setSatsToSwap] = useState<string>('1000');
  const [isSwapping, setIsSwapping] = useState(false);
  const handleSwap = () => {
    const sats = parseInt(satsToSwap);
    if (isNaN(sats) || sats <= 0) return;
    
    setIsSwapping(true);
    
    // Simulate Lightning payment
    window.location.href = "lightning:playfulwaterfall533492@getalby.com";
    
    setTimeout(() => {
      const usdg = sats / 100;
      onSwap(sats, usdg);
      setIsSwapping(false);
      setSatsToSwap('1000');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in duration-500 h-full overflow-y-auto pb-32 scrollbar-none">
      <h1 className="text-2xl font-black tracking-[0.25em] mb-2 text-[#39FF14] uppercase w-full border-b-2 border-[#39FF14]/30 pb-4">
        MARKET PROTOCOL
      </h1>
      <div className="text-[10px] tracking-[0.4em] font-bold mb-8 text-[#39FF14]/80 uppercase">
        Decentralized Trading
      </div>

      <div className="w-full space-y-6">
        {/* Liquidity Exchange */}
        <div className="w-full bg-black border-2 border-amber-500/50 p-5 relative group text-left shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <div className="text-sm text-amber-500 font-bold tracking-widest uppercase mb-4 text-center border-b border-amber-500/20 pb-2">
            Liquidity Exchange
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Deposit SATS</label>
              <input
                type="number"
                value={satsToSwap}
                onChange={(e) => setSatsToSwap(e.target.value)}
                className="w-full bg-zinc-900 border border-amber-500/30 p-3 text-white font-mono text-center focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="0"
              />
            </div>
            
            <div className="flex justify-center">
              <div className="text-zinc-500">↓</div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                <span className="text-zinc-500">Receive USDG</span>
                <span className="text-cyan-400 font-bold">RATE: 100 SATS = 1 USDG</span>
              </div>
              <div className="w-full bg-zinc-900 border border-cyan-400/30 p-3 text-cyan-400 font-mono text-center font-black">
                {isNaN(parseInt(satsToSwap)) ? "0.00" : (parseInt(satsToSwap) / 100).toFixed(2)} USDG
              </div>
            </div>

            <button
              onClick={handleSwap}
              disabled={isSwapping || isNaN(parseInt(satsToSwap)) || parseInt(satsToSwap) <= 0}
              className="w-full mt-2 py-4 border-2 border-amber-500 text-amber-500 font-black tracking-widest hover:bg-amber-500 hover:text-black transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwapping ? "[ PROCESSING... ]" : "[ INITIATE LIGHTNING SWAP ]"}
            </button>
          </div>
        </div>

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
