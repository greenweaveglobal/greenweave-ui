import { useState, useEffect } from "react";
import { Zap, Heart, MessageSquare } from "lucide-react";
import { SimplePool, nip19, getPublicKey } from "nostr-tools";
import ZapModal from "./ZapModal";

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

export default function BiomassFeed() {
  const [activeZapTarget, setActiveZapTarget] = useState<string | null>(null);
  const [feedPosts, setFeedPosts] = useState<LivePost[]>([]);

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

  return (
    <div className="w-full max-w-sm flex-1 flex flex-col pt-4 overflow-hidden animate-in fade-in duration-500">
      <div className="px-4 text-xs font-black text-amber-500/40 mb-6 uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
        LIVE BIOMASS STREAM: LAYER 0 - VERIFIED
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-48 scrollbar-hide">
        <div className="flex flex-col gap-10">
          {feedPosts.length === 0 ? (
            <div className="p-10 text-center text-green-500 font-mono animate-pulse">
              [ SCANNING NOSTR RELAYS FOR BIOMASS DATA... ]
            </div>
          ) : feedPosts.map((item) => (
            <div key={item.id} className="bg-zinc-950 border-2 border-amber-500/10 shadow-2xl relative group p-5">
              <div className="text-xs text-white font-mono whitespace-pre-wrap">{item.content}</div>
            </div>
          ))}
        </div>
      </div>

      <ZapModal 
        isOpen={!!activeZapTarget} 
        onClose={() => setActiveZapTarget(null)} 
        targetName={activeZapTarget || ""}
      />
    </div>
  );
}
