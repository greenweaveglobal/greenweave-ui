import { useState } from "react";

export const GENESIS_MANIFESTO = `
====================================================================
              GREENWEAVE PROTOCOL - GENESIS MANIFESTO v1.0.0
====================================================================

[ SECTION 01: THE FAIR LAUNCH DOCTRINE ]
--------------------------------------------------------------------
1.1 ZERO PRE-MINE: 
Total supply of 21,000,000 USDG is cryptographically locked inside 
the DAO Treasury UTXO at Genesis. No team, advisor, or VC allocations.

1.2 PROOF-OF-BIOMASS IS ABSOLUTE: 
The only vector to mint USDG into circulation is via physical on-chain 
biomass validation. This rule applies to everyone, including the Architect.

1.3 GENESIS NODE (NODE 0) PRINCIPLE: 
In the initial epochs, the Architect operates as Node 0 to bootstrap 
network liquidity. All USDG rewards mined via actual biometric validation 
during this phase belong strictly to Node 0 as early adopter risk reward.

[ SECTION 02: CRYPTOGRAPHIC PARAMETERS ]
--------------------------------------------------------------------
- ASSET TICKER : USDG
- ASSET NAME   : GreenWeave Dollar
- TOTAL SUPPLY : 21,000,000.00000000 (21M Base Units with 8 Decimals)
- LAYER 2 CORE : RGB Protocol (Client-Side Validation)
- GENESIS ID   : rgb:5UQmHEzz-yutdi3a-9KTHgD5-S6Lut5A-0M9DaPQ-X~PHblA
- NETWORK      : Bitcoin Testnet / Signet (Mainnet Ready)

[ SECTION 03: VALUE-FOR-VALUE ROUTING ]
--------------------------------------------------------------------
3.1 PROTOCOL FEES:
To maintain the automated backend infrastructure, a fixed 0.5% routing 
fee is enforced on all P2P Market Atomic Swaps, directed to the 
Architect's developer vault.

3.2 NOSTR ZAP PROTOCOL:
Community support operates under NIP-57. Interaction is a mutual 
exchange of ecological understanding and sovereign happiness.
====================================================================
`;

export default function TerminalDocs() {
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([GENESIS_MANIFESTO.trim()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "GENESIS_MANIFESTO.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl px-6 text-center animate-in fade-in duration-500 h-full overflow-y-auto pb-32 scrollbar-none">
      <h1 className="text-2xl font-black tracking-[0.25em] mb-2 text-[#10B981] uppercase w-full border-b-2 border-[#10B981]/30 pb-4">
        PROTOCOL <span className="text-zinc-500 font-light">WHITEPAPER</span>
      </h1>
      <div className="text-[10px] tracking-[0.4em] font-bold mb-6 text-[#10B981]/80 uppercase">
        Verifiable Absolute Truth
      </div>
      
      <div className="w-full text-left bg-black border border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] mb-8 p-1">
        <pre className="font-mono text-[#10B981] bg-black p-4 whitespace-pre-wrap leading-relaxed text-[10px] sm:text-xs overflow-x-auto scrollbar-none">
          {GENESIS_MANIFESTO.trim()}
        </pre>
      </div>

      <button 
        onClick={handleDownload}
        className="w-full border-2 border-zinc-700 text-[#10B981] font-black text-[12px] tracking-widest py-4 hover:bg-zinc-800 transition-colors uppercase bg-black"
      >
        [ DOWNLOAD RAW MANIFESTO ]
      </button>
    </div>
  );
}
