import { useState, useEffect } from "react";
import { Zap, Heart, MessageSquare } from "lucide-react";
import { SimplePool, nip19, getPublicKey } from "nostr-tools";

interface LivePost {
  id: string;
  author: string;
  pubkey: string;
  timestamp: string;
  content: string;
  species: string;
  confidence: string;
  description: string;
  location: string;
  energyToll: number;
  image?: string;
  createdAt: number;
}

function getRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp * 1000;
  const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
  if (mins < 60) return `${mins} MINS AGO`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} HOURS AGO`;
  return `${Math.round(hours / 24)} DAYS AGO`;
}

interface BiomassFeedProps {
  localPosts?: LivePost[];
  submittedEventIds?: string[];
  onAddProposal?: (proposal: any) => void;
  onNavigateToDao?: () => void;
}

export default function BiomassFeed({ localPosts = [], submittedEventIds = [], onAddProposal, onNavigateToDao }: BiomassFeedProps) {
  const [feedPosts, setFeedPosts] = useState<LivePost[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleZap = async () => {
    setToastMessage("INITIATING LIGHTNING PROTOCOL...");
    
    // @ts-ignore
    if (typeof window !== 'undefined' && window.webln) {
      try {
        // @ts-ignore
        await window.webln.enable();
        // Since we don't have PR readily, we stick to the deep link as fallback
      } catch (e) {
        console.warn("WebLN enable failed", e);
      }
    }

    setTimeout(() => {
      window.location.href = "lightning:playfulwaterfall533492@getalby.com";
      setTimeout(() => setToastMessage(null), 2000);
    }, 1000);
  };

  const fetchFeed = async () => {
    setIsLoading(true);
    const pool = new SimplePool();
    const relays = ['wss://nos.lol', 'wss://relay.damus.io', 'wss://relay.primal.net'];
    
    try {
      const events = await pool.querySync(relays, {
        kinds: [1],
        '#t': ['GreenWeave', 'BiomassProof', 'greenweave'],
        limit: 50
      });

      const parsedPosts = events.map(event => {
        let parsedContent = event.content;
        let visualProofUrl = "";

        try {
          const jsonEndIndex = event.content.lastIndexOf('}');
          if (jsonEndIndex !== -1) {
            const cleanJsonString = event.content.substring(0, jsonEndIndex + 1);
            const payload = JSON.parse(cleanJsonString);
            
            const trailingUrlMatch = event.content.match(/https?:\/\/[^\s]+/);
            if (trailingUrlMatch) {
              visualProofUrl = trailingUrlMatch[0];
            }
            // Pretty print the JSON for display
            parsedContent = JSON.stringify(payload, null, 2);
          }
        } catch (error) {
           // Fallback to raw content
        }

        return {
          id: event.id,
          author: nip19.npubEncode(event.pubkey).substring(0, 10) + "...",
          pubkey: event.pubkey,
          createdAt: event.created_at,
          timestamp: getRelativeTime(event.created_at),
          content: parsedContent,
          species: "Biomass",
          confidence: "??",
          description: "",
          location: "",
          energyToll: 0,
          image: visualProofUrl
        };
      });

      setFeedPosts(parsedPosts.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error("Relay fetch error:", err);
    } finally {
      setIsLoading(false);
      pool.close(relays);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const allPosts = [...localPosts, ...feedPosts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="w-full max-w-sm flex-1 flex flex-col pt-4 overflow-hidden animate-in fade-in duration-500">
      <div className="px-4 flex justify-between items-center mb-6 flex-shrink-0">
        <div className="text-xs font-black text-amber-500/40 uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          LAYER 0 - VERIFIED
        </div>
        <button 
          onClick={fetchFeed}
          disabled={isLoading}
          className="text-[10px] font-mono text-zinc-400 border border-zinc-800 px-2 py-1 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
        >
          [ ↻ REFRESH NOSTR RELAYS ]
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-48 scrollbar-hide relative">
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs z-50 rounded shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-in slide-in-from-top-4">
            {toastMessage}
          </div>
        )}
        <div className="flex flex-col gap-10">
          {isLoading ? (
            <div className="p-10 text-center text-green-500 font-mono animate-pulse">
              [ SCANNING NOSTR RELAYS FOR BIOMASS DATA... ]
            </div>
          ) : allPosts.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 font-mono">
              [ NO NETWORK ACTIVITY YET ]
            </div>
          ) : allPosts.map((item) => {
            let payloadObj = null;
            try {
              payloadObj = JSON.parse(item.content);
            } catch (e) {
              try {
                 payloadObj = JSON.parse(item.content.split('\n\n')[0]);
              } catch (e2) {}
            }

            const isSubmitted = payloadObj && submittedEventIds.includes(payloadObj.eventId);

            return (
            <div key={item.id} className="bg-zinc-950 border-2 border-amber-500/10 shadow-2xl relative group p-5">
              {item.image && (
                 <div className="w-full h-32 overflow-hidden border border-amber-500/20 mb-4 bg-zinc-900 flex items-center justify-center">
                    <img src={item.image} alt="Visual Proof" className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity" />
                 </div>
              )}
              <div className="text-xs text-white font-mono whitespace-pre-wrap mb-4 overflow-x-auto p-2 bg-black/50 border border-zinc-800 rounded">{item.content}</div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleZap();
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded uppercase tracking-widest flex items-center justify-center gap-2 mt-4 transition-colors"
              >
                <Zap size={18} fill="currentColor" />
                [ ⚡ ZAP SATS ]
              </button>
              {payloadObj && payloadObj.telemetry && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isSubmitted && onAddProposal) {
                      const newProposal = {
                        id: payloadObj.eventId,
                        type: "MINT", // Hard consensus required
                        title: `[ VERIFY ] Biomass Signature ${payloadObj.eventId.substring(0, 8)}`,
                        target: payloadObj.telemetry.species_hash,
                        confidence: payloadObj.telemetry.confidence_score,
                        status: "ACTIVE",
                        timeLock: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
                        createdAt: Date.now()
                      };
                      onAddProposal(newProposal);
                      if (onNavigateToDao) {
                        onNavigateToDao();
                      }
                    }
                  }}
                  disabled={isSubmitted}
                  className={`w-full font-bold py-3 rounded uppercase tracking-widest flex items-center justify-center mt-3 transition-colors border text-xs ${
                    isSubmitted 
                      ? "border-green-500/30 text-green-500/50 cursor-not-allowed"
                      : "border-green-500 text-green-500 hover:bg-green-500/20"
                  }`}
                >
                  {isSubmitted ? "[ PENDING DAO VERIFICATION ]" : "[ SUBMIT TO DAO CONSENSUS ]"}
                </button>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
