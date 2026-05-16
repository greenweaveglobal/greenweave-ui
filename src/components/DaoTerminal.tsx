import { useState } from "react";

interface DaoTerminalProps {
  onMintUSDG?: () => void;
}

export default function DaoTerminal({ onMintUSDG }: DaoTerminalProps) {
  const [prop881Status, setProp881Status] = useState<'Active' | 'Resolved'>('Active');

  const handleApproveProp881 = () => {
    if (prop881Status !== 'Active') return;
    setProp881Status('Resolved');
    if (onMintUSDG) {
      onMintUSDG();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in duration-500">
      <h1 className="text-2xl font-black tracking-[0.25em] mb-2 text-[#39FF14] uppercase w-full border-b-2 border-[#39FF14]/30 pb-4">
        DAO CONSENSUS
      </h1>
      <div className="text-[10px] tracking-[0.4em] font-bold mb-8 text-[#39FF14]/80 uppercase">
        Network Governance
      </div>

       <div className="w-full space-y-6">
        {/* Proposal 1 */}
        <div className="w-full bg-black border-2 border-zinc-800 p-4 relative group text-left shadow-[0_0_20px_rgba(0,0,0,0.5)]">
           <div className="flex justify-between items-center mb-2">
             <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Prop-881</div>
             {prop881Status === 'Active' ? (
               <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 uppercase tracking-wider">Active</div>
             ) : (
               <div className="text-[10px] text-[#39FF14] font-bold bg-[#39FF14]/10 px-2 py-0.5 uppercase tracking-wider">Resolved - 50 USDG MINTED</div>
             )}
           </div>
           
           <div className="text-sm text-white font-bold tracking-wide uppercase mb-3">
             Verify Biomass Node #442
           </div>
           
           {prop881Status === 'Active' ? (
             <div className="flex gap-2">
               <button 
                 onClick={handleApproveProp881}
                 className="flex-1 border-2 border-[#39FF14]/50 text-[#39FF14] font-black text-[10px] tracking-widest py-2 hover:bg-[#39FF14] hover:text-black transition-colors uppercase"
               >
                 APPROVE
               </button>
               <button className="flex-1 border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-2 hover:bg-red-500 hover:text-black transition-colors uppercase">
                 REJECT
               </button>
             </div>
           ) : (
             <div className="w-full border-2 border-zinc-800 text-zinc-500 font-black text-[10px] tracking-widest py-2 uppercase text-center cursor-not-allowed">
               PROPOSAL CLOSED
             </div>
           )}
        </div>

        {/* Proposal 2 */}
        <div className="w-full bg-black border-2 border-zinc-800 p-4 relative group text-left shadow-[0_0_20px_rgba(0,0,0,0.5)]">
           <div className="flex justify-between items-center mb-2">
             <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Prop-882</div>
             <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 uppercase tracking-wider">Active</div>
           </div>
           
           <div className="text-sm text-white font-bold tracking-wide uppercase mb-3">
             Burn Invalid Biomass Entry
           </div>
           
           <div className="flex gap-2">
             <button className="flex-1 border-2 border-[#39FF14]/50 text-[#39FF14] font-black text-[10px] tracking-widest py-2 hover:bg-[#39FF14] hover:text-black transition-colors uppercase">
               APPROVE
             </button>
             <button className="flex-1 border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-2 hover:bg-red-500 hover:text-black transition-colors uppercase">
               REJECT
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
