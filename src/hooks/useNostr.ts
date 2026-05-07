import { useState, useCallback, useEffect } from 'react';
import NDK, { NDKUser, NDKEvent, NDKNip07Signer } from '@nostr-dev-kit/ndk';

// Global NDK instance to avoid re-initialization
const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'],
});

export function useNostr() {
  const [user, setUser] = useState<NDKUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ndk.connect().catch(err => console.error("NDK Connect Error", err));
  }, []);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(window as any).nostr) {
        throw new Error("No Nostr extension found (NIP-07)");
      }

      const signer = new NDKNip07Signer();
      ndk.signer = signer;
      
      const ndkUser = await signer.user();
      if (ndkUser) {
        ndkUser.ndk = ndk;
        setUser(ndkUser);
        
        // Fetch profile
        const profileData = await ndkUser.fetchProfile();
        setProfile(profileData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect Nostr");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setProfile(null);
    ndk.signer = undefined;
  }, []);

  const fetchComments = useCallback(async (nodeId: string) => {
    const filter = {
      kinds: [1],
      '#t': ['greenweave', `node-${nodeId}`],
      limit: 50
    };
    const events = await ndk.fetchEvents(filter);
    return Array.from(events);
  }, []);

  const postComment = useCallback(async (nodeId: string, content: string) => {
    if (!ndk.signer) throw new Error("Not logged in");
    
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = content;
    event.tags = [
      ['t', 'greenweave'],
      ['t', `node-${nodeId}`],
      ['p', 'npub16ptj5779lypxv4nd6v4ypjqy3eys8y7g5zqwk33g3qcyyzq0y6zq9v9v6p'] // System/Dev pubkey example
    ];
    await event.publish();
    return event;
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    login,
    logout,
    fetchComments,
    postComment,
    ndk
  };
}
