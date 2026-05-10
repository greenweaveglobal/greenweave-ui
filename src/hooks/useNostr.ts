import { useState, useCallback, useEffect } from 'react';
import NDK, { NDKUser, NDKEvent, NDKNip07Signer, NDKPrivateKeySigner, NDKNip46Signer } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

// Global NDK instance
const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band', 'wss://relay.f7z.io'],
});

export function useNostr() {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [npub, setNpub] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [relayConnected, setRelayConnected] = useState<boolean>(false);
  
  const [user, setUser] = useState<NDKUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encodeNpub = (hex: string) => {
    try {
      return nip19.npubEncode(hex);
    } catch (err) {
      console.warn("Failed to encode npub:", err);
      return null;
    }
  };

  useEffect(() => {
    ndk.connect().catch(err => console.error("NDK Connect Error", err));
    
    ndk.pool.on('relay:connect', () => setRelayConnected(true));
    ndk.pool.on('relay:disconnect', () => {
      if (ndk.pool.stats().connected === 0) setRelayConnected(false);
    });
    
    // Auto-Reconnect Logic: Restore session gracefully
    const savedPubkey = localStorage.getItem('nostr_pubkey');
    if (savedPubkey) {
      setPubkey(savedPubkey);
      setNpub(encodeNpub(savedPubkey));
      setIsAuthenticated(true);
      
      // Attempt read-only NDK User restore seamlessly
      const ndkUser = new NDKUser({ pubkey: savedPubkey });
      ndkUser.ndk = ndk;
      setUser(ndkUser);
      ndkUser.fetchProfile().then(setProfile).catch(() => {});
    }
  }, []);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(window as any).nostr) throw new Error("NIP-07 Nostr extension not found. Please install Alby or a compatible extension.");
      
      const rawPubkey = await (window as any).nostr.getPublicKey();
      setPubkey(rawPubkey);
      const encodedNpub = encodeNpub(rawPubkey);
      setNpub(encodedNpub);
      setIsAuthenticated(true);
      localStorage.setItem('nostr_pubkey', rawPubkey);
      
      // Also init NDK to support the legacy parts of the app
      const signer = new NDKNip07Signer();
      ndk.signer = signer;
      const ndkUser = await signer.user();
      if (ndkUser) {
        ndkUser.ndk = ndk;
        setUser(ndkUser);
        const profileData = await ndkUser.fetchProfile();
        setProfile(profileData);
      }
    } catch (err: any) {
      console.error("Nostr Login Error:", err);
      setError(err.message || "Failed to authenticate with Nostr");
    } finally {
      setLoading(false);
    }
  }, []);

  const initUser = async (signer: any) => {
    ndk.signer = signer;
    const ndkUser = await signer.user();
    if (ndkUser) {
      ndkUser.ndk = ndk;
      setUser(ndkUser);
      setPubkey(ndkUser.pubkey);
      setNpub(encodeNpub(ndkUser.pubkey));
      setIsAuthenticated(true);
      localStorage.setItem('nostr_pubkey', ndkUser.pubkey);
      const profileData = await ndkUser.fetchProfile();
      setProfile(profileData);
    }
    return ndkUser;
  };

  const loginNip07 = login;

  const loginPrivateKey = useCallback(async (sk: string) => {
    setLoading(true);
    setError(null);
    try {
      const signer = new NDKPrivateKeySigner(sk);
      await initUser(signer);
    } catch (err: any) {
      setError(err.message || "Private Key Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const loginRemote = useCallback(async (bunkerUri: string) => {
    setLoading(true);
    setError(null);
    try {
      const localSigner = NDKPrivateKeySigner.generate();
      const signer = new NDKNip46Signer(ndk, bunkerUri, localSigner);
      
      console.log(`[NIP-46] Connecting to ${bunkerUri}...`);
      
      signer.on("authUrl", (url: string) => {
        window.open(url, '_blank');
      });

      await signer.blockUntilReady();
      await initUser(signer);
    } catch (err: any) {
      setError(err.message || "Remote Signer failed. Check your Bunker URI.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loginReadOnly = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const ndkUser = new NDKUser({ 
        npub: key.startsWith('npub') ? key : undefined,
        pubkey: !key.startsWith('npub') ? key : undefined
      });
      ndkUser.ndk = ndk;
      setUser(ndkUser);
      setPubkey(ndkUser.pubkey);
      setNpub(encodeNpub(ndkUser.pubkey));
      setIsAuthenticated(true);
      localStorage.setItem('nostr_pubkey', ndkUser.pubkey);
      const profileData = await ndkUser.fetchProfile();
      setProfile(profileData);
      ndk.signer = undefined;
    } catch (err: any) {
      setError(err.message || "Read-only Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setProfile(null);
    setPubkey(null);
    setNpub(null);
    setIsAuthenticated(false);
    localStorage.removeItem('nostr_pubkey');
    ndk.signer = undefined;
  }, []);

  const fetchComments = useCallback(async (nodeId: string) => {
    const filter = {
      kinds: [1],
      '#t': [`greenweave_node_${nodeId}`],
      limit: 50
    };
    const events = await ndk.fetchEvents(filter);
    const eventsList = Array.from(events);
    
    const resolvedEvents = await Promise.all(eventsList.map(async (event) => {
      const author = event.author;
      return {
        id: event.id,
        content: event.content,
        created_at: event.created_at,
        pubkey: event.pubkey,
        author: {
          npub: author.npub,
          profile: author.profile || null
        }
      };
    }));
    
    return resolvedEvents.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  }, []);

  const postComment = useCallback(async (nodeId: string, content: string) => {
    if (!ndk.signer) throw new Error("Not logged in");
    
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = content;
    event.tags = [
      ['t', `greenweave_node_${nodeId}`],
    ];
    await event.publish();
    return event;
  }, []);

  return {
    pubkey,
    npub,
    isAuthenticated,
    relayConnected,
    user,
    profile,
    loading,
    error,
    login,
    loginNip07,
    loginPrivateKey,
    loginRemote,
    loginReadOnly,
    logout,
    fetchComments,
    postComment,
    ndk
  };
}
