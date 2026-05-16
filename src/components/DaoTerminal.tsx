import { useState } from "react";

interface DaoTerminalProps {
  onMintUSDG?: (propId: string) => void;
  onSpendTreasury?: (propId: string) => void;
  onDeployProposal?: (cost: number) => void;
  npub?: string | null;
  resolvedProposals: string[];
  daoTreasurySats: number;
  usdgBalance: number;
}

export default function DaoTerminal({ onMintUSDG, onSpendTreasury, onDeployProposal, npub, resolvedProposals, daoTreasurySats, usdgBalance }: DaoTerminalProps) {
  const isProp881Resolved = resolvedProposals.includes("prop-881");
  const isProp883Resolved = resolvedProposals.includes("prop-883");
  const [proposalInput, setProposalInput] = useState("");

  const handleApproveProp881 = () => {
    if (isProp881Resolved) return;
    if (onMintUSDG) {
      onMintUSDG("prop-881");
    }
  };

  const handleApproveProp883 = () => {
    if (isProp883Resolved) return;
    if (onSpendTreasury) {
      onSpendTreasury("prop-883");
    }
  };

  const handleDeployProposal = () => {
    if (!proposalInput.trim()) return;
    if (usdgBalance < 20) {
      alert("[ ERROR: INSUFFICIENT FUNDS. 20 USDG REQUIRED TO PREVENT NETWORK SPAM. ]");
      return;
    }
    if (onDeployProposal) {
      onDeployProposal(20);
      setProposalInput("");
      alert("[ PROPOSAL BROADCASTED TO NOSTR RELAYS AWAITING NETWORK CONSENSUS ]");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm px-6 text-center animate-in fade-in duration-500 h-full overflow-y-auto pb-32 scrollbar-none">
      <h1 className="text-2xl font-black tracking-[0.25em] mb-2 text-[#39FF14] uppercase w-full border-b-2 border-[#39FF14]/30 pb-4">
        DAO CONSENSUS
      </h1>
      <div className="text-[10px] tracking-[0.4em] font-bold mb-6 text-[#39FF14]/80 uppercase">
        Network Governance
      </div>

      {/* Network Treasury */}
      <div className="w-full bg-zinc-950 border-2 border-amber-500/50 p-4 mb-6 text-center font-mono shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase mb-1">
          Network Treasury
        </div>
        <div className="text-xl font-black text-amber-400">
          ⚡ {daoTreasurySats.toLocaleString()} SATS
        </div>
      </div>

      {/* Your Node Status */}
      <div className="w-full bg-zinc-950 border border-amber-500/30 p-4 mb-8 text-left font-mono">
        <div className="text-xs text-amber-500 font-bold tracking-widest uppercase mb-3 border-b border-amber-500/20 pb-2">
          Your Node Status
        </div>
        <div className="flex flex-col gap-1 text-[10px] text-zinc-400 tracking-widest uppercase">
          <div className="flex justify-between"><span>Npub:</span> <span className="text-white">{npub ? `${npub.slice(0, 9)}...${npub.slice(-4)}` : "NOT_CONNECTED"}</span></div>
          <div className="flex justify-between"><span>Eco-History:</span> <span className="text-[#39FF14]">14 Valid Scans</span></div>
          <div className="flex justify-between"><span>Trust Score:</span> <span className="text-cyan-400">Level 4</span></div>
          <div className="flex justify-between"><span>Voting Weight:</span> <span className="text-amber-500 font-bold">4.2x Multiplier</span></div>
        </div>
      </div>

      {/* Initiate Proposal */}
      <div className="w-full bg-zinc-950 border border-cyan-400/30 p-4 mb-8 text-left font-mono">
        <div className="text-xs text-cyan-400 font-bold tracking-widest uppercase mb-3 border-b border-cyan-400/20 pb-2">
          Initiate Proposal
        </div>
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            value={proposalInput}
            onChange={(e) => setProposalInput(e.target.value)}
            placeholder="[ ENTER PROPOSAL COMMAND OR FUNDING REQUEST ]"
            className="w-full bg-black border border-cyan-400/30 p-3 text-[10px] text-cyan-400 placeholder:text-cyan-400/30 font-mono focus:outline-none focus:border-cyan-400 uppercase tracking-widest"
          />
          <button 
            onClick={handleDeployProposal}
            className="w-full border-2 border-cyan-400/50 text-cyan-400 font-black text-[10px] tracking-widest py-3 hover:bg-cyan-400 hover:text-black transition-colors uppercase"
          >
            [ + DEPLOY PROPOSAL (-20 USDG STAKE) ]
          </button>
          <div className="text-[8px] text-zinc-500 text-center uppercase tracking-widest">
            *Warning: Rejected proposals will result in 100% slashing of the 20 USDG stake to the Network Treasury.*
          </div>
        </div>
      </div>

       <div className="w-full space-y-6">
        {/* Proposal 1 */}
        <div className="w-full bg-black border-2 border-zinc-800 p-4 relative group text-left shadow-[0_0_20px_rgba(0,0,0,0.5)]">
           <div className="flex justify-between items-center mb-2">
             <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Prop-881</div>
             {!isProp881Resolved ? (
               <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 uppercase tracking-wider">Active</div>
             ) : (
               <div className="text-[10px] text-[#39FF14] font-bold bg-[#39FF14]/10 px-2 py-0.5 uppercase tracking-wider">Resolved - 50 USDG MINTED</div>
             )}
           </div>
           
           <div className="text-sm text-white font-bold tracking-wide uppercase mb-3">
             Verify Biomass Node #442
           </div>
           
           <div className="flex flex-col gap-1 mb-4 text-xs font-mono text-[#39FF14]/70 bg-[#39FF14]/5 p-2 border border-[#39FF14]/10">
             <div><span className="text-zinc-500">TARGET:</span> DALBERGIA LATIFOLIA (INDIAN ROSEWOOD)</div>
             <div><span className="text-zinc-500">AI CONF.:</span> 92.5%</div>
             <div className="truncate"><span className="text-zinc-500">PROOF:</span> NOTE1XYZ89A7B6C5D4E3F2G1H...</div>
             <div><span className="text-zinc-500">MINT ALG:</span> BASE(10) * SPECIES(5.0) = 50 USDG</div>
           </div>
           
           {!isProp881Resolved ? (
             <div className="flex flex-col gap-4">
               <div>
                 <div className="text-[10px] font-bold text-amber-500/80 mb-1 uppercase tracking-widest text-center">
                   Network Consensus Required
                 </div>
                 <div className="text-[10px] text-zinc-500 text-center uppercase tracking-widest">
                   Consensus Threshold: 66.6% Node Weight
                 </div>
               </div>
               <div className="flex flex-col gap-2">
                 <button 
                   onClick={handleApproveProp881}
                   className="w-full border-2 border-[#39FF14]/50 text-[#39FF14] font-black text-[10px] tracking-widest py-3 hover:bg-[#39FF14] hover:text-black transition-colors uppercase"
                 >
                   APPROVE & STAKE 5 USDG
                 </button>
                 <button className="w-full border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-3 hover:bg-red-500 hover:text-black transition-colors uppercase">
                   REJECT & STAKE 5 USDG
                 </button>
                 <div className="text-[8px] text-zinc-600 text-center mt-1 uppercase">
                   *Warning: Malicious voting will result in 100% slashing of staked assets.*
                 </div>
               </div>
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
           
           <div className="flex flex-col gap-4">
             <div>
               <div className="text-[10px] font-bold text-amber-500/80 mb-1 uppercase tracking-widest text-center">
                 Network Consensus Required
               </div>
               <div className="text-[10px] text-zinc-500 text-center uppercase tracking-widest">
                 Consensus Threshold: 66.6% Node Weight
               </div>
             </div>
             <div className="flex flex-col gap-2">
               <button className="w-full border-2 border-[#39FF14]/50 text-[#39FF14] font-black text-[10px] tracking-widest py-3 hover:bg-[#39FF14] hover:text-black transition-colors uppercase">
                 APPROVE & STAKE 5 USDG
               </button>
               <button className="w-full border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-3 hover:bg-red-500 hover:text-black transition-colors uppercase">
                 REJECT & STAKE 5 USDG
               </button>
               <div className="text-[8px] text-zinc-600 text-center mt-1 uppercase">
                 *Warning: Malicious voting will result in 100% slashing of staked assets.*
               </div>
             </div>
           </div>
        </div>
        {/* Proposal 3: Treasury Expenditure */}
        <div className="w-full bg-black border-2 border-amber-500/30 p-4 relative group text-left shadow-[0_0_20px_rgba(245,158,11,0.1)]">
           <div className="flex justify-between items-center mb-2">
             <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Prop-883</div>
             {!isProp883Resolved ? (
               <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 uppercase tracking-wider">Active</div>
             ) : (
               <div className="text-[10px] text-amber-500 font-bold bg-amber-500/20 px-2 py-0.5 uppercase tracking-wider">Resolved - 500 SATS SPENT</div>
             )}
           </div>
           
           <div className="text-sm text-white font-bold tracking-wide uppercase mb-3">
             <span className="text-amber-500">[ FUNDING ]</span> Upgrade Nostr Relay Infrastructure
           </div>

           <div className="flex flex-col gap-1 mb-4 text-xs font-mono text-amber-500/70 bg-amber-500/5 p-2 border border-amber-500/10">
             <div><span className="text-zinc-500">REQUEST:</span> 500 SATS</div>
             <div><span className="text-zinc-500">RECIPIENT:</span> npub1relay...</div>
             <div><span className="text-zinc-500">PURPOSE:</span> Server expansion for SEA region.</div>
           </div>
           
           {!isProp883Resolved ? (
             <div className="flex flex-col gap-4">
               <div>
                 <div className="text-[10px] font-bold text-amber-500/80 mb-1 uppercase tracking-widest text-center">
                   Network Consensus Required
                 </div>
                 <div className="text-[10px] text-zinc-500 text-center uppercase tracking-widest">
                   Consensus Threshold: 51.0% Node Weight
                 </div>
               </div>
               <div className="flex flex-col gap-2">
                 <button 
                   onClick={handleApproveProp883}
                   className="w-full border-2 border-[#39FF14]/50 text-[#39FF14] font-black text-[10px] tracking-widest py-3 hover:bg-[#39FF14] hover:text-black transition-colors uppercase"
                 >
                   APPROVE & STAKE 5 USDG
                 </button>
                 <button className="w-full border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-3 hover:bg-red-500 hover:text-black transition-colors uppercase">
                   REJECT & STAKE 5 USDG
                 </button>
                 <div className="text-[8px] text-zinc-600 text-center mt-1 uppercase">
                   *Warning: Malicious voting will result in 100% slashing of staked assets.*
                 </div>
               </div>
             </div>
           ) : (
             <div className="w-full border-2 border-zinc-800 text-zinc-500 font-black text-[10px] tracking-widest py-2 uppercase text-center cursor-not-allowed">
               PROPOSAL CLOSED
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
