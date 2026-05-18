import { useState, useEffect } from 'react';

export function useWebLN() {
  const [webln, setWebln] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  
  // Expose virtual tsats balance
  const [tsatsBalance, setTsatsBalance] = useState<number>(() => {
    return Number(localStorage.getItem('sandbox_tsats')) || 0;
  });

  useEffect(() => {
    localStorage.setItem('sandbox_tsats', String(tsatsBalance));
  }, [tsatsBalance]);

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
          activateSandbox();
        }
      } else {
        activateSandbox();
      }
    };
    initWebLN();
  }, []);

  const activateSandbox = () => {
    console.warn("[ SYSTEM ] No WebLN extension detected. Activating Virtual Sandbox Wallet.");
    setIsSandbox(true);
    setIsConnected(true);
    // Initialize starting balance if never set
    if (!localStorage.getItem('sandbox_tsats_initialized')) {
      setTsatsBalance(50000);
      localStorage.setItem('sandbox_tsats_initialized', 'true');
    }
  };

  const payInvoice = async (invoice: string, amount: number = 0) => {
    if (isSandbox) {
      if (tsatsBalance >= amount) {
        setTsatsBalance((prev) => prev - amount);
        console.log(`[VIRTUAL WALLET] Paid ${amount} tsats.`);
        return { preimage: "sandbox_mock_preimage_" + Date.now() };
      } else {
        throw new Error("[VIRTUAL WALLET] Insufficient tsats balance.");
      }
    }
    
    if (!webln) throw new Error("WebLN not initialized");
    return await webln.sendPayment(invoice);
  };

  return { webln, isConnected, isSandbox, payInvoice, tsatsBalance, setTsatsBalance };
}
