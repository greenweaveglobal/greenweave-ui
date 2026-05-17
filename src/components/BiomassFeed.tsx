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

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      const pool = new SimplePool();
      const relays = ['wss://nos.lol', 'wss://relay.damus.io', 'wss://relay.primal.net'];
      
      try {
        const events = await pool.querySync(relays, {
          kinds: [1],
          '#t': ['GreenWeave', 'BiomassProof', 'greenweave'],
          limit: 20
        });

        if (!isMounted) return;

        const formattedPosts = events.map(event => ({
          id: event.id,
          author: nip19.npubEncode(event.pubkey).substring(0, 10) + "...",
          pubkey: event.pubkey,
          createdAt: event.created_at,
          timestamp: getRelativeTime(event.created_at),
          content: event.content,
          species: "Biomass",
          confidence: "??",
          description: "",
          location: "",
          energyToll: 0
        })).sort((a, b) => b.createdAt - a.createdAt);

        setFeedPosts(formattedPosts);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        pool.close(relays);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const allPosts = [...localPosts, ...feedPosts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="w-full max-w-sm flex-1 flex flex-col pt-4 overflow-hidden animate-in fade-in duration-500">
      <div className="px-4 text-xs font-black text-amber-500/40 mb-6 uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
        LIVE BIOMASS STREAM: LAYER 0 - VERIFIED
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-48 scrollbar-hide relative">
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs z-50 rounded shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-in slide-in-from-top-4">
            {toastMessage}
          </div>
        )}
        <div className="flex flex-col gap-10">
          {allPosts.length === 0 ? (
            <div className="p-10 text-center text-green-500 font-mono animate-pulse">
              [ SCANNING NOSTR RELAYS FOR BIOMASS DATA... ]
            </div>
          ) : allPosts.map((item) => {
            let payloadObj = null;
            try {
              payloadObj = JSON.parse(item.content.split('\n\n')[0]);
            } catch (e) {}

            const isSubmitted = payloadObj && submittedEventIds.includes(payloadObj.eventId);

            return (
            <div key={item.id} className="bg-zinc-950 border-2 border-amber-500/10 shadow-2xl relative group p-5">
              <div className="text-xs text-white font-mono whitespace-pre-wrap mb-4">{item.content}</div>
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
