import { useState, useCallback } from 'react';

export function useLightning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zap = useCallback(async (amount: number, address: string = "greenweave@getalby.com") => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Invoice from Lightning Address
      const parts = address.split('@');
      if (parts.length !== 2) throw new Error("Invalid Lightning Address format. Expected user@domain.com");
      const [user, domain] = parts;
      
      let pr = "";
      try {
        const res = await fetch(`https://${domain}/.well-known/lnurlp/${user}`);
        const lnurlp = await res.json();
        
        const callbackObj = new URL(lnurlp.callback);
        callbackObj.searchParams.append("amount", (amount * 1000).toString());
        const invRes = await fetch(callbackObj.toString());
        const invoiceData = await invRes.json();
        
        if (!invoiceData.pr) throw new Error("No pr found");
        pr = invoiceData.pr;
      } catch (err) {
        throw new Error("Failed to generate Lightning invoice for this address.");
      }

      // 2. Pay Invoice via WebLN
      const webln = (window as any).webln;
      if (webln) {
        await webln.enable();
        await webln.sendPayment(pr);
        console.log(`[WEBLN] Successfully paid ${amount} sats to ${address}`);
        return true;
      }

      throw new Error("No WebLN provider found. Please install the Alby extension.");
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
