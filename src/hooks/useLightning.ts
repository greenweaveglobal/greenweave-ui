import { useState, useCallback } from 'react';

export function useLightning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zap = useCallback(async (amount: number, address: string = "greenweave@getalby.com") => {
    setLoading(true);
    setError(null);
    try {
      const webln = (window as any).webln;
      
      // Try WebLN first
      if (webln) {
        await webln.enable();
        // In a real app, you'd fetch an invoice and call webln.sendPayment(bolt11)
        console.log(`Zapping ${amount} sats to ${address} via WebLN`);
        return true;
      }

      // Check for NWC (Nostr Wallet Connect) if WebLN is missing
      const nwcUri = localStorage.getItem('nwc_uri');
      if (nwcUri) {
        console.log(`Zapping ${amount} sats to ${address} via NWC`);
        // Here you would use an NWC library to send the payment
        // For now, we simulate the persistent connection check
        return true;
      }

      throw new Error("No Lightning wallet (WebLN/NWC) detected.");
    } catch (err: any) {
      setError(err.message || "Lightning Zap failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveNwc = useCallback((uri: string) => {
    if (uri.startsWith('nostr+walletconnect:')) {
      localStorage.setItem('nwc_uri', uri);
      return true;
    }
    return false;
  }, []);

  return {
    zap,
    saveNwc,
    loading,
    error
  };
}
