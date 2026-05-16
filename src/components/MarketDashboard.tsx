import { useState } from "react";

interface MarketDashboardProps {
  onSwap: (sats: number, usdg: number) => void;
}

export default function MarketDashboard({ onSwap }: MarketDashboardProps) {
  const [amountInput, setAmountInput] = useState<string>('1000');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapDirection, setSwapDirection] = useState<'SATS_TO_USDG' | 'USDG_TO_SATS'>('SATS_TO_USDG');

  const EXCHANGE_RATE = 100; // 100 SATS = 1 USDG

  const handleSwap = () => {
    const amount = parseInt(amountInput);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsSwapping(true);
    
    setTimeout(() => {
      let sats = 0;
      let usdg = 0;
      
      if (swapDirection === 'SATS_TO_USDG') {
        sats = amount;
        usdg = amount / EXCHANGE_RATE;
        // Simulate Lightning payment
        window.location.href = "lightning:playfulwaterfall533492@getalby.com";
      } else {
        usdg = amount;
        sats = -(amount * EXCHANGE_RATE); // Negative because user receives SATS? Instructed earlier: SATS go to user, USDG goes ? 
        // We will just pass sats, usdg
      }
      
      onSwap(sats, usdg);
      setIsSwapping(false);
      setAmountInput('1000');
    }, 1500);
  };

  const calculateOutput = (input: number) => {
    if (isNaN(input)) return "0.00";
    if (swapDirection === 'SATS_TO_USDG') {
      return (input / EXCHANGE_RATE).toFixed(2) + " USDG";
    } else {
      return (input * EXCHANGE_RATE).toLocaleString() + " SATS";
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in duration-500 h-full overflow-y-auto pb-32 scrollbar-none">
      <h1 className="text-2xl font-black tracking-[0.25em] mb-2 text-[#39FF14] uppercase w-full border-b-2 border-[#39FF14]/30 pb-4">
        MARKET PROTOCOL
      </h1>
      <div className="text-[10px] tracking-[0.4em] font-bold mb-8 text-[#39FF14]/80 uppercase">
        Circular Economy Exchange
      </div>

      <div className="w-full space-y-8">
        {/* LIQUIDITY PROTOCOL */}
        <div className="flex justify-center mb-4">
          <div className="text-[10px] tracking-[0.3em] font-bold text-amber-500 uppercase border border-amber-500 px-4 py-1">
            [ LIQUIDITY PROTOCOL ]
          </div>
        </div>

        <div className="w-full bg-black border-2 border-amber-500/50 p-5 relative group text-left shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <div className="text-xs text-amber-500 font-bold tracking-widest uppercase mb-4 text-center border-b border-amber-500/20 pb-2">
            EXCHANGE RATE: 100 SATS = 1 USDG
          </div>
          
          <div className="flex justify-center mb-4">
             <button 
               onClick={() => setSwapDirection(prev => prev === 'SATS_TO_USDG' ? 'USDG_TO_SATS' : 'SATS_TO_USDG')}
               className="text-[10px] uppercase font-bold tracking-widest border border-amber-500/50 px-3 py-1 text-amber-500 hover:bg-amber-500 hover:text-black transition-colors"
             >
               DIRECTION: {swapDirection === 'SATS_TO_USDG' ? 'SATS -> USDG' : 'USDG -> SATS'}
             </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest">
                [ Enter Amount ] <span className={swapDirection === 'SATS_TO_USDG' ? 'text-amber-500' : 'text-[#39FF14]'}>({swapDirection === 'SATS_TO_USDG' ? 'SATS' : 'USDG'})</span>
              </label>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className={`w-full bg-zinc-900 border p-3 text-white font-mono text-center focus:outline-none transition-colors ${
                  swapDirection === 'SATS_TO_USDG' 
                    ? 'border-amber-500/30 focus:border-amber-500' 
                    : 'border-[#39FF14]/30 focus:border-[#39FF14]'
                }`}
                placeholder="0"
              />
            </div>
            
            <div className="flex justify-center">
              <div className="text-zinc-500">↓</div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                <span className="text-zinc-500">Receive</span>
              </div>
              <div className={`w-full bg-zinc-900 border p-3 font-mono text-center font-black ${
                swapDirection === 'SATS_TO_USDG'
                  ? 'border-[#39FF14]/30 text-[#39FF14]'
                  : 'border-amber-500/30 text-amber-500'
              }`}>
                {calculateOutput(parseInt(amountInput))}
              </div>
            </div>

            <button
              onClick={handleSwap}
              disabled={isSwapping || isNaN(parseInt(amountInput)) || parseInt(amountInput) <= 0}
              className="w-full mt-2 py-4 border-2 border-amber-500 text-amber-500 font-black tracking-widest hover:bg-amber-500 hover:text-black transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwapping ? "[ PROCESSING... ]" : "[ EXECUTE ATOMIC SWAP ]"}
            </button>
          </div>
        </div>

        {/* ACTIVE BOUNTIES */}
        <div className="flex justify-center mt-8 mb-4">
          <div className="text-[10px] tracking-[0.3em] font-bold text-[#39FF14] uppercase border border-[#39FF14] px-4 py-1">
            [ ACTIVE BOUNTIES ]
          </div>
        </div>

        {/* Bounty Card 1 */}
        <div className="w-full bg-zinc-950 border border-[#39FF14]/30 p-4 relative group text-left shadow-[0_0_15px_rgba(57,255,20,0.05)] text-white font-mono flex flex-col gap-3">
           <div className="flex flex-col gap-1 mb-2">
             <div className="text-xs text-zinc-500 tracking-widest uppercase">Target:</div>
             <div className="text-sm font-bold text-white uppercase tracking-wider pl-2 border-l-2 border-[#39FF14]/50">
               Require 10 scans of Dipterocarpus alatus (Yang)
             </div>
           </div>
           
           <div className="flex justify-between items-center bg-black p-2 border border-[#39FF14]/20">
             <div className="flex flex-col">
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Reward Pool</span>
               <span className="text-[#39FF14] font-black text-sm">150 USDG</span>
             </div>
             <div className="flex flex-col text-right">
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Status</span>
               <span className="text-white font-bold text-sm">4 / 10 Completed</span>
             </div>
           </div>

           <button className="w-full mt-2 py-3 border border-[#39FF14] text-[#39FF14] text-xs font-black tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors uppercase">
              [ CLAIM BOUNTY TASK ]
           </button>
        </div>

        {/* Bounty Card 2 */}
        <div className="w-full bg-zinc-950 border border-[#39FF14]/30 p-4 relative group text-left shadow-[0_0_15px_rgba(57,255,20,0.05)] text-white font-mono flex flex-col gap-3">
           <div className="flex flex-col gap-1 mb-2">
             <div className="text-xs text-zinc-500 tracking-widest uppercase">Target:</div>
             <div className="text-sm font-bold text-white uppercase tracking-wider pl-2 border-l-2 border-[#39FF14]/50">
               Verify Carbon Sink Anomaly in Sector 7
             </div>
           </div>
           
           <div className="flex justify-between items-center bg-black p-2 border border-[#39FF14]/20">
             <div className="flex flex-col">
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Reward</span>
               <span className="text-[#39FF14] font-black text-sm">50 USDG</span>
             </div>
             <div className="flex flex-col text-right">
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Status</span>
               <span className="text-amber-500 font-bold text-sm">Awaiting Nodes</span>
             </div>
           </div>

           <button className="w-full mt-2 py-3 border border-[#39FF14] text-[#39FF14] text-xs font-black tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors uppercase">
              [ CLAIM BOUNTY TASK ]
           </button>
        </div>
      </div>
    </div>
  );
}