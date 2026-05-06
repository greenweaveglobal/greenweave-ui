import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/storage:"arweave"/g, 'storage:"nostr"');
content = content.replace(/storage:"shadow"/g, 'storage:"rgb"');
content = content.replace(/txHash:"Ar[a-zA-Z0-9]*"/g, 'txHash:"npub1a2b"');
content = content.replace(/txHash:"Sh[a-zA-Z0-9]*"/g, 'txHash:"rgb:1x2y"');
content = content.replace(/txHash:"Qm[a-zA-Z0-9]*"/g, 'txHash:"ipfs:Qm.."');

// StorageBadge
content = content.replace(/arweave:\{c:C.violet,l:"Arweave ∞"\}/g, 'nostr:{c:C.violet,l:"Nostr ⚡"}');
content = content.replace(/shadow: \{c:C.leaf,l:"Shadow Drive"\}/g, 'rgb: {c:C.leaf,l:"RGB State"}');

// Connect phantom
content = content.replace(/"Connecting\.\.\.":"Connect Phantom Wallet"/g, '"Connecting...":"Connect UniSat Wallet"');

// Auth page tagline
content = content.replace(/Solana · Metaplex · Elysia/g, 'Bitcoin · RGB Protocol · Lightning');

// State Hooks
content = content.replace(/useState\("arweave"\)/g, 'useState("nostr")');

// Feed post tx hash generation
content = content.replace(/storage==="arweave"\?"Ar"\+Math\.random\(\)\.toString\(36\)\.slice\(2,6\):/g, 'storage==="nostr"?"npub"+Math.random().toString(36).slice(2,8):');
content = content.replace(/storage==="shadow"\?"Sh"\+Math\.random\(\)\.toString\(36\)\.slice\(2,6\):/g, 'storage==="rgb"?"rgb:"+Math.random().toString(36).slice(2,8):');

// compose storage options
content = content.replace(/\{id:"arweave",label:"Arweave",icon:"∞",desc:"Permanent · \~\$0\.01"\}/g, '{id:"nostr",label:"Nostr",icon:"⚡",desc:"Relay network · free"}');
content = content.replace(/\{id:"shadow", label:"Shadow", icon:"◈",desc:"Solana native · fast"\}/g, '{id:"rgb", label:"RGB", icon:"🟢",desc:"Bitcoin native · L2/L3"}');

// Market tab
content = content.replace(/NFT Marketplace · Metaplex · Solana/g, 'Asset Marketplace · RGB21 · Bitcoin');

// Market item storage
content = content.replace(/<StorageBadge type="arweave"\/>/g, '<StorageBadge type="nostr"/>');

// Burn info
content = content.replace(/🔥 Post burned on-chain\. Token destroyed\. Tx recorded on Solana\./g, '🔥 Asset burned. Contract updated. Tx anchored on Bitcoin.');

// Usdg tab
content = content.replace(/representing a real carbon offset on Solana\./g, 'representing a real carbon offset on Bitcoin RGB.');

// Storage text
content = content.replace(/\{icon:"∞", name:"Arweave", color:C\.violet,[\s\S]*?link:"arweave\.org"\},/g, 
`{icon:"⚡", name:"Nostr Relays", color:C.violet,
          use:"Feed posts, chat, ephemeral data",
          how:"Censorship-resistant global communication protocol. Decentralized relay servers.",
          link:"nostr.com"},`);

content = content.replace(/\{icon:"◈", name:"Shadow Drive", color:C\.leaf,[\s\S]*?link:"shadow\.cloud"\},/g,
`{icon:"🟢", name:"RGB State", color:C.leaf,
          use:"Asset ownership, smart contracts",
          how:"Client-side validation on Bitcoin. Scalable, private smart contracts with off-chain state.",
          link:"rgb.tech"},`);

content = content.replace(/\{icon:"⬜", name:"Solana On-chain", color:C\.amber,[\s\S]*?link:"solana\.com"\},/g,
`{icon:"₿", name:"Bitcoin On-chain", color:C.amber,
          use:"Anchoring, final settlement",
          how:"Critical state commitments anchored directly to the Bitcoin blockchain. Secure and immutable.",
          link:"bitcoin.org"},`);


// profile tab
content = content.replace(/\{v:"Solana",\s*l:"Chain",\s*c:C\.amber\},/g, '{v:"Bitcoin",               l:"Chain",  c:C.amber},');

// roadmap
content = content.replace(/Roadmap · Solana → Bitcoin/g, 'Roadmap · Bitcoin & RGB');
content = content.replace(/Green Weave · Solana · Global community · USDG/g, 'Green Weave · Bitcoin RGB · Global community · USDG');
content = content.replace(/Migrate to RGB Bitcoin · 2000ha Heritage Forest/g, 'Full integration with Elysia Wealth');

// One more check for any solana strings
content = content.replace(/Solana/g, 'Bitcoin');

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
