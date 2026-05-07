import { useState, useCallback, useEffect } from 'react';
import NDK, { NDKUser, NDKEvent, NDKNip07Signer, NDKPrivateKeySigner, NDKNip46Signer } from '@nostr-dev-kit/ndk';

// Global NDK instance
const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band', 'wss://relay.f7z.io'],
});

export function useNostr() {
  const [user, setUser] = useState<NDKUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ndk.connect().catch(err => console.error("NDK Connect Error", err));
  }, []);

  const initUser = async (signer: any) => {
    ndk.signer = signer;
    const ndkUser = await signer.user();
    if (ndkUser) {
      ndkUser.ndk = ndk;
      setUser(ndkUser);
      const profileData = await ndkUser.fetchProfile();
      setProfile(profileData);
    }
    return ndkUser;
  };

  const loginNip07 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(window as any).nostr) throw new Error("No Nostr extension found");
      const signer = new NDKNip07Signer();
      await initUser(signer);
    } catch (err: any) {
      setError(err.message || "NIP-07 Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

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
      // For NIP-46, we need a local signer first (can be ephemeral)
      const localSigner = NDKPrivateKeySigner.generate();
      const remoteUser = new NDKUser({ npub: bunkerUri.split('@')[0] }); // Simplified parsing
      const signer = new NDKNip46Signer(ndk, bunkerUri, localSigner);
      
      signer.on("authUrl", (url: string) => {
        window.open(url, '_blank');
      });

      await signer.blockUntilReady();
      await initUser(signer);
    } catch (err: any) {
      setError(err.message || "Remote Signer failed");
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
    loginNip07,
    loginPrivateKey,
    loginRemote,
    logout,
    fetchComments,
    postComment,
    ndk
  };
}
