import { useState, useCallback, useMemo, useReducer, memo, createContext, useContext, useEffect } from "react";
import { Copy, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import { GENESIS_NODES } from "./lib/data/genesisNodes";
import { useNostr } from "./hooks/useNostr";
import { useLightning } from "./hooks/useLightning";

// ─── FONTS ────────────────────────────────────────────────────
(() => {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+JP:wght@400;700&family=Cormorant+Garamond:ital,wght@0,600;1,400&display=swap";
  document.head.appendChild(l);
})();

const DF = "'Cormorant Garamond',Georgia,serif";
const SF = (lang) => lang === "ja" ? "'Noto Sans JP',sans-serif" : "var(--font-sans)";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const C = {
  bg:      "#050505",
  leaf:    "#d4af37",
  mist:    "#e0e0e0",
  dew:     "#ffffff",
  amber:   "#b8962f",
  sky:     "#8c6d1f",
  red:     "#f43f5e",
  violet:  "#a68a32",
  usdg:    "#10b981",
  line:    "rgba(255,255,255,0.08)",
  ghost:   "#0a0a0a",
  glow:    "rgba(212,175,55,0.08)",
  gold:    "#d4af37",
  clay:    "#8c6d1f",
};

// ─── STORE ────────────────────────────────────────────────────
const Ctx = createContext(null);

const INIT = {
  lang: "en",
  wallet: null,
  // Posts with moderation state
  posts: [
    { id:"p1", author:"Minh · Sai Gon", tier:"thread", time:"1h ago",
      content:"Basil on my 12th floor balcony. Every morning watering it makes the day feel worthwhile 🌿",
      tags:["balcony","saigon","herbs"], likes:34, img:"🌿",
      reports:0, burned:false, storage:"nostr", txHash:"Ar7x..." },
    { id:"p2", author:"Lan · Ha Noi", tier:"garden", time:"3h ago",
      content:"📍 West Lake Garden node: 0.5ha ready. Planting medicinal herbs. Open for stays from next month!",
      tags:["hanoi","node","stays"], likes:67, img:"🏡", node:"West Lake Garden",
      reports:0, burned:false, storage:"nostr", txHash:"Ar8y..." },
    { id:"p3", author:"Hoa · Binh Phuoc", tier:"thread", time:"1d ago",
      content:"Apricot tree — bricks + floor dust + leftover Tet soil. Don't stop it from living 🌱",
      tags:["binhphuoc","apricot","fukuoka"], likes:128, img:"🌸",
      reports:0, burned:false, storage:"rgb", txHash:"Sh3z..." },
    { id:"p4", author:"James · Tokyo", tier:"thread", time:"2d ago",
      content:"Desk ficus, 3 years. Survived 2 office moves. Slow growth is still growth 🌳",
      tags:["tokyo","deskplant"], likes:89, img:"🌳",
      reports:0, burned:false, storage:"ipfs", txHash:"Qm5k..." },
  ],
  likedPosts:   {},
  reportedPosts:{},  // { postId: true } — user already reported
  mintedNFTs:   [],
  // Marketplace listings
  listings: [
    { id:"l1", nftId:"thread_042", name:"Cherry Blossom Bonsai", owner:"Sakura · Kyoto",
      price:0.5, currency:"SOL", votes:89, rank:1, img:"🌸", tier:"thread",
      story:"10 year old bonsai, trained by hand every season" },
    { id:"l2", nftId:"garden_007", name:"West Lake Herb Garden", owner:"Lan · Ha Noi",
      price:2.1, currency:"SOL", votes:67, rank:2, img:"🏡", tier:"garden",
      story:"0.5ha organic garden, 30+ medicinal herbs, open for stays" },
    { id:"l3", nftId:"thread_188", name:"Desert Rose Survivor", owner:"Omar · Dubai",
      price:0.3, currency:"SOL", votes:54, rank:3, img:"🌹", tier:"thread",
      story:"Survived 50°C summers on a rooftop. Pure resilience." },
  ],
  // Garden stays
  stays: [
    { id:"s1", nodeId:"n2", name:"West Lake Garden Stay",
      city:"Ha Noi", owner:"Lan", rating:4.9, reviews:12,
      price:35, currency:"USDG",
      perks:["Organic breakfast","Herb walking tour","Morning meditation"],
      available:true, img:"🏡" },
    { id:"s2", nodeId:"n3", name:"Binh Phuoc Forest Cabin",
      city:"Binh Phuoc", owner:"Hoa", rating:5.0, reviews:3,
      price:25, currency:"USDG",
      perks:["Off-grid experience","Forest trekking","Fukuoka farming intro"],
      available:true, img:"🌲" },
  ],
  // DAO proposals — content moderation
  moderationQueue: [
    { id:"m1", postId:"p_spam", postPreview:"[SPAM] Buy crypto now!!!",
      reporter:"Community", reportReason:"spam",
      yesVotes:18, noVotes:2, total:60, threshold:0.6,
      status:"voting", deadline: Date.now() + 86400000 },
  ],
  // USDG balances and carbon
  usdgBalance: 0,
  carbonCredits: 0,       // tons CO2
  carbonReserve: 142.5,   // protocol total tons backing USDG
  usdgSupply: 142500,     // total USDG minted (1 USDG = 0.001 ton = $1)
  nodes: [
    { id:"n1", name:"West Lake Garden",   owner:"Lan",  city:"Ha Noi",     ha:0.5, status:"active",   members:12, carbonPerYear:2.5, stayEnabled:true  },
    { id:"n2", name:"Binh Thanh Rooftop", owner:"Tuan", city:"Sai Gon",    ha:0.1, status:"active",   members:8,  carbonPerYear:0.4, stayEnabled:false },
    { id:"n3", name:"Binh Phuoc Forest",  owner:"Hoa",  city:"Binh Phuoc", ha:5,   status:"building", members:3,  carbonPerYear:12,  stayEnabled:true  },
    { id:"n4", name:"Osaka Bamboo Grove", owner:"Yuki", city:"Osaka",      ha:0.05,status:"active",   members:5,  carbonPerYear:0.8, stayEnabled:false },
  ],
  explorerNodes: GENESIS_NODES
};

function reducer(s, a) {
  switch(a.type) {
    case "SET_LANG":      return {...s, lang:a.payload};
    case "CONNECT":       return {...s, wallet:a.payload};
    case "DISCONNECT":    return {...s, wallet:null};
    case "LIKE":          return s.likedPosts[a.id] ? s : {
      ...s, likedPosts:{...s.likedPosts,[a.id]:true},
      posts:s.posts.map(p=>p.id===a.id?{...p,likes:p.likes+1}:p)
    };
    case "REPORT_POST":   return s.reportedPosts[a.id] ? s : {
      ...s, reportedPosts:{...s.reportedPosts,[a.id]:true},
      posts:s.posts.map(p=>p.id===a.id?{...p,reports:p.reports+1}:p),
      moderationQueue:[{
        id:`m${Date.now()}`, postId:a.id,
        postPreview:a.preview?.substring(0,60)+"...",
        reporter:"You", reportReason:a.reason,
        yesVotes:1, noVotes:0, total:60, threshold:0.6,
        status:"voting", deadline:Date.now()+86400000
      },...s.moderationQueue]
    };
    case "BURN_POST":     return {
      ...s, posts:s.posts.map(p=>p.id===a.id?{...p,burned:true}:p),
      moderationQueue:s.moderationQueue.map(m=>m.postId===a.id?{...m,status:"burned"}:m)
    };
    case "VOTE_MODERATION": {
      const queue = s.moderationQueue.map(m => {
        if(m.id!==a.id) return m;
        const updated = {...m, [a.choice==="yes"?"yesVotes":"noVotes"]: m[a.choice==="yes"?"yesVotes":"noVotes"]+1};
        const ratio = updated.yesVotes/(updated.yesVotes+updated.noVotes);
        if(ratio >= updated.threshold) return {...updated, status:"passed"};
        return updated;
      });
      const passed = queue.find(m=>m.id===a.id&&m.status==="passed");
      return {
        ...s, moderationQueue:queue,
        posts:passed ? s.posts.map(p=>p.id===passed.postId?{...p,burned:true}:p) : s.posts
      };
    }
    case "ADD_POST":      return {...s, posts:[a.payload,...s.posts]};
    case "MINT":          return {...s, mintedNFTs:[...s.mintedNFTs,a.payload]};
    case "MINT_USDG":     return {
      ...s,
      wallet: s.wallet ? { ...s.wallet, usdg: s.wallet.usdg + a.amount, carbon: s.wallet.carbon - a.carbon } : null
    };
    case "BOOK_STAY":     return {
      ...s,
      wallet: s.wallet ? { ...s.wallet, usdg: s.wallet.usdg - a.price } : null
    };
    case "EARN_USDG":     return {
      ...s,
      wallet: s.wallet ? { ...s.wallet, usdg: s.wallet.usdg + a.amount, carbon: s.wallet.carbon + a.carbon } : null
    };
    default: return s;
  }
}

function Store({children}) {
  const [state, dispatch] = useReducer(reducer, INIT);
  return <Ctx.Provider value={{state,dispatch}}>{children}</Ctx.Provider>;
}
const useStore = () => useContext(Ctx);

// ─── ATOMS ────────────────────────────────────────────────────
const Pill = memo(({color, children, sm}) => (
  <span className={`inline-flex items-center rounded-none border ${sm?"px-1.5 py-0.5 text-[8px]":"px-2 py-1 text-[9px]"}`}
    style={{color, background:color+"08", borderColor:color+"40", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600}}>{children}</span>
));

const Card = memo(({children, className="", style={}}) => (
  <div className={`rounded-none border p-5 ${className}`}
    style={{background:"#0a0a0a", borderColor:"#1a1a1a", ...style}}>{children}</div>
));

const Btn = memo(({children, onClick, color=C.leaf, full, disabled, sm, danger}) => (
  <button onClick={disabled?undefined:onClick}
    className={`${full?"w-full":""} ${sm?"px-3 py-1.5 text-[9px]":"px-6 py-3 text-[11px]"} rounded-none font-bold tracking-widest uppercase transition-all active:translate-y-px`}
    style={{
      background: danger?"rgba(244,63,94,0.1)":disabled?"rgba(255,255,255,0.02)":color,
      color: danger?C.red:disabled?"rgba(255,255,255,0.3)":"#000",
      border: danger?`1px solid rgba(244,63,94,0.5)`:disabled?"1px solid rgba(255,255,255,0.1)":`1px solid ${color}`,
      fontFamily:"inherit", cursor:disabled?"default":"pointer",
    }}>{children}</button>
));

const StorageBadge = memo(({type}) => {
  const map = {
    nostr:{c:C.violet,l:"Nostr ⚡"},
    ipfs:   {c:C.sky,l:"IPFS"},
    rgb: {c:C.leaf,l:"RGB State"},
  };
  const m = map[type]||map.ipfs;
  return <Pill color={m.c} sm>⛓ {m.l}</Pill>;
});

const LangSwitcher = memo(() => {
  const {state,dispatch} = useStore();
  return (
    <div className="flex gap-1">
      {["vi","en","ja"].map(l=>(
        <button key={l} onClick={()=>dispatch({type:"SET_LANG",payload:l})}
          className="px-2 py-0.5 rounded-none text-[9px] border cursor-pointer"
          style={{background:state.lang===l?"rgba(212,175,55,0.18)":"transparent",
            borderColor:state.lang===l?"rgba(212,175,55,0.45)":"rgba(255,255,255,0.1)",
            color:state.lang===l?C.dew:"#8c8c8c",fontFamily:"inherit"}}>
          {{"vi":"🇻🇳","en":"🌍","ja":"🇯🇵"}[l]}
        </button>
      ))}
    </div>
  );
});

// ─── CONNECT GATE ─────────────────────────────────────────────
const ConnectGate = memo(({onConnect}) => {
  const {state} = useStore();
  const font = SF(state.lang);
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [pubkey, setPubkey] = useState("");
  const [npub, setNpub] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [storagePref, setStoragePref] = useState("nostr");

  const taglines = {
    vi:["Mỗi cái cây,","một sợi chỉ xanh.","Cùng nhau, chúng ta dệt lại Trái Đất."],
    en:["Every tree,","one green thread.","Together, we weave the Earth back."],
    ja:["1本の木、","1本の緑の糸。","共に、地球を織り直す。"],
  }[state.lang];

  const connectNostr = async (forceDemo = false) => {
    setError("");
    setLoading(true);
    
    if (forceDemo || typeof window.nostr === 'undefined') {
      if (!forceDemo) {
        setError("No Nostr extension found. Please install a signer like Alby or nos2x.");
        setLoading(false);
        return;
      }
      
      // Mock for preview environment
      setTimeout(() => {
        const mockPk = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
        setPubkey(mockPk);
        setNpub(`npub1${mockPk.slice(0, 6)}...${mockPk.slice(-4)}`);
        setStep(2);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const pk = await window.nostr.getPublicKey();
      setPubkey(pk);
      setNpub(`npub1${pk.slice(0, 6)}...${pk.slice(-4)}`);
      setStep(2);
    } catch (err) {
      setError("Connection rejected or failed.");
    } finally {
      setLoading(false);
    }
  };

  const signCovenant = async (forceDemo = false) => {
    setError("");
    setLoading(true);
    
    if (forceDemo || typeof window.nostr === 'undefined') {
       setTimeout(() => {
         setStep(4);
         setLoading(false);
       }, 1200);
       return;
    }

    try {
      const event: any = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["node", nodeName], ["storage", storagePref]],
        content: `I accept the Genesis Covenant.
Node: ${nodeName}`
      };
      await (window as any).nostr.signEvent(event);
      setStep(4);
    } catch (err) {
      setError("Signing failed or rejected.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = () => {
    onConnect({
      address: npub || "demo",
      usdg: 50,
      carbon: 0.05,
      name: nodeName || "Guest Node",
      storagePref: storagePref || "nostr"
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{background:"#050505",fontFamily:font}}>
      <style>{`
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .u1{animation:up .6s ease both} .u2{animation:up .6s .1s ease both}
        .u3{animation:up .6s .2s ease both} .u4{animation:up .6s .3s ease both}
      `}</style>
      
      <div className="w-full max-w-sm">
        {/* Header / Logo */}
        <div className="u1 mb-10">
          <div className="mb-5" style={{fontSize:48,color:C.leaf,animation:"breathe 5s ease-in-out infinite"}}>⧫</div>
          <p style={{fontFamily:DF,fontSize:"clamp(24px,5vw,32px)",color:C.leaf,letterSpacing:4,lineHeight:1,fontStyle:"italic"}}>
            GREEN WEAVE
          </p>
          <p className="text-[9px] uppercase tracking-[4px] mt-3" style={{color:C.mist}}>
            The Rooting Flow
          </p>
        </div>

        {/* STEP 1: Seed Drop */}
        {step === 1 && (
          <div className="u2 flex flex-col gap-4">
            <p style={{fontFamily:DF,fontSize:18,color:C.dew}}>{taglines[0]} {taglines[1]}</p>
            <p className="text-[10px] uppercase tracking-widest mb-4" style={{color:"#8c8c8c"}}>{taglines[2]}</p>
            
            <Btn onClick={() => connectNostr(false)} full>
              {loading ? "Discovering..." : "Connect Identity (NIP-07)"}
            </Btn>
            <button onClick={() => connectNostr(true)}
              className="py-3 rounded-none text-[9px] uppercase tracking-widest transition-colors border mt-1"
              style={{background:"transparent",borderColor:C.line,color:"#595959",fontFamily:"inherit",cursor:"pointer"}}>
              Simulate Connection (Demo)
            </button>
            {error && <p className="text-[10px] mt-2 p-2 rounded-none" style={{color:C.bg, background:C.red}}>{error}</p>}
          </div>
        )}

        {/* STEP 2: Soil Configuration */}
        {step === 2 && (
          <div className="u2 flex flex-col gap-5 text-left">
            <div className="p-4 border rounded-none" style={{borderColor:C.line, background:"#0a0a0a"}}>
               <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{color:C.leaf}}>Connected Seed (Pubkey)</p>
               <p className="text-sm font-mono" style={{color:C.dew}}>{npub}</p>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] uppercase tracking-widest px-1" style={{color:C.mist}}>Node Name</label>
              <input type="text" value={nodeName} onChange={e=>setNodeName(e.target.value)} placeholder="e.g. Saigon Garden"
                className="w-full p-3.5 bg-transparent border outline-none rounded-none text-sm" 
                style={{borderColor:C.line, color:C.dew, fontFamily:"inherit"}} />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] uppercase tracking-widest px-1" style={{color:C.mist}}>Storage Preference</label>
              <select value={storagePref} onChange={e=>setStoragePref(e.target.value)}
                className="w-full p-3.5 bg-[#050505] border outline-none rounded-none text-sm" 
                style={{borderColor:C.line, color:C.dew, fontFamily:"inherit"}}>
                <option value="nostr">Nostr Relays (Ephemeral/Social)</option>
                <option value="rgb">RGB State (Bitcoin L2/L3)</option>
                <option value="ipfs">IPFS (Decentralized File Storage)</option>
              </select>
            </div>

            <div className="mt-4">
              <Btn onClick={() => setStep(3)} full disabled={!nodeName.trim()}>Continue to Covenant</Btn>
            </div>
          </div>
        )}

        {/* STEP 3: Genesis Covenant */}
        {step === 3 && (
          <div className="u2 flex flex-col gap-5 text-left">
            <p className="text-[10px] uppercase tracking-widest text-center" style={{color:C.mist}}>The Genesis Covenant</p>
            
            <div className="p-5 border rounded-none overflow-y-auto text-xs leading-relaxed" 
              style={{borderColor:C.line, background:"#0a0a0a", maxHeight: 180, color:"#a6a6a6"}}>
              <p className="mb-3">I, node operator of <strong style={{color:C.dew}}>{nodeName}</strong>, hereby pledge to participate in the Green Weave Global network.</p>
              <p className="mb-3">1. I acknowledge that ecological value is the foundation of this consensus.</p>
              <p className="mb-3">2. I shall not submit false Biomass data, nor exploit the Proof of Nature mechanism.</p>
              <p>3. I understand that my USDG minting helps fuel real-world reforestation efforts.</p>
            </div>

            <Btn onClick={() => signCovenant(!window.nostr)} full color={C.leaf}>
              {loading ? "Signing..." : "Sign Covenant & Take Root"}
            </Btn>
            {error && <p className="text-[10px] mt-2 text-center" style={{color:C.red}}>{error}</p>}
          </div>
        )}

        {/* STEP 4: Germination */}
        {step === 4 && (
          <div className="u2 flex flex-col items-center gap-6 mt-4">
            <div className="w-16 h-16 rounded-none border flex items-center justify-center" style={{borderColor:C.leaf, background:"rgba(212,175,55,0.08)"}}>
               <span style={{fontSize:28, color:C.leaf}}>⧫</span>
            </div>
            
            <div className="mb-4">
              <p style={{fontFamily:DF, fontSize:22, color:C.dew, marginBottom:12, letterSpacing:2}}>Germination Complete</p>
              <p className="text-xs leading-relaxed" style={{color:"#8c8c8c"}}>
                Your Node <strong style={{color:C.dew}}>{nodeName}</strong> has successfully taken root in the network.
              </p>
            </div>

            <Btn onClick={handleEnter} full>Enter Dashboard</Btn>
          </div>
        )}

      </div>
    </div>
  );
});

// ─── EXPLORER TAB (GENESIS COVENANT) ────────────────────────
const ExplorerTab = memo(() => {
  const {state} = useStore();
  const font = SF(state.lang);
  
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const nodes = useMemo(() => {
    return state.explorerNodes.filter(n => {
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.species.toLowerCase().includes(search.toLowerCase()) ||
                          n.message.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [state.explorerNodes, search]);

  const selectedNode = useMemo(() => 
    state.explorerNodes.find(n => n.id === selectedId)
  , [state.explorerNodes, selectedId]);

  if (selectedId && selectedNode) {
    return <NodeDetailView node={selectedNode} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div style={{fontFamily:font}}>
      {/* Prologue */}
      <Card className="mb-10 border-l-4 !border-l-[#10b981] p-8 u1" style={{background: "#080808", borderColor: "rgba(255,255,255,0.05)"}}>
        <h3 className="text-[10px] uppercase tracking-[4px] font-black mb-6" style={{color: C.usdg}}>
          THE ORIGIN OF CODE: A PHYSICAL WEAVING
        </h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-lg italic leading-relaxed" style={{fontFamily: DF, color: C.dew}}>
              Lập trình không bắt đầu từ những chiếc màn hình. Nó bắt đầu từ thế kỷ 19 với Cỗ máy dệt Jacquard — nơi những tấm thẻ gỗ đục lỗ (0 và 1) ra lệnh cho những sợi tơ dệt nên hoa văn. Việc 'Dệt' (Weaving) chính là hình thức lập trình vật lý đầu tiên của nhân loại.
            </p>
            <p className="text-lg italic leading-relaxed" style={{fontFamily: DF, color: C.dew}}>
              Tại Green Weave Global, chúng tôi tiếp nối di sản đó. Chúng tôi không chỉ viết những dòng mã nhị phân tĩnh lặng trên không gian mạng, chúng tôi đang 'dệt' lại sinh quyển bằng những mầm cây và hệ sợi nấm. Mỗi Node Sinh khối là một sợi tơ, và giao thức mật mã chính là tấm thẻ đục lỗ định hình nên hệ sinh thái.
            </p>
          </div>
          
          <div className="pt-6 border-t font-mono text-[10px] space-y-3 opacity-40 leading-relaxed" style={{borderColor: "rgba(255,255,255,0.05)"}}>
            <p>
              Programming didn't start with screens. It began in the 19th century with the Jacquard Loom, where punched wooden cards (0s and 1s) commanded threads to weave patterns. "Weaving" was humanity's first physical form of coding.
            </p>
            <p>
              At Green Weave Global, we continue this legacy. We aren't just writing silent binary code in cyberspace; we are re-weaving the biosphere with seedlings and mycelium networks. Each Biomass Node is a thread, and cryptographic protocols are the punch cards shaping the ecosystem.
            </p>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search Genesis Covenant by keyword..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-4 bg-transparent border outline-none rounded-none text-sm pl-10"
            style={{borderColor: "rgba(255,255,255,0.1)", color:C.dew, fontFamily:"inherit"}} 
          />
          <span className="absolute left-3 top-3.5 opacity-30 text-xs">🔍</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nodes.map(n => (
          <Card key={n.id} onClick={() => setSelectedId(n.id)} 
            className="cursor-pointer group hover:border-[#10b981] transition-all duration-300 relative overflow-hidden"
            style={{borderColor: "rgba(255,255,255,0.08)", background: "#0a0a0a"}}>
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-none border flex items-center justify-center text-3xl shrink-0"
                style={{background:`rgba(255,255,255,0.03)`, borderColor:`rgba(255,255,255,0.05)`}}>
                {n.img}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest font-mono mb-0.5 opacity-40">NODE {n.id}</p>
                <p className="text-xs font-bold truncate uppercase tracking-tight" style={{color:C.dew}}>{n.species}</p>
                <p className="text-[10px] mt-2 leading-relaxed line-clamp-2" style={{color:"#8c8c8c"}}>{n.message}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{borderColor:"rgba(255,255,255,0.05)"}}>
               <p className="text-[10px] uppercase font-bold tracking-widest" style={{color:C.leaf}}>{n.title.split(' | ')[0]}</p>
               <span className="text-xs transform group-hover:translate-x-1 transition-transform opacity-30 text-[#10b981]">→</span>
            </div>
          </Card>
        ))}
      </div>

      {nodes.length === 0 && (
         <div className="py-20 text-center">
           <p className="text-xs" style={{color:"#595959"}}>No nodes found in the current covenant manual.</p>
         </div>
      )}
    </div>
  );
});

// ─── NOSTR CONNECT MODAL ──────────────────────────────────────
const NostrConnectModal = memo(({isOpen, onClose, onLoginNip07, onLoginPK, onLoginRemote, onLoginReadOnly, onSaveNwc, loading, error}) => {
  const [pk, setPk] = useState("");
  const [bunker, setBunker] = useState("");
  const [pubkey, setPubkey] = useState("");
  const [nwcUri, setNwcUri] = useState("");
  const [mode, setMode] = useState("select"); // select, pk, remote, readonly, nwc

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-neutral-950 border-2 border-neutral-700 p-6 overscroll-contain flex flex-col relative" style={{borderColor:C.line}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-xl opacity-40 hover:opacity-100 z-10">×</button>
        
        <h2 style={{fontFamily:DF, fontSize:24, color:C.leaf, marginBottom:24, letterSpacing:2}}>CONNECT WALLET</h2>

        {mode === "select" && (
          <div className="space-y-3">
            <button onClick={() => setMode("nwc")} 
              className="w-full py-5 border-2 border-green-500 flex flex-col items-center gap-2 bg-green-500/10 hover:bg-green-500/20 transition-all font-black group"
              style={{boxShadow: '0 0 30px rgba(34,197,94,0.15)'}}>
              <span className="text-3xl">⚡️</span>
              <span className="text-[12px] uppercase tracking-[3px]" style={{color:C.leaf}}>MOBILE CONNECT (ZEUS)</span>
              <span className="text-[8px] uppercase tracking-widest opacity-60">1-Click Zaps Enabled</span>
            </button>
            <button onClick={onLoginNip07} 
              className="w-full py-4 border-2 flex flex-col items-center gap-2 hover:bg-white/5 transition-all group"
              style={{borderColor:C.line}}>
              <span className="text-2xl grayscale group-hover:grayscale-0">🧩</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Desktop Extension (NIP-07)</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode("remote")} 
                className="py-3 border flex flex-col items-center gap-1 hover:bg-white/5 transition-colors opacity-60"
                style={{borderColor:C.line}}>
                <span className="text-lg">☁️</span>
                <span className="text-[8px] uppercase tracking-widest font-bold">Bunker</span>
              </button>
              <button onClick={() => setMode("pk")} 
                className="py-3 border flex flex-col items-center gap-1 hover:bg-white/5 transition-colors opacity-60"
                style={{borderColor:C.line}}>
                <span className="text-lg">🔑</span>
                <span className="text-[8px] uppercase tracking-widest font-bold">nsec</span>
              </button>
            </div>
          </div>
        )}

        {mode === "nwc" && (
          <div className="space-y-6">
            <div className="p-4 bg-green-500/5 border-2 border-green-500/30">
               <p className="text-[10px] uppercase tracking-widest mb-4 font-black" style={{color:C.leaf}}>Paste ZEUS (NWC) URI</p>
               <textarea 
                  value={nwcUri} 
                  onChange={e=>setNwcUri(e.target.value)}
                  className="w-full bg-black border-2 p-3 text-[10px] font-mono outline-none min-h-[120px] mb-4" 
                  style={{borderColor:C.line, color:C.leaf}} 
                  placeholder="nostr+walletconnect://..." 
               />
               <p className="text-[8px] uppercase tracking-tighter opacity-70 leading-relaxed">
                  Generate a pairing string in ZEUS settings (NWC) to enable 1-click identity and zaps.
               </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode("select")} className="flex-1 py-4 border-2 border-white/10 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100">Back</button>
              <Btn onClick={() => {
                const res = onSaveNwc(nwcUri);
                if (res.success) {
                  onLoginReadOnly(res.pubkey);
                  onClose();
                }
              }} disabled={loading || !nwcUri}>Establish Pairing</Btn>
            </div>
          </div>
        )}

        {mode === "pk" && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-2 opacity-40 font-bold">Enter Private Key (nsec)</p>
              <div className="p-3 mb-4 bg-red-900/20 border border-red-500/30 text-[9px] uppercase tracking-wider text-red-400 font-bold leading-relaxed">
                ⚠️ WARNING: Never paste your primary nsec into a web app you don't trust. Use a burner account for mobile testing.
              </div>
              <input type="password" value={pk} onChange={e=>setPk(e.target.value)}
                className="w-full bg-black border p-3 text-xs font-mono outline-none" 
                style={{borderColor:C.line, color:C.dew}} placeholder="nsec1..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode("select")} className="flex-1 py-3 border border-white/10 text-[10px] uppercase tracking-widest font-bold opacity-40">Back</button>
              <Btn onClick={() => onLoginPK(pk)} disabled={loading || !pk}>Connect</Btn>
            </div>
          </div>
        )}

        {mode === "readonly" && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-2 opacity-40 font-bold">Enter Public Key (npub)</p>
              <input type="text" value={pubkey} onChange={e=>setPubkey(e.target.value)}
                className="w-full bg-black border p-3 text-xs font-mono outline-none" 
                style={{borderColor:C.line, color:C.dew}} placeholder="npub1..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode("select")} className="flex-1 py-3 border border-white/10 text-[10px] uppercase tracking-widest font-bold opacity-40">Back</button>
              <Btn onClick={() => onLoginReadOnly(pubkey)} disabled={loading || !pubkey}>Connect</Btn>
            </div>
          </div>
        )}

        {mode === "remote" && (
          <div className="space-y-6">
            <div className="p-3 bg-green-500/5 border border-green-500/30">
              <p className="text-[10px] uppercase tracking-widest mb-2 opacity-40 font-bold">Bunker ID (npub or email)</p>
              <input type="text" value={bunker} onChange={e=>setBunker(e.target.value)}
                className="w-full bg-black border p-3 text-xs font-mono outline-none" 
                style={{borderColor:C.line, color:C.dew}} placeholder="user@bunker.com" />
            </div>
            
            <div className="text-center">
              <span className="text-[8px] uppercase tracking-widest opacity-30">or</span>
            </div>

            <div className="text-[9px] uppercase tracking-tight opacity-60 leading-normal px-2">
              Most users should enter their Bunker URI from ZEUS above. The app will then request authorization.
            </div>

            <div className="flex gap-2">
              <button onClick={() => setMode("select")} className="flex-1 py-3 border border-white/10 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">Back</button>
              <Btn onClick={() => onLoginRemote(bunker)} disabled={loading || !bunker}>Start Authorization</Btn>
            </div>
          </div>
        )}

        {loading && <div className="mt-6 text-center text-[10px] uppercase tracking-[4px] animate-pulse" style={{color:C.leaf}}>Initializing Auth...</div>}
        {error && <p className="mt-4 text-[10px] text-red-500 font-bold text-center uppercase tracking-tight">{error}</p>}
      </div>
    </div>
  );
});

// ─── LIGHTNING CONNECT MODAL ──────────────────────────────────
const LightningConnectModal = memo(({isOpen, onClose, onSaveNwc}) => {
  const [uri, setUri] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-neutral-950 border-2 border-neutral-700 p-6 overscroll-contain flex flex-col relative" style={{borderColor:C.line}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-xl opacity-40 hover:opacity-100 z-10">×</button>
        <h2 style={{fontFamily:DF, fontSize:24, color:C.amber, marginBottom:24, letterSpacing:2}}>LIGHTNING SETUP</h2>
        
        <div className="space-y-6">
          <div className="p-3 bg-amber-500/5 border border-amber-500/30">
            <p className="text-[9px] uppercase tracking-wider text-amber-500 font-bold leading-relaxed mb-3">
              ⚡️ Mobile optimized zapping
            </p>
            <p className="text-[10px] uppercase tracking-widest mb-2 opacity-40 font-bold">NWC pairing URI</p>
            <textarea value={uri} onChange={e=>setUri(e.target.value)}
              className="w-full bg-black border p-3 text-[10px] font-mono outline-none min-h-[100px]" 
              style={{borderColor:C.line, color:C.dew}} placeholder="nostr+walletconnect://..." />
            <p className="text-[8px] mt-3 opacity-60 leading-relaxed uppercase font-bold text-amber-200/50">
              Paste your NWC string from Zeus to enable 1-click zaps.
            </p>
          </div>
          <Btn onClick={() => { if(onSaveNwc(uri)) onClose(); else alert("Invalid URI"); }} disabled={!uri}>Enable 1-Click Zaps</Btn>
        </div>
      </div>
    </div>
  );
});

// ─── NODE DETAIL VIEW ─────────────────────────────────────────
const NodeDetailView = memo(({node, onBack}) => {
  const {state} = useStore();
  const font = SF(state.lang);
  const { zap, saveNwc, loading: zapLoading, error: zapError } = useLightning();
  const { fetchComments, postComment, user, loginNip07, loginPrivateKey, loginRemote, loginReadOnly, error: nostrError, loading: nostrLoading } = useNostr();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isLightningOpen, setIsLightningOpen] = useState(false);

  useEffect(() => {
    fetchComments(node.id).then(setComments);
  }, [node.id, fetchComments]);

  const handleZap = async () => {
    // If not logged in at all, open connect modal
    if (!user) {
      setIsConnectOpen(true);
      return;
    }

    const success = await zap(1000, node.id === "0" ? "gwg@getalby.com" : "storage@nostr.com");
    if (success) {
      alert("⚡ ZAP SUCCESSFUL! BIOMASS NODE LOGGED.");
    } else {
      // If zap fails (e.g. no wallet), show setup
      setIsLightningOpen(true);
    }
  };

  const handlePostComment = async () => {
    if (!user) {
       alert("Please connect Nostr to comment");
       return;
    }
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await postComment(node.id, commentText);
      setCommentText("");
      const updated = await fetchComments(node.id);
      setComments(updated);
    } catch (e) {
      alert("Failed to post: " + e.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{fontFamily:font}} className="u1">
      <button onClick={onBack} className="mb-8 text-[10px] uppercase tracking-[3px] opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
        <span>←</span> BACK TO COVENANT EXPLORER
      </button>

      <div className="flex items-start gap-8 mb-12">
        <div className="w-24 h-24 rounded-none border flex items-center justify-center text-5xl shrink-0"
          style={{background:`rgba(255,255,255,0.03)`, borderColor:`rgba(255,255,255,0.1)`}}>
          {node.img}
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[4px] font-mono mb-2" style={{color:C.leaf}}>NODE {node.id}</p>
          <h1 style={{fontFamily:DF, fontSize:32, color:C.dew, lineHeight:1.1, marginBottom:16}}>{node.title}</h1>
          <div className="flex gap-2">
            <Pill color={C.usdg}>{node.species}</Pill>
            <button onClick={handleZap} disabled={zapLoading}
              className="px-3 py-1 text-[9px] uppercase tracking-widest font-bold border rounded-none transition-all active:scale-95"
              style={{background:`${C.amber}20`, borderColor:C.amber, color:C.amber}}>
              {zapLoading ? "⚡..." : "Zap ⚡"}
            </button>
          </div>
          {zapError && <p className="text-[8px] text-red-500 mt-2">{zapError}</p>}
          <LightningConnectModal 
            isOpen={isLightningOpen} 
            onClose={() => setIsLightningOpen(false)} 
            onSaveNwc={saveNwc} 
          />
        </div>
      </div>

      <div className="flex gap-8 border-b mb-8" style={{borderColor:C.line}}>
        {["info", "community"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="pb-3 text-[10px] uppercase tracking-widest transition-all"
            style={{
              color: activeTab === t ? C.dew : "#595959",
              borderBottom: activeTab === t ? `2px solid ${C.leaf}` : "2px solid transparent",
              fontWeight: activeTab === t ? "700" : "400"
            }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "info" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-12">
            <section>
              <p className="text-[10px] uppercase tracking-[3px] mb-4 opacity-40 font-bold">The Message</p>
              <p className="text-lg leading-relaxed" style={{color:C.mist}}>{node.message}</p>
            </section>

            <section>
              <p className="text-[10px] uppercase tracking-[3px] mb-4 opacity-40 font-bold">Genesis Covenant / Satoshi Nakamoto</p>
              <div className="p-8 border-l-2 relative overflow-hidden" 
                style={{
                  borderColor: C.leaf, 
                  background: "rgba(255,255,255,0.02)",
                }}>
                <p className="text-xl font-serif italic relative z-10 leading-relaxed mb-4" style={{fontFamily:DF, color:C.dew}}>
                  "{node.quote.text}"
                </p>
                <div className="flex flex-col">
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{color:C.leaf}}>— {node.quote.author}</p>
                  {node.quote.context && (
                    <p className="text-[9px] mt-1 opacity-40 uppercase tracking-tight">{node.quote.context}</p>
                  )}
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">”</div>
              </div>
            </section>

            <section>
              <p className="text-[10px] uppercase tracking-[3px] mb-4 opacity-40 font-bold">The Rationale (Biological-Cryptographic Connection)</p>
              <p className="text-sm leading-relaxed text-[#a6a6a6]">{node.rationale}</p>
            </section>
          </div>

          <div className="space-y-6">
             <Card className="p-6" style={{borderColor:C.line}}>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-4" style={{color:C.leaf}}>Network Status</p>
                <div className="space-y-4">
                   <div>
                      <p className="text-[8px] uppercase opacity-40 mb-1">State Verification</p>
                      <p className="text-xs font-mono" style={{color:C.usdg}}>VERIFIED ON CHAIN</p>
                   </div>
                   <div>
                      <p className="text-[8px] uppercase opacity-40 mb-1">Hash Anchor</p>
                      <p className="text-[10px] font-mono break-all opacity-60">0000000000000000000{node.id}...</p>
                   </div>
                </div>
             </Card>

             <Btn full onClick={() => alert("Initializing Nostr Key Verification...")}>Verify Node Identity</Btn>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
           <section>
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] uppercase tracking-[3px] opacity-40 font-black">Hội đồng Tự nhiên (Consensus Roll)</p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] uppercase tracking-widest opacity-40">Syncing with relays...</span>
                </div>
              </div>

              <div className="space-y-4">
                 {comments.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center text-center px-6">
                       <p className="text-2xl mb-4 opacity-20">🍃</p>
                       <p className="text-[10px] uppercase tracking-[3px] opacity-40 font-bold mb-1">Silence in the Grove</p>
                       <p className="text-[10px] opacity-30 leading-relaxed uppercase tracking-tighter">No biological observations have been anchored to this node yet.</p>
                    </div>
                 ) : (
                    comments.map(c => (
                       <Card key={c.id} className="!p-5 border-2 border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors">
                          <div className="flex items-center gap-3 mb-4">
                             <div className="w-8 h-8 rounded-none border-2 flex items-center justify-center overflow-hidden shrink-0" 
                               style={{borderColor: C.leaf, background: C.ghost}}>
                                <img 
                                  src={c.author.profile?.image || `https://robohash.org/${c.pubkey}`} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = `https://robohash.org/${c.pubkey}`; }}
                                />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest truncate" style={{color: C.dew}}>
                                  {c.author.profile?.name || c.author.profile?.display_name || `${c.author.npub.slice(0, 10)}...`}
                                </p>
                                <p className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">
                                  {new Date((c.created_at || 0) * 1000).toLocaleString()}
                                </p>
                             </div>
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-80" style={{color: '#e0e0e0'}}>{c.content}</p>
                       </Card>
                    ))
                 )}
              </div>
           </section>

           <div className="pt-8 border-t-2 border-neutral-800">
              {!user ? (
                 <div className="text-center p-8 bg-neutral-900/50 border-2 border-neutral-800">
                   <p className="text-[10px] uppercase tracking-[3px] font-black mb-6 opacity-60">Identity Verification Required</p>
                   <Btn full onClick={() => setIsConnectOpen(true)}>Connect Identity to Participate</Btn>
                   <NostrConnectModal 
                      isOpen={isConnectOpen} 
                      onClose={() => setIsConnectOpen(false)}
                      onLoginNip07={loginNip07}
                      onLoginPK={loginPrivateKey}
                      onLoginRemote={loginRemote}
                      onLoginReadOnly={loginReadOnly}
                      onSaveNwc={saveNwc}
                      loading={nostrLoading}
                      error={nostrError}
                   />
                 </div>
              ) : (
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-[3px] font-black" style={{color: C.leaf}}>New Observation</span>
                      <span className="flex-1 h-[1px] bg-neutral-800" />
                    </div>
                    <textarea 
                       value={commentText}
                       onChange={e => setCommentText(e.target.value)}
                       placeholder="Log your observation... (Permanently anchors to Node ${node.id})"
                       className="w-full bg-black border-2 p-4 text-xs font-medium outline-none rounded-none min-h-[120px] transition-all focus:border-green-500 overflow-y-auto"
                       style={{borderColor: 'rgb(38, 38, 38)', color: C.dew}}
                    />
                    <div className="flex justify-end gap-3">
                       <p className="text-[8px] uppercase tracking-widest opacity-40 flex items-center gap-1">
                         <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                         Ready for Broadcast
                       </p>
                       <Btn onClick={handlePostComment} disabled={posting || !commentText.trim()}>
                          {posting ? "Syncing..." : "Publish to Relays"}
                       </Btn>
                    </div>
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
});

const FeedTab = memo(() => {
  const {state,dispatch} = useStore();
  const font = SF(state.lang);
  const [compose,setCompose]=useState(false);
  const [content,setContent]=useState("");
  const [storage,setStorage]=useState(state.wallet?.storagePref || "nostr");
  const [reportMenu,setReportMenu]=useState(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file));
      setCompose(true);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioSrc(URL.createObjectURL(file));
      setCompose(true);
    }
  };

  const doPost = useCallback(()=>{
    if(!content.trim() && !imageSrc && !audioSrc) return;
    setMediaLoading(true);

    setTimeout(() => {
      dispatch({type:"ADD_POST",payload:{
        id:`p${Date.now()}`,
        author:`${state.wallet?.name || "Guest Node"} · ${(state.wallet?.address||"").slice(0,8)||"..."}`,
        tier:"thread", time:"just now",
        content, tags:[], likes:0, reports:0, burned:false,
        img:"🌱", storage,
        imageStr: imageSrc,
        audioStr: audioSrc,
        txHash: storage==="nostr"?"npub"+Math.random().toString(36).slice(2,10):
                 storage==="rgb"?"rgb:"+Math.random().toString(36).slice(2,10):
                 "Qm"+Math.random().toString(36).slice(2,10),
      }});
      setContent("");
      setImageSrc(null);
      setAudioSrc(null);
      setMediaLoading(false);
      setCompose(false);
    }, 1500);
  },[content, storage, imageSrc, audioSrc, state.wallet, dispatch]);

  const doReport = useCallback((post,reason)=>{
    dispatch({type:"REPORT_POST",id:post.id,preview:post.content,reason});
    setReportMenu(null);
  },[dispatch]);

  const doLike = useCallback(id=>dispatch({type:"LIKE",id}),[dispatch]);

  const REPORT_REASONS = ["spam","offensive","misinformation","off-topic"];
  const STORAGE_OPTIONS = [
    {id:"nostr",label:"Nostr",icon:"⚡",desc:"Relay network · free"},
    {id:"ipfs",   label:"IPFS",   icon:"⬡",desc:"Distributed · free"},
    {id:"rgb", label:"RGB", icon:"🟢",desc:"Bitcoin native · L2/L3"},
  ];

  return (
    <div style={{fontFamily:font}}>
      {/* Compose */}
      <Card className="mb-4" style={{borderColor:`${C.leaf}28`}}>
        <textarea value={content} onChange={e=>setContent(e.target.value)} disabled={mediaLoading}
          placeholder="Update your node's status... What does this nature mean to you?"
          rows={3} className="w-full p-2.5 rounded-none text-xs outline-none resize-none mb-3"
          style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.leaf}20`,color:C.dew,fontFamily:"inherit"}}/>
        
        {/* MEDIA PREVIEWS */}
        {imageSrc && (
          <div className="relative mb-3 inline-block w-full">
            <img src={imageSrc} style={{maxHeight: "300px", width: "100%", objectFit: "cover", borderRadius: "4px"}} />
            {!mediaLoading && <button className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-none w-7 h-7 flex items-center justify-center text-xs cursor-pointer border-none" onClick={() => setImageSrc(null)}>✕</button>}
          </div>
        )}
        {audioSrc && (
            <div className="relative mb-3 flex items-center gap-3 bg-[#0a0a0a] border rounded-none p-3 w-full" style={{borderColor:C.line}}>
              <span style={{fontSize: 20}}>🎤</span>
              <audio controls src={audioSrc} className="flex-1 h-8" style={{outline: "none"}} />
              {!mediaLoading && <button className="text-[10px] uppercase tracking-widest font-semibold p-1 cursor-pointer bg-transparent border-none" style={{color:C.red}} onClick={() => setAudioSrc(null)}>✕</button>}
            </div>
        )}

        {/* MEDIA TOOLBAR */}
        <div className="flex gap-5 mb-4 border-b pb-4" style={{borderColor:C.line}}>
          <button disabled={mediaLoading} className="flex items-center gap-2 text-[10px] uppercase tracking-widest cursor-pointer" style={{color:C.leaf, background:"none", border:"none", opacity:mediaLoading?0.5:1}} onClick={() => document.getElementById("img-upload").click()}>
            <span style={{fontSize: 16}}>📸</span> Attach Image
          </button>
          <input id="img-upload" type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload} />
          
          <button disabled={mediaLoading} className="flex items-center gap-2 text-[10px] uppercase tracking-widest cursor-pointer" style={{color:C.sky, background:"none", border:"none", opacity:mediaLoading?0.5:1}} onClick={() => document.getElementById("audio-upload").click()}>
            <span style={{fontSize: 16}}>🎤</span> Attach Audio
          </button>
          <input id="audio-upload" type="file" accept="audio/*" style={{display:"none"}} onChange={handleAudioUpload} />
        </div>

        {/* Storage selector & Post */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[2px]" style={{color:C.leaf}}>
              ⛓ Store on: {STORAGE_OPTIONS.find(s=>s.id===storage)?.label}
            </p>
          </div>
          <Btn onClick={doPost} full disabled={(!content.trim() && !imageSrc && !audioSrc) || mediaLoading}>
              {mediaLoading ? "Broadcasting..." : `Publish to ${STORAGE_OPTIONS.find(s=>s.id===storage)?.label || "Network"}`}
          </Btn>
        </div>
      </Card>

      {/* Posts */}
      <div className="flex flex-col gap-3">
      {state.posts.filter(p=>!p.burned).map(p=>(
        <Card key={p.id} className="relative"
          style={{opacity:p.reports>=3?"0.6":1}}>
          {p.reports>=3&&(
            <div className="absolute inset-0 rounded-none flex items-center justify-center"
              style={{background:"rgba(0,0,0,0.5)",zIndex:2}}>
              <p className="text-xs" style={{color:C.red}}>⚠ Under community review ({p.reports} reports)</p>
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-none flex items-center justify-center text-base border"
              style={{background:`${C.leaf}10`,borderColor:`${C.leaf}22`}}>{p.img}</div>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{color:C.dew}}>{p.author}</p>
              <p className="text-[9px]" style={{color:"#8c8c8c"}}>{p.time}</p>
            </div>
            <div className="flex gap-1 items-center">
              <StorageBadge type={p.storage||"ipfs"}/>
              <button onClick={()=>setReportMenu(reportMenu===p.id?null:p.id)}
                className="w-6 h-6 rounded-none flex items-center justify-center text-sm cursor-pointer border"
                style={{background:"transparent",borderColor:"rgba(255,255,255,0.06)",color:"#595959"}}>
                ⋮
              </button>
            </div>
          </div>

          {reportMenu===p.id&&(
            <div className="absolute right-3 top-10 rounded-none border p-2 z-10 w-44"
              style={{background:"#0d100d",borderColor:`${C.red}30`}}>
              <p className="text-[9px] uppercase tracking-widest px-2 pb-1 mb-1 border-b"
                style={{color:C.red,borderColor:`${C.red}20`}}>Report Post</p>
              {REPORT_REASONS.map(r=>(
                <button key={r} onClick={()=>doReport(p,r)}
                  className="w-full text-left py-1.5 px-2 rounded-none text-xs cursor-pointer"
                  style={{background:"transparent",border:"none",color:"#e0e0e0",fontFamily:"inherit"}}>
                  {r}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs leading-relaxed mb-3" style={{color:"#e0e0e0", whiteSpace:"pre-wrap"}}>{p.content}</p>
          {p.imageStr && (
             <img src={p.imageStr} className="w-full rounded-none mb-3 border" style={{borderColor:C.line, objectFit:"cover", maxHeight:"300px"}} />
          )}
          {p.audioStr && (
             <audio controls src={p.audioStr} className="w-full h-8 mb-3" style={{borderRadius:"0px", outline:"none"}} />
          )}

          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {p.tags?.map((t,i)=><span key={i} className="text-[9px]" style={{color:"#595959"}}>#{t}</span>)}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}>
            <button onClick={()=>doLike(p.id)}
              style={{color:state.likedPosts[p.id]?C.red:"#8c8c8c",
                background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",
                fontSize:12,display:"flex",alignItems:"center",gap:4}}>
              {state.likedPosts[p.id]?"❤️":"🤍"} <span className="text-[10px]">{p.likes}</span>
            </button>
            <div className="flex gap-4">
              <button style={{color:"#8c8c8c",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>💬</button>
              <button style={{color:"#8c8c8c",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>↗</button>
            </div>
          </div>
        </Card>
      ))}
      </div>
    </div>
  );
});


// ─── MARKET TAB ───────────────────────────────────────────────
const MarketTab = memo(() => {
  const {state,dispatch} = useStore();
  const font = SF(state.lang);
  const [view,setView] = useState("stays"); // stays or harvest
  const [showCreate, setShowCreate] = useState(false);

  // Mock harvests if not in state, or just filter existing listings
  const harvests = useMemo(() => [
    { id:"h1", img:"🍅", name:"Organic Heirloom Tomatoes", host:"Saigon Balcony Node", price:5, rating:4.8, reviews:24, desc:"Sun-ripened, no pesticides. Picked same day." },
    { id:"h2", img:"🍯", name:"Wild Forest Honey", host:"Binh Phuoc Forest Node", price:15, rating:5.0, reviews:8, desc:"Raw honey from old-growth forest blossoms." },
    { id:"h3", img:"🥬", name:"Aquaponic Kale", host:"D7 Urban Garden", price:3, rating:4.7, reviews:15, desc:"Crunchy green kale, nutrient dense." },
  ], []);

  const stays = state.stays;

  const [msgStatus, setMsgStatus] = useState("");

  const handleMessage = (host) => {
    // NIP-44 Mock
    setMsgStatus(`Initializing secure NIP-44 channel with ${host}...`);
    setTimeout(() => setMsgStatus(""), 4000);
    console.log(`Initializing NIP-44 Encrypted Channel with ${host}`);
  };

  const usdgToSats = (usdg) => Math.round(usdg * 2400); // Mock exchange rate

  return (
    <div style={{fontFamily:font}}>
      {/* Header & Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <button onClick={()=>setView("stays")} 
            className="pb-2 bg-transparent border-none cursor-pointer text-xs font-semibold uppercase tracking-widest transition-all"
            style={{
              color:view==="stays"?C.leaf:"#595959",
              borderBottom:view==="stays"?`2px solid ${C.leaf}`:"2px solid transparent",
              fontWeight:view==="stays"?"700":"500"
            }}>Eco-Stays</button>
          <button onClick={()=>setView("harvest")} 
            className="pb-2 bg-transparent border-none cursor-pointer text-xs font-semibold uppercase tracking-widest transition-all"
            style={{
              color:view==="harvest"?C.leaf:"#595959",
              borderBottom:view==="harvest"?`2px solid ${C.leaf}`:"2px solid transparent",
              fontWeight:view==="harvest"?"700":"500"
            }}>Harvest</button>
        </div>
        <button onClick={() => setShowCreate(true)} 
          className="px-4 py-2 rounded-none text-[10px] uppercase tracking-widest font-bold border transition-colors"
          style={{borderColor:C.leaf, color:C.leaf, background:"transparent"}}>
          + Create Listing
        </button>
      </div>

      {msgStatus && (
        <div className="mb-4 p-3 rounded-none border text-[10px] uppercase tracking-widest text-center animate-pulse"
          style={{borderColor:C.usdg, background:`${C.usdg}10`, color:C.usdg}}>
          {msgStatus}
        </div>
      )}

      {showCreate && (
        <Card className="mb-6 p-6 border-dashed" style={{borderColor:C.leaf}}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{color:C.leaf}}>New Market Listing</p>
            <button onClick={()=>setShowCreate(false)} className="text-xs" style={{color:"#8c8c8c"}}>Cancel</button>
          </div>
          <p className="text-xs italic" style={{color:"#8c8c8c"}}>Node status: Verification required for host status. Contact DAO board for vetting.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {view === "stays" ? stays.map(s => (
          <Card key={s.id} className="overflow-hidden flex flex-col group" style={{padding:0, borderColor:C.line}}>
             <div className="h-32 w-full flex items-center justify-center text-4xl" style={{background:C.ghost}}>
               {s.img}
             </div>
             <div className="p-4 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-1">
                 <p className="text-sm font-semibold" style={{color:C.dew}}>{s.name}</p>
                 <div className="flex items-center gap-1">
                   <span style={{color:C.leaf, fontSize:10}}>★</span>
                   <span className="text-[10px]" style={{color:C.mist}}>{s.rating}</span>
                 </div>
               </div>
               <p className="text-[9px] uppercase tracking-widest mb-3" style={{color:"#595959"}}>{s.city} · Host: {s.owner}</p>
               
               <div className="flex flex-col gap-1 mb-4 flex-1">
                 {s.perks.slice(0,2).map(p => (
                   <p key={p} className="text-[10px]" style={{color:"#8c8c8c"}}>• {p}</p>
                 ))}
               </div>

               <div className="border-t pt-3 mt-auto" style={{borderColor:C.line}}>
                 <div className="flex justify-between items-end mb-3">
                   <div>
                     <p className="text-[8px] uppercase tracking-widest mb-0.5" style={{color:"#595959"}}>Price per night</p>
                     <p className="text-sm font-bold" style={{color:C.usdg}}>{s.price} <span className="text-[9px]">USDG</span></p>
                     <p className="text-[8px] font-mono" style={{color:C.amber}}>{usdgToSats(s.price)} SATS</p>
                   </div>
                   <button onClick={() => handleMessage(s.owner)}
                     className="px-3 py-2 rounded-none border flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold cursor-pointer transition-colors hover:bg-opacity-10"
                     style={{borderColor:C.line, background:C.ghost, color:C.dew}}>
                     <span>🔒</span> Encrypted Message
                   </button>
                 </div>
               </div>
             </div>
          </Card>
        )) : harvests.map(h => (
          <Card key={h.id} className="overflow-hidden flex flex-col" style={{padding:0, borderColor:C.line}}>
             <div className="h-32 w-full flex items-center justify-center text-4xl" style={{background:C.ghost}}>
               {h.img}
             </div>
             <div className="p-4 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-1">
                 <p className="text-sm font-semibold" style={{color:C.dew}}>{h.name}</p>
                 <div className="flex items-center gap-1">
                   <span style={{color:C.leaf, fontSize:10}}>★</span>
                   <span className="text-[10px]" style={{color:C.mist}}>{h.rating}</span>
                 </div>
               </div>
               <p className="text-[9px] uppercase tracking-widest mb-2" style={{color:"#595959"}}>{h.host}</p>
               <p className="text-[10px] leading-relaxed mb-4" style={{color:"#8c8c8c"}}>{h.desc}</p>

               <div className="border-t pt-3 mt-auto" style={{borderColor:C.line}}>
                 <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest mb-0.5" style={{color:"#595959"}}>Price</p>
                      <p className="text-sm font-bold" style={{color:C.usdg}}>{h.price} <span className="text-[9px]">USDG</span></p>
                      <p className="text-[8px] font-mono" style={{color:C.amber}}>{usdgToSats(h.price)} SATS</p>
                    </div>
                    <button onClick={() => handleMessage(h.host)}
                      className="px-3 py-2 rounded-none border flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold cursor-pointer"
                      style={{borderColor:C.line, background:C.ghost, color:C.dew}}>
                      <span>🔒</span> Message
                    </button>
                 </div>
               </div>
             </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t text-center" style={{borderColor:C.line}}>
        <p className="text-[8px] uppercase tracking-[3px]" style={{color:C.clay}}>
          Web of Trust: 128 active nodes verifying peer-to-peer commerce.
        </p>
      </div>
    </div>
  );
});

// ─── DAO MODERATION ───────────────────────────────────────────
const DAOTab = memo(() => {
  const {state,dispatch} = useStore();
  const font = SF(state.lang);
  
  // Mock Vetting Proposals
  const [proposals, setProposals] = useState([
    { id: "v1", node: "Dalat Pine Forest", status: "pending", vouches: 14, required: 21, staked: 10, daysActive: 45, bio: "Organic pine honey provider and eco-retreat space." },
    { id: "v2", node: "Hoi An Herb Garden", status: "pending", vouches: 8, required: 21, staked: 10, daysActive: 12, bio: "Urban medicinal herb garden in ancient town." },
  ]);

  const [voted, setVoted] = useState({});

  const handleVouch = (id) => {
    if (voted[id]) return;
    setVoted(v => ({...v, [id]: "vouched"}));
    setProposals(prev => prev.map(p => p.id === id ? { ...p, vouches: p.vouches + 1 } : p));
  };

  const handleReject = (id) => {
    if (voted[id]) return;
    setVoted(v => ({...v, [id]: "rejected"}));
  };

  const treasuryBalance = "5,240 USDG";
  const btcBalance = "0.12 BTC";
  const verifiedHosts = 21;

  return (
    <div style={{fontFamily:font}}>
      {/* Treasury Header */}
      <Card className="mb-4 overflow-hidden relative" style={{background:"#0d110d", borderColor:C.leaf}}>
        <div className="absolute top-0 right-0 p-4 opacity-10" style={{fontSize: 80}}></div>
        <p className="text-[10px] uppercase tracking-[3px] mb-6" style={{color:C.mist}}>Star Apple Treasury</p>
        <div className="flex gap-8 mb-4">
          <div>
            <p style={{fontFamily:DF, fontSize:22, color:C.dew}}>{treasuryBalance}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{color:C.leaf}}>USDG Liquidity</p>
          </div>
          <div>
            <p style={{fontFamily:DF, fontSize:22, color:C.dew}}>{btcBalance}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{color:C.amber}}>Bitcoin Reserve</p>
          </div>
        </div>
        <div className="pt-4 border-t" style={{borderColor: "rgba(255,255,255,0.05)"}}>
           <p className="text-[10px]" style={{color:C.mist}}>Verified Hosts in Network: <span style={{color:C.dew, fontWeight: "bold"}}>{verifiedHosts}</span></p>
        </div>
      </Card>

      {/* Application Hook */}
      <Card className="mb-6 border-dashed" style={{borderColor:C.line, background: "transparent"}}>
        <div className="flex flex-col items-center text-center py-2">
          <p className="text-xs mb-3" style={{color:C.dew}}>Ready to offer Eco-Stays or Harvests?</p>
          <p className="text-[10px] mb-5 leading-relaxed" style={{color:"#595959"}}>
            Your Feed is your resume. Becoming a Host requires at least 21 days<br/>
            of Proof of Nature on the Feed + a stake of 10 USDG.
          </p>
          <Btn onClick={() => alert("Checking eligibility... Redirecting to application flow.")} sm>
             Submit Host Proposal
          </Btn>
        </div>
      </Card>

      {/* Vetting Proposals */}
      <p className="text-[9px] tracking-[4px] uppercase mb-4" style={{color:C.leaf}}>
        Active Vetting Proposals
      </p>

      <div className="flex flex-col gap-3">
        {proposals.map(p => {
          const progress = (p.vouches / p.required) * 100;
          const isVoted = voted[p.id];

          return (
            <Card key={p.id} className="relative" style={{borderColor:C.line}}>
              <div className="flex justify-between items-start mb-3">
                <div>
                   <p className="text-xs font-bold" style={{color:C.dew}}>{p.node}</p>
                   <button className="text-[9px] uppercase tracking-widest mt-1 hover:underline p-0 bg-transparent border-none outline-none" style={{color:C.leaf, cursor: "pointer"}}>View Feed History ↗</button>
                </div>
                <div className="text-right">
                   <p className="text-[9px] uppercase tracking-widest" style={{color:"#595959"}}>Staked</p>
                   <p className="text-xs font-mono" style={{color:C.usdg}}>{p.staked} USDG</p>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed mb-4" style={{color:"#8c8c8c"}}>"{p.bio}"</p>

              <div className="mb-4">
                <div className="flex justify-between text-[9px] mb-1.5 uppercase tracking-widest">
                  <span style={{color:C.mist}}>Vetting Progress</span>
                  <span style={{color:C.dew}}>{p.vouches} / {p.required} Vouches</span>
                </div>
                <div className="h-1 rounded-none overflow-hidden" style={{background:C.ghost}}>
                   <div className="h-full transition-all duration-700" style={{width: `${progress}%`, background: C.leaf}} />
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  disabled={!!isVoted}
                  onClick={() => handleVouch(p.id)}
                  className="flex-1 py-2 rounded-none border text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50"
                  style={{
                    borderColor: isVoted === "vouched" ? C.leaf : C.line, 
                    background: isVoted === "vouched" ? `${C.leaf}20` : "transparent",
                    color: isVoted === "vouched" ? C.leaf : C.dew,
                    cursor: !!isVoted ? "default" : "pointer"
                  }}
                >
                  {isVoted === "vouched" ? "✓ Vouched" : "👍 Vouch (Sign Event)"}
                </button>
                {!isVoted ? (
                  <button 
                    onClick={() => handleReject(p.id)}
                    className="px-4 py-2 rounded-none border text-[10px] uppercase tracking-widest font-bold transition-all"
                    style={{borderColor: C.red, background: "transparent", color: C.red, cursor: "pointer"}}
                  >
                    👎 Reject
                  </button>
                ) : isVoted === "rejected" && (
                   <div className="flex-1 py-2 rounded-none border text-[10px] uppercase tracking-widest font-bold text-center"
                     style={{borderColor: C.red, background: `${C.red}10`, color: C.red}}>
                     Rejected
                   </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t text-center" style={{borderColor:C.line}}>
        <p className="text-[8px] uppercase tracking-[3px] leading-relaxed" style={{color:C.clay}}>
          The Green Weave DAO is a Council of Elders.<br/>
          Decisions are signed with NIP-01 Identity Events.
        </p>
      </div>
    </div>
  );
});

const USDGTab = memo(() => {
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
              <div className="flex items-center border rounded-none" style={{borderColor:C.line, background:"#050505"}}>
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
            <div className="border border-dashed p-5 rounded-none" style={{borderColor:C.line, background:"rgba(255,255,255,0.02)"}}>
              <p className="text-[9px] tracking-widest uppercase mb-2" style={{color:C.mist}}>Proof of Nature Hash</p>
              <p className="text-xs font-mono break-all" style={{color:C.usdg}}>{merkle}</p>
              <p className="text-[8px] mt-1.5 uppercase" style={{color:"#8c8c8c"}}>Verified via IPFS/Nostr network</p>
            </div>
            
            <div className="border border-solid p-5 rounded-none" style={{borderColor:C.line, background:"#050505"}}>
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
            <div className="w-14 h-14 rounded-none border flex items-center justify-center mb-5" style={{borderColor:C.usdg}}>
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
          <div className="flex-1 border rounded-none p-5 text-center" style={{borderColor:C.line, background:C.ghost}}>
            <p className="text-[9px] tracking-widest uppercase font-bold mb-1.5" style={{color:C.mist}}>Your USDG</p>
            <p style={{fontFamily:DF,fontSize:24,color:C.usdg}}>{state.wallet.usdg||0}</p>
          </div>
          <div className="flex-1 border rounded-none p-5 text-center" style={{borderColor:C.line, background:C.ghost}}>
            <p className="text-[9px] tracking-widest uppercase font-bold mb-1.5" style={{color:C.mist}}>Est. Impact</p>
            <p style={{fontFamily:DF,fontSize:24,color:C.leaf}}>{(state.wallet.usdg/1000).toFixed(3)}t <span className="text-[10px]">CO₂</span></p>
          </div>
        </div>
      )}
    </div>
  );
});
// ─── STORAGE INFO ─────────────────────────────────────────────
const StorageInfo = memo(() => {
  const font = SF("en");
  return (
    <div style={{fontFamily:font}}>
      <Card className="mb-4" style={{background:"linear-gradient(to bottom right, rgba(166,138,50,0.08), transparent)",borderColor:`${C.violet}25`}}>
        <p style={{fontFamily:DF,fontSize:16,color:C.dew,marginBottom:4}}>
          ⛓ Decentralized Storage
        </p>
        <p className="text-xs leading-relaxed" style={{color:"#7a7a9a"}}>
          Green Weave stores all content on decentralized networks.
          No single point of failure. No censorship. Permanent records.
        </p>
      </Card>
      {[
        {icon:"⚡", name:"Nostr Relays", color:C.violet,
          use:"Feed posts, chat, ephemeral data",
          how:"Censorship-resistant global communication protocol. Decentralized relay servers.",
          link:"nostr.com"},
        {icon:"⬡", name:"IPFS + Pinata", color:C.sky,
          use:"Post content, node metadata, survey data",
          how:"Content-addressed storage. Data is identified by hash, not location. Pinata ensures persistence.",
          link:"ipfs.tech"},
        {icon:"🟢", name:"RGB State", color:C.leaf,
          use:"Asset ownership, smart contracts",
          how:"Client-side validation on Bitcoin. Scalable, private smart contracts with off-chain state.",
          link:"rgb.tech"},
        {icon:"₿", name:"Bitcoin On-chain", color:C.amber,
          use:"Anchoring, final settlement",
          how:"Critical state commitments anchored directly to the Bitcoin blockchain. Secure and immutable.",
          link:"bitcoin.org"},
      ].map(s=>(
        <Card key={s.name} className="mb-3" style={{borderColor:`${s.color}25`}}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-none flex items-center justify-center text-xl border"
              style={{background:`${s.color}12`,borderColor:`${s.color}30`,fontFamily:"monospace"}}>{s.icon}</div>
            <div>
              <p className="text-sm font-semibold" style={{color:s.color}}>{s.name}</p>
              <p className="text-[9px]" style={{color:"#8c8c8c"}}>{s.link}</p>
            </div>
          </div>
          <p className="text-[9px] mb-1" style={{color:s.color}}>Used for: {s.use}</p>
          <p className="text-[10px] leading-relaxed" style={{color:"#8c8c8c"}}>{s.how}</p>
        </Card>
      ))}
    </div>
  );
});

// ─── PROFILE / WALLET ─────────────────────────────────────────
const ProfileTab = memo(({onDisconnect, user, profile}) => {
  const {state} = useStore();
  const font = SF(state.lang);
  const [copied, setCopied] = useState(false);

  const copyNpub = () => {
    if (user?.npub) {
      navigator.clipboard.writeText(user.npub);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if(!state.wallet) return (
    <div className="text-center py-16" style={{color:"#595959",fontFamily:font}}>
      <p style={{fontSize:40,marginBottom:12}}>🌿</p>
      <p className="text-sm">Connect wallet to view profile</p>
    </div>
  );

  return (
    <div style={{fontFamily:font}}>
      <Card className="mb-3" style={{background:"linear-gradient(to bottom right, rgba(212,175,55,0.08), transparent)",borderColor:`${C.leaf}22`}}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-none overflow-hidden border-2 flex-shrink-0"
            style={{borderColor:C.leaf, background:C.ghost}}>
            <img 
              src={profile?.image || `https://robohash.org/${user?.pubkey || 'anon'}`} 
              className="w-full h-full object-cover" 
              alt="Profile"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 style={{fontFamily:DF,fontSize:20,color:"#ffffff",lineHeight:1.1}} className="mb-1">
              {profile?.name || (user?.npub ? `${user.npub.slice(0, 12)}...` : "Green Weave Scout")}
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[10px] font-mono opacity-50 truncate">
                {user?.npub ? `${user.npub.slice(0, 12)}...${user.npub.slice(-8)}` : "Guest Identity"}
              </p>
              {user?.npub && (
                <button onClick={copyNpub} className="p-1 hover:text-green-500 transition-colors">
                  <Copy size={10} className={copied ? "text-green-500" : ""} />
                </button>
              )}
            </div>
            {profile?.about && (
              <p className="text-[10px] leading-relaxed opacity-60 line-clamp-2">
                {profile.about}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            {v: "0", l: "Biomass Nodes", c: C.leaf},
            {v: "0", l: "Sats Zapped",   c: C.amber},
            {v: "0.00", l: "CO₂ Seq (kg)", c: C.sky},
          ].map((s,i)=>(
            <div key={i} className="text-center border py-2"
              style={{background:`${s.c}05`, borderColor: `${s.c}15`}}>
              <p className="text-sm font-black" style={{color:s.c}}>{s.v}</p>
              <p className="text-[7px] uppercase tracking-widest font-bold opacity-50" style={{color:s.c}}>{s.l}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{borderColor:`${C.leaf}18`,background:`${C.leaf}03`}}>
        <div className="flex items-center gap-2 mb-4">
           <ShieldCheck size={14} style={{color:C.leaf}} />
           <p className="text-[9px] tracking-[3px] uppercase font-black" style={{color:C.leaf}}>
             Ecosystem Roadmap
           </p>
        </div>
        {[
          {step:"Now", desc:"Genesis Covenant Deployed · Bitcoin Anchored", done:true},
          {step:"Next", desc:"Nostr Biomass Explorer · Community Discovery", done:false},
          {step:"Future", desc:"RGB Asset Issuance · Digital Green Credits", done:false},
        ].map((r,i)=>(
          <div key={i} className="flex gap-3 mb-4 last:mb-0">
            <div className="w-5 h-5 flex items-center justify-center text-[10px] flex-shrink-0 border-2"
              style={{
                borderColor:r.done ? C.leaf : "rgba(255,255,255,0.1)",
                color: r.done ? C.leaf : "#595959",
                background: r.done ? `${C.leaf}10` : "transparent"
              }}>
              {r.done ? "✓" : i + 1}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{color:r.done?C.leaf:"#595959"}}>{r.step}</p>
              <p className="text-[10px] leading-snug opacity-60" style={{color:r.done?"#ffffff":"#595959"}}>{r.desc}</p>
            </div>
          </div>
        ))}
      </Card>

      <button onClick={onDisconnect}
        className="w-full mt-4 py-3 border-2 text-[10px] uppercase tracking-[3px] font-black transition-all hover:bg-white/5"
        style={{borderColor:C.line, color:"#595959"}}>
        LOGOUT IDENTITY
      </button>
    </div>
  );
});

// ─── APP SHELL ────────────────────────────────────────────────
const TABS = [
  {id:"feed",    icon:"🌿", label:"Feed"},
  {id:"explorer",icon:"📒", label:"Manual"},
  {id:"market",  icon:"🏪", label:"Market"},
  {id:"dao",     icon:"🛡", label:"DAO"},
  {id:"usdg",    icon:"💚", label:"USDG"},
  {id:"storage", icon:"⛓", label:"Storage"},
  {id:"me",      icon:"👤", label:"Me"},
];

function AppShell() {
  const {state,dispatch} = useStore();
  const font = SF(state.lang);
  const [tab,setTab] = useState("feed");
  const [connected,setConnected] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const { user, profile, loginNip07, loginPrivateKey, loginRemote, loginReadOnly, error: nostrError, loading: nostrLoading } = useNostr();
  const { saveNwc } = useLightning();

  const connect    = useCallback(w=>{dispatch({type:"CONNECT",payload:w});setConnected(true);},[dispatch]);
  const disconnect = useCallback(()=>{dispatch({type:"DISCONNECT"});setConnected(false);setTab("feed");},[dispatch]);

  const content = useMemo(()=>({
    feed:    <FeedTab/>,
    explorer: <ExplorerTab/>,
    market:  <MarketTab/>,
    dao:     <DAOTab/>,
    usdg:    <USDGTab/>,
    storage: <StorageInfo/>,
    me:      <ProfileTab onDisconnect={disconnect} user={user} profile={profile}/>,
  }),[disconnect, user, profile]);

  if(!connected) return <ConnectGate onConnect={connect}/>;

  return (
    <div className="min-h-screen" style={{background:C.bg,color:C.dew,fontFamily:font}}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b px-6 flex flex-col justify-end h-20"
        style={{background:"rgba(5,5,5,0.97)",backdropFilter:"blur(14px)",borderColor:C.line}}>
        <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <span style={{fontSize:20, color:C.leaf}}>⧫</span>
            <div className="flex items-center gap-3">
              <p style={{fontFamily:DF,fontSize:18,color:C.leaf,letterSpacing:3,lineHeight:1,fontStyle:"italic"}}>GREEN WEAVE</p>
              <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
              <p className="text-[10px] uppercase tracking-[2px] opacity-40 hidden sm:block">greenweave.org</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
               <>
                 <button onClick={() => setIsConnectOpen(true)} disabled={nostrLoading}
                   className="px-3 py-1.5 text-[9px] uppercase tracking-[2px] font-bold border rounded-none hover:bg-white/5"
                   style={{borderColor:C.line, color:C.leaf}}>
                   {nostrLoading ? "CONNECTING..." : "CONNECT NOSTR"}
                 </button>
                 <NostrConnectModal 
                    isOpen={isConnectOpen} 
                    onClose={() => setIsConnectOpen(false)}
                    onLoginNip07={loginNip07}
                    onLoginPK={loginPrivateKey}
                    onLoginRemote={loginRemote}
                    onLoginReadOnly={loginReadOnly}
                    onSaveNwc={saveNwc}
                    loading={nostrLoading}
                    error={nostrError}
                 />
               </>
            ) : (
               <div className="flex items-center gap-3 px-3 py-1.5 border" style={{borderColor:C.line, background:C.ghost}}>
                  <div className="w-5 h-5 overflow-hidden border" style={{borderColor:C.leaf}}>
                     <img src={profile?.image || `https://robohash.org/${user.pubkey}`} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest font-bold" style={{color:C.leaf}}>
                     {profile?.name || user.npub.slice(0,8)}
                  </p>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></div>
               </div>
            )}
            {state.wallet&&(
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-none border"
                style={{borderColor:C.line,background:C.ghost}}>
                <span className="text-[10px] font-mono" style={{color:C.usdg}}>
                  {state.wallet.usdg||0} 
                </span>
                <span className="text-[9px] uppercase tracking-widest opacity-60">USDG</span>
              </div>
            )}
            <LangSwitcher/>
          </div>
        </div>
      </div>
      
      {/* Tabs / Sub-header */}
      <div className="border-b" style={{borderColor:C.line, background:C.ghost}}>
        <div className="max-w-3xl w-full mx-auto px-6 flex overflow-x-auto gap-8">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex-shrink-0 flex items-center gap-2 py-4 uppercase tracking-[0.2em] transition-all"
              style={{background:"none",cursor:"pointer",fontFamily:"inherit",
                borderBottom: tab===t.id ? `1px solid ${C.leaf}` : "1px solid transparent",
                color:tab===t.id?C.dew:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:500,borderTop:"none",borderLeft:"none",borderRight:"none"}}>
              <span>{t.icon}</span> <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 pb-12">
        {content[tab]}
      </div>
    </div>
  );
}

export default function App() {
  return <Store><AppShell/></Store>;
}
