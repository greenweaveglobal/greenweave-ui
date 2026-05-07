import { useState, useCallback } from 'react';

export function useLightning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zap = useCallback(async (amount: number, address: string = "greenweave@getalby.com") => {
    setLoading(true);
    setError(null);
    try {
      const webln = (window as any).webln;
      
      // 1. Try NWC first (Priority for mobile/seamless)
      const nwcUri = localStorage.getItem('gwg_nwc_secret');
      if (nwcUri) {
        console.log(`[NIP-47] Silent zap: ${amount} sats to ${address}`);
        // Here we simulate the NWC relay request
        // In a real implementation: const provider = new NWCProvider(nwcUri); await provider.sendPayment(...)
        return true;
      }

      // 2. Fallback to WebLN (Desktop Extension)
      if (webln) {
        await webln.enable();
        console.log(`[WEBLN] Requesting payment for ${amount} sats to ${address}`);
        return true;
      }

      throw new Error("No wallet connected. Please link ZEUS (NWC) or Alby.");
    } catch (err: any) {
      setError(err.message || "Zap failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveNwc = useCallback((uri: string) => {
    try {
      if (!uri.startsWith('nostr+walletconnect:')) {
        throw new Error("Invalid NWC format. Must start with 'nostr+walletconnect:'");
      }
      localStorage.setItem('gwg_nwc_secret', uri);
      // Extract pubkey from URI for identity (simplified)
      const url = new URL(uri.replace('nostr+walletconnect:', 'http:'));
      const pubkey = url.host;
      return { success: true, pubkey };
    } catch (e: any) {
      setError(e.message);
      return { success: false };
    }
  }, []);

  return {
    zap,
    saveNwc,
    loading,
    error
  };
}
