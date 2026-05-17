import { useState } from "react";
import { formatCypherpunkDate } from "../utils";

interface DaoTerminalProps {
  onMintUSDG?: (propId: string) => void;
  onSpendTreasury?: (propId: string) => void;
  onDeployProposal?: (cost: number) => void;
  onBurnNode?: (propId: string, burnAmount: number) => void;
  npub?: string | null;
  resolvedProposals: string[];
  daoTreasurySats: number;
  usdgBalance: number;
  totalSupply: number;
  halvingClock: number;
  dynamicProposals?: any[];
  payInvoice?: (invoice: string) => Promise<any>;
}

export default function DaoTerminal({ onMintUSDG, onSpendTreasury, onDeployProposal, onBurnNode, npub, resolvedProposals, daoTreasurySats, usdgBalance, totalSupply, halvingClock, dynamicProposals = [], payInvoice }: DaoTerminalProps) {
  const isProp881Resolved = resolvedProposals.includes("prop-881");
  const isProp882Resolved = resolvedProposals.includes("prop-882");
  const isProp883Resolved = resolvedProposals.includes("prop-883");
  const [proposalInput, setProposalInput] = useState("");
  const [proposalType, setProposalType] = useState<"SIGNAL" | "TREASURY" | "PENALTY">("SIGNAL");

  const handleApproveProp881 = async () => {
    if (isProp881Resolved) return;
    try {
      if (payInvoice) await payInvoice("lnbcrt100n1placeholderinvoice99999");
    } catch (err) {
      console.warn("WebLN Payment failed or aborted", err);
    }
    if (onMintUSDG) {
      onMintUSDG("prop-881");
    }
  };

  const handleApproveProp882 = async () => {
    if (isProp882Resolved) return;
    try {
      if (payInvoice) await payInvoice("lnbcrt100n1placeholderinvoice99999");
    } catch (err) {
      console.warn("WebLN Payment failed or aborted", err);
    }
    if (onBurnNode) {
      onBurnNode("prop-882", 20); // Slashing 20 USDG
    }
  };

  const handleApproveProp883 = async () => {
    if (isProp883Resolved) return;
    try {
      if (payInvoice) await payInvoice("lnbcrt100n1placeholderinvoice99999");
    } catch (err) {
      console.warn("WebLN Payment failed or aborted", err);
    }
    if (onSpendTreasury) {
      onSpendTreasury("prop-883");
    }
  };

  const handleDeployProposal = async () => {
    if (!proposalInput.trim()) return;
    if (usdgBalance < 20) {
      alert("[ ERROR: INSUFFICIENT FUNDS. 20 USDG REQUIRED TO PREVENT NETWORK SPAM. ]");
      return;
    }
    try {
      if (payInvoice) await payInvoice("lnbcrt100n1placeholderinvoice99999");
    } catch (err) {
      console.warn("WebLN Payment failed or aborted", err);
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

      {/* Network Treasury & Engine Metrics */}
      <div className="w-full bg-zinc-950 border-2 border-amber-500/50 p-4 mb-6 text-center font-mono shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase mb-1">
          Network Treasury
        </div>
        <div className="text-xl font-black text-amber-400 mb-4">
          ⚡ {daoTreasurySats.toLocaleString()} SATS
        </div>
        
        {/* Tokenomics Engine Sub-Panel */}
        <div className="border-t border-amber-500/20 pt-3 flex flex-col gap-2 text-left">
           <div className="text-[10px] text-zinc-500 tracking-widest uppercase text-center mb-1">Engine Metrics</div>
           <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
             <span className="text-zinc-400">Total Supply:</span>
             <span className="text-amber-500">{totalSupply.toFixed(2)} / 21M USDG</span>
           </div>
           <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
             <span className="text-zinc-400">Halving Clock:</span>
             <span className="text-cyan-400">{halvingClock} / 10K Epoch</span>
           </div>
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
          <div className="flex justify-between gap-2 text-[10px] font-bold tracking-widest uppercase">
            <button 
              onClick={() => setProposalType('SIGNAL')}
              className={`flex-1 py-2 border border-cyan-400/30 transition-colors ${proposalType === 'SIGNAL' ? 'bg-cyan-400 text-black' : 'text-cyan-400 hover:bg-cyan-400/10'}`}
            >
              SIGNAL
            </button>
            <button 
              onClick={() => setProposalType('TREASURY')}
              className={`flex-1 py-2 border border-cyan-400/30 transition-colors ${proposalType === 'TREASURY' ? 'bg-cyan-400 text-black' : 'text-cyan-400 hover:bg-cyan-400/10'}`}
            >
              TREASURY
            </button>
            <button 
              onClick={() => setProposalType('PENALTY')}
              className={`flex-1 py-2 border border-cyan-400/30 transition-colors ${proposalType === 'PENALTY' ? 'bg-cyan-400 text-black' : 'text-cyan-400 hover:bg-cyan-400/10'}`}
            >
              PENALTY
            </button>
          </div>

          <div className={`text-center text-[10px] font-bold tracking-widest uppercase py-1 border-t border-b border-zinc-800 ${proposalType === 'SIGNAL' ? 'text-cyan-400' : 'text-amber-500'}`}>
            {proposalType === 'SIGNAL' ? 'Required Network Consensus: 51.0% (Soft Fork)' : 'Required Network Consensus: 66.6% (Hard Fork)'}
          </div>

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
            [ + DEPLOY PROPOSAL (-20 USDG STAKE / 500 TSATS) ]
          </button>
          <div className="text-[8px] text-zinc-500 text-center uppercase tracking-widest">
            *Warning: Rejected proposals will result in 100% slashing of the 20 USDG stake to the Network Treasury.*
          </div>
        </div>
      </div>

       <div className="w-full space-y-6">
        {dynamicProposals.map((prop, idx) => {
          const isResolved = resolvedProposals.includes(prop.id);
          const timeLockDays = Math.floor(prop.timeLock / (1000 * 60 * 60 * 24));
          return (
            <div key={prop.id} className="w-full bg-black border-2 border-[#39FF14]/30 p-4 relative group text-left shadow-[0_0_20px_rgba(57,255,20,0.1)]">
               <div className="flex justify-between items-center mb-2">
                 <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">DYNAMIC-{prop.id.substring(0,6)}</div>
                 {!isResolved ? (
                   <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 uppercase tracking-wider">Active</div>
                 ) : (
                   <div className="text-[10px] text-[#39FF14] font-bold bg-[#39FF14]/10 px-2 py-0.5 uppercase tracking-wider">Resolved - MINTED</div>
                 )}
               </div>
               
               <div className="text-sm text-white font-bold tracking-wide uppercase mb-3">
                 {prop.title}
               </div>

               {prop.createdAt && (
                 <div className="text-[10px] text-cyan-400 font-mono tracking-widest mb-3 uppercase">
                   [ TIMESTAMP: {formatCypherpunkDate(prop.createdAt)} ]
                 </div>
               )}
               
               <div className="flex flex-col gap-1 mb-4 text-xs font-mono text-[#39FF14]/70 bg-[#39FF14]/5 p-2 border border-[#39FF14]/10">
                 <div className="truncate"><span className="text-zinc-500">TARGET:</span> {prop.target}</div>
                 <div><span className="text-zinc-500">AI CONF.:</span> {(prop.confidence * 100).toFixed(1)}%</div>
                 <div><span className="text-zinc-500">MINT ALG:</span> ALGORITHMIC REWARD</div>
               </div>
               
               {!isResolved ? (
                 <div className="flex flex-col gap-4">
                   <div className="w-full bg-cyan-400/5 border border-cyan-400/20 py-2 text-center">
                     <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                       [ TIME REMAINING: {timeLockDays} Days 0 Hrs (Block Height +{timeLockDays * 144}) ]
                     </div>
                   </div>
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
                       onClick={async () => {
                         try {
                           if (payInvoice) await payInvoice("lnbcrt100n1placeholderinvoice99999");
                         } catch (err) {}
                         onMintUSDG?.(prop.id);
                       }}
                       className="w-full border-2 border-[#39FF14]/50 text-[#39FF14] font-black text-[10px] tracking-widest py-3 hover:bg-[#39FF14] hover:text-black transition-colors uppercase"
                     >
                       APPROVE (STAKE 5 USDG / 100 TSATS)
                     </button>
                     <button className="w-full border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-3 hover:bg-red-500 hover:text-black transition-colors uppercase">
                       REJECT (STAKE 5 USDG / 100 TSATS)
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
          );
        })}
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

           <div className="text-[10px] text-cyan-400 font-mono tracking-widest mb-3 uppercase">
             [ TIMESTAMP: {formatCypherpunkDate(Date.now() - 86400000)} ]
           </div>
           
           <div className="flex flex-col gap-1 mb-4 text-xs font-mono text-[#39FF14]/70 bg-[#39FF14]/5 p-2 border border-[#39FF14]/10">
             <div><span className="text-zinc-500">TARGET:</span> DALBERGIA LATIFOLIA (INDIAN ROSEWOOD)</div>
             <div><span className="text-zinc-500">AI CONF.:</span> 92.5%</div>
             <div className="truncate"><span className="text-zinc-500">PROOF:</span> NOTE1XYZ89A7B6C5D4E3F2G1H...</div>
             <div><span className="text-zinc-500">MINT ALG:</span> BASE(10) * SPECIES(5.0) = 50 USDG</div>
           </div>
           
           {!isProp881Resolved ? (
             <div className="flex flex-col gap-4">
               <div className="w-full bg-cyan-400/5 border border-cyan-400/20 py-2 text-center">
                 <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                   [ TIME REMAINING: 6 Days 14 Hrs (Block Height +824) ]
                 </div>
               </div>
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
                   APPROVE (STAKE 5 USDG / 100 TSATS)
                 </button>
                 <button className="w-full border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-3 hover:bg-red-500 hover:text-black transition-colors uppercase">
                   REJECT (STAKE 5 USDG / 100 TSATS)
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

        {/* Proposal 2 (Penalty / Slashing / Burn) */}
        <div className="w-full bg-black border-2 border-red-500/30 p-4 relative group text-left shadow-[0_0_20px_rgba(239,68,68,0.1)]">
           <div className="flex justify-between items-center mb-2">
             <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Prop-882</div>
             {!isProp882Resolved ? (
               <div className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 uppercase tracking-wider">Active</div>
             ) : (
               <div className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 uppercase tracking-wider">Resolved - SLASHED</div>
             )}
           </div>
           
           <div className="text-sm text-white font-bold tracking-wide uppercase mb-3">
             <span className="text-red-500">[ PENALTY ]</span> Slash Malicious Node #431
           </div>

           <div className="text-[10px] text-cyan-400 font-mono tracking-widest mb-3 uppercase">
             [ TIMESTAMP: {formatCypherpunkDate(Date.now() - 172800000)} ]
           </div>

           <div className="flex flex-col gap-1 mb-4 text-xs font-mono text-red-500/70 bg-red-500/5 p-2 border border-red-500/10">
             <div><span className="text-zinc-500">TARGET:</span> npub1spoof...</div>
             <div><span className="text-zinc-500">OFFENSE:</span> Falsified Drone Telemetry</div>
             <div><span className="text-zinc-500">BURN ALG:</span> 100% SLASH STAKE (20 USDG)</div>
             <div><span className="text-zinc-500">TOTAL SUPPLY IMPACT:</span> -20 USDG</div>
           </div>
           
           {!isProp882Resolved ? (
             <div className="flex flex-col gap-4">
               <div className="w-full bg-red-500/5 border border-red-500/20 py-2 text-center">
                 <div className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-widest">
                   [ TIME REMAINING: 5 Days 2 Hrs (Block Height +640) ]
                 </div>
               </div>
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
                   onClick={handleApproveProp882}
                   className="w-full border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-3 hover:bg-red-500 hover:text-black transition-colors uppercase"
                 >
                   APPROVE SLASHING
                 </button>
                 <button className="w-full border-2 border-zinc-500/50 text-zinc-500 font-black text-[10px] tracking-widest py-3 hover:bg-zinc-500 hover:text-black transition-colors uppercase">
                   REJECT SLASHING
                 </button>
               </div>
             </div>
           ) : (
             <div className="w-full border-2 border-zinc-800 text-zinc-500 font-black text-[10px] tracking-widest py-2 uppercase text-center cursor-not-allowed">
               PROPOSAL CLOSED
             </div>
           )}
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

           <div className="text-[10px] text-cyan-400 font-mono tracking-widest mb-3 uppercase">
             [ TIMESTAMP: {formatCypherpunkDate(Date.now() - 259200000)} ]
           </div>

           <div className="flex flex-col gap-1 mb-4 text-xs font-mono text-amber-500/70 bg-amber-500/5 p-2 border border-amber-500/10">
             <div><span className="text-zinc-500">REQUEST:</span> 500 SATS</div>
             <div><span className="text-zinc-500">RECIPIENT:</span> npub1relay...</div>
             <div><span className="text-zinc-500">PURPOSE:</span> Server expansion for SEA region.</div>
           </div>
           
           {!isProp883Resolved ? (
             <div className="flex flex-col gap-4">
               <div className="w-full bg-amber-500/5 border border-amber-500/20 py-2 text-center">
                 <div className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest">
                   [ TIME REMAINING: 18 Hrs 12 Mins (Block Height +24) ]
                 </div>
               </div>
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
                   onClick={handleApproveProp883}
                   className="w-full border-2 border-[#39FF14]/50 text-[#39FF14] font-black text-[10px] tracking-widest py-3 hover:bg-[#39FF14] hover:text-black transition-colors uppercase"
                 >
                   APPROVE (STAKE 5 USDG / 100 TSATS)
                 </button>
                 <button className="w-full border-2 border-red-500/50 text-red-500 font-black text-[10px] tracking-widest py-3 hover:bg-red-500 hover:text-black transition-colors uppercase">
                   REJECT (STAKE 5 USDG / 100 TSATS)
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
