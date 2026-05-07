import { useState, useCallback } from 'react';

export function useLightning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zap = useCallback(async (amount: number, address: string = "greenweave@getalby.com") => {
    setLoading(true);
    setError(null);
    try {
      const webln = (window as any).webln;
      if (!webln) {
        throw new Error("No Lightning wallet (WebLN) detected. Please install Alby or a compatible wallet.");
      }

      await webln.enable();
      
      // Attempt to use lnurl-pay if it's an address, or just a static invoice request if we had a backend
      // For this demo, we'll simulate the payment request or use sendPayment if we had a bolt11
      // Since we don't have a backend to generate invoices, we'll try to use makeInvoice if supported or sendPayment
      
      // In a real app, you'd fetch an invoice from the 'address' via LNURL
      // Here we simulate the flow:
      console.log(`Zapping ${amount} sats to ${address}`);
      
      // Example WebLN call (will fail if not properly configured in browser but following standard)
      // await webln.sendPayment(bolt11); 
      
      // For the sake of the demo, we show the intent
      return true;
    } catch (err: any) {
      setError(err.message || "Lightning Zap failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    zap,
    loading,
    error
  };
}
