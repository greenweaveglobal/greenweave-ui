import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const USDGTab = memo\(\(\) => \{[\s\S]*?\/\/\s*─── STORAGE INFO/m;

const replacement = `const USDGTab = memo(() => {
  const {state,dispatch} = useStore();
  const font = SF(state.lang);
  
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0); 
  const [merkle, setMerkle] = useState("");
  const [mimosa, setMimosa] = useState({state:"", fee:0});

  const collateral = Number(amount) || 0;
  const treasury = (collateral * 0.02).toFixed(2);

  const startEngine = () => {
    if(!collateral || collateral <= 0) return;
    setStep(1);
    setTimeout(() => {
      setMerkle("nostr:merkleroot" + Math.random().toString(36).slice(2, 10));
      const isExpanding = Math.random() > 0.3;
      setMimosa({
        state: isExpanding ? "Expanding (Leaves Open)" : "Contracting (Leaves Closed)",
        fee: isExpanding ? 850 : 3400
      });
      setStep(2);
    }, 1800);
  };

  const crystallize = () => {
    if (step !== 2) return;
    setStep(3);
    setTimeout(() => {
      dispatch({type:"MINT_USDG", amount:collateral, carbon:collateral/1000});
      setStep(4);
    }, 2500);
  };

  const reset = () => {
    setStep(0); setAmount(""); setMerkle("");
  };

  return (
    <div style={{fontFamily:font}}>
      <Card className="mb-6" style={{background:"#0a0a0a", borderColor:C.line, padding:"32px 24px"}}>
        <p style={{fontFamily:DF,fontSize:22,color:C.dew,letterSpacing:4,lineHeight:1,marginBottom:28}} className="text-center font-style:italic">
          USDG MINTING ENGINE
        </p>

        {step === 0 && (
          <div className="flex flex-col gap-6 u1">
            <div className="text-center border-b pb-6" style={{borderColor:C.line}}>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{color:C.mist}}>Phase 1: The Influx</p>
              <p className="text-[10px] leading-relaxed" style={{color:"#8c8c8c"}}>Deposit equivalent USDT or Fiat to initiate the Proof of Nature cycle.</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest mb-2 px-1" style={{color:C.usdg}}>Desired USDG Amount</p>
              <div className="flex items-center border rounded-sm" style={{borderColor:C.line, background:"#050505"}}>
                <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="0.00"
                  className="flex-1 p-3.5 text-sm bg-transparent outline-none" style={{color:C.dew,fontFamily:"inherit"}}/>
                <div className="px-4 text-[10px] uppercase tracking-widest font-bold" style={{color:"#8c8c8c"}}>USDG</div>
              </div>
              <p className="text-[9px] mt-2.5 text-right px-1" style={{color:"#8c8c8c"}}>Collateral Required: <span style={{color:C.dew}}>{collateral.toFixed(2)} USDT</span></p>
            </div>
            <Btn onClick={startEngine} full disabled={!collateral}>Initialize Verification</Btn>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col items-center py-12 u1 text-center">
            <span style={{fontSize:32, color:C.leaf, marginBottom:20, animation:"breathe 2s ease-in-out infinite"}}>⧫</span>
            <p className="text-[10px] tracking-widest uppercase mb-2" style={{color:C.mist}}>Phase 2: Biomass Verification</p>
            <p className="text-[10px]" style={{color:"#8c8c8c"}}>Scanning decentralized ledgers for ecological proof...</p>
          </div>
        )}

        {step >= 2 && step <= 3 && (
          <div className="flex flex-col gap-6 u1">
            <div className="border border-dashed p-5 rounded-sm" style={{borderColor:C.line, background:"rgba(255,255,255,0.02)"}}>
              <p className="text-[9px] tracking-widest uppercase mb-2" style={{color:C.mist}}>Proof of Nature Hash</p>
              <p className="text-xs font-mono break-all" style={{color:C.usdg}}>{merkle}</p>
              <p className="text-[8px] mt-1.5 uppercase" style={{color:"#8c8c8c"}}>Verified via IPFS/Nostr network</p>
            </div>
            
            <div className="border border-solid p-5 rounded-sm" style={{borderColor:C.line, background:"#050505"}}>
              <p className="text-[9px] tracking-widest uppercase mb-4 text-center" style={{color:C.amber}}>The Mimosa Mechanism</p>
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px]" style={{color:"#8c8c8c"}}>Ecosystem State</p>
                <p className="text-[10px]" style={{color:C.dew}}>{mimosa.state}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px]" style={{color:"#8c8c8c"}}>Dynamic Sats Fee</p>
                <p className="text-[10px] font-mono" style={{color:C.amber}}>{mimosa.fee} SATS</p>
              </div>
            </div>

            <div className="text-center py-2">
               <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{color:C.mist}}>Treasury Allocation</p>
               <p className="text-[10px]" style={{color:"#8c8c8c"}}><span style={{color:C.usdg}}>{treasury} USDG</span> (2%) routed to Green Weave DAO</p>
            </div>

            {step === 2 && (
              <Btn onClick={crystallize} full color={C.usdg}>Crystallize & Mint</Btn>
            )}
            
            {step === 3 && (
              <div className="text-center mt-2 py-2">
                <p className="text-[10px] tracking-widest uppercase" style={{color:C.mist, animation:"breathe 1.5s ease-in-out infinite"}}>Anchoring to Bitcoin RGB...</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center py-8 u1 text-center">
            <div className="w-14 h-14 rounded-sm border flex items-center justify-center mb-5" style={{borderColor:C.usdg}}>
              <span style={{fontSize:24, color:C.usdg}}>✓</span>
            </div>
            <p className="text-[12px] tracking-widest uppercase mb-2" style={{color:C.dew}}>Covenant Sealed</p>
            <p className="text-[10px] mb-8" style={{color:"#8c8c8c"}}>Successfully minted <span style={{color:C.usdg}}>{collateral} USDG</span>.</p>
            
            <div className="w-full border-t pt-5 mb-5" style={{borderColor:C.line}}>
               <div className="flex justify-between mb-2"><span className="text-[9px]" style={{color:"#8c8c8c"}}>RGB Contract Updates</span><span className="text-[9px] font-mono" style={{color:C.leaf}}>Confirmed</span></div>
               <div className="flex justify-between"><span className="text-[9px]" style={{color:"#8c8c8c"}}>DAO Treasury Funded</span><span className="text-[9px] font-mono" style={{color:C.usdg}}>{treasury} USDG</span></div>
            </div>

            <Btn onClick={reset} full color={C.dew}>Return</Btn>
          </div>
        )}

        <div className="mt-8 pt-6 border-t text-center" style={{borderColor:C.line}}>
          <p className="text-[8px] uppercase tracking-widest" style={{color:"rgba(255,255,255,0.3)"}}>
            Node 008: Dynamic equilibrium is the heartbeat that allows the ecosystem to self-adjust.
          </p>
        </div>
      </Card>
      
      {/* Balances below the engine */}
      {state.wallet&&(
        <div className="flex gap-3">
          <div className="flex-1 border rounded-sm p-5 text-center" style={{borderColor:C.line, background:C.ghost}}>
            <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{color:C.mist}}>Your USDG</p>
            <p style={{fontFamily:DF,fontSize:24,color:C.usdg}}>{state.wallet.usdg||0}</p>
          </div>
          <div className="flex-1 border rounded-sm p-5 text-center" style={{borderColor:C.line, background:C.ghost}}>
            <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{color:C.mist}}>Est. Impact</p>
            <p style={{fontFamily:DF,fontSize:24,color:C.leaf}}>{(state.wallet.usdg/1000).toFixed(3)}t <span className="text-[10px]">CO₂</span></p>
          </div>
        </div>
      )}
    </div>
  );
});
// ─── STORAGE INFO`;

if(!regex.test(content)) {
  console.log("Regex didn't match.");
} else {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Updated USDGMintingEngine");
}
