import { useState, useEffect } from 'react';

export function useWebLN() {
  const [webln, setWebln] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initWebLN = async () => {
      if (typeof window !== 'undefined' && (window as any).webln) {
        try {
          await (window as any).webln.enable();
          setWebln((window as any).webln);
          setIsConnected(true);
          console.log("[WEBLN ORACLE] Lightning Wallet Connected.");
        } catch (err) {
          console.warn("[WEBLN ORACLE] User rejected connection or wallet locked.");
        }
      }
    };
    initWebLN();
  }, []);

  const payInvoice = async (invoice: string) => {
    if (!webln) throw new Error("WebLN not initialized");
    return await webln.sendPayment(invoice);
  };

  return { webln, isConnected, payInvoice };
}
