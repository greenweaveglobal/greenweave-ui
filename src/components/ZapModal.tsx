import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Zap, Check } from "lucide-react";
import { CREATOR_LN_ADDRESS } from "../constants";

interface ZapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName?: string;
}

const PRESET_AMOUNTS = [21, 210, 2100];

export default function ZapModal({ isOpen, onClose, targetName = "the GreenWeave Project" }: ZapModalProps) {
  const [amount, setAmount] = useState<number>(21);
  const [comment, setComment] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleZap = async () => {
    setIsConfirming(true);
    // Simulate invoice generation and payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConfirming(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-zinc-950 border-4 border-[#F59E0B] p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden font-mono"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-10 bg-[#39FF14] flex flex-col items-center justify-center text-black text-center p-6"
                >
                  <Check size={64} className="mb-4 animate-bounce" />
                  <div className="text-2xl font-black uppercase tracking-widest mb-2">ZAP DEPLOYED</div>
                  <div className="text-sm font-bold uppercase tracking-tight">
                    {amount} Sats successfully routed to <br/>{targetName}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 text-[#F59E0B]">
                <Zap size={24} fill="currentColor" />
                <span className="text-xl font-black uppercase tracking-widest">NIP-57 ZAP</span>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-[#F59E0B] font-black uppercase tracking-widest mb-2 block">
                  Project Entity
                </label>
                <div className="text-white font-black text-lg truncate mb-1">
                  {targetName}
                </div>
                <div className="text-[10px] text-zinc-500 break-all font-mono">
                  {CREATOR_LN_ADDRESS}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#F59E0B] font-black uppercase tracking-widest mb-3 block">
                  Select Amount (Sats)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-3 text-sm font-black border-2 transition-all ${
                        amount === amt 
                          ? "bg-[#F59E0B] text-black border-[#F59E0B]" 
                          : "bg-black text-zinc-500 border-zinc-800 hover:border-[#F59E0B]/50"
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <input 
                  type="number"
                  placeholder="CUSTOM AMOUNT"
                  className="w-full bg-black border-2 border-zinc-800 p-4 mt-2 text-white font-mono text-sm focus:border-[#F59E0B] outline-none transition-all placeholder:text-zinc-700"
                  value={amount === 0 ? "" : amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-[10px] text-[#F59E0B] font-black uppercase tracking-widest mb-2 block">
                  Message (Optional)
                </label>
                <textarea 
                  placeholder="GODSPEED TO THE GREENWEAVE..."
                  className="w-full bg-black border-2 border-zinc-800 p-4 text-white font-mono text-xs focus:border-[#F59E0B] outline-none transition-all placeholder:text-zinc-700 h-24 resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button 
                onClick={handleZap}
                disabled={isConfirming || amount <= 0}
                className="w-full py-5 bg-[#F59E0B] text-black text-sm font-black uppercase tracking-[0.25em] transition-all active:scale-95 disabled:opacity-50 shadow-[0_4px_15px_rgba(245,158,11,0.4)]"
              >
                {isConfirming ? "[ GENERATING INVOICE... ]" : `[ CONFIRM ZAP: ${amount} SATS ]`}
              </button>
            </div>

            <div className="mt-6 text-center">
              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                Powered by Lightning Network <br/> & Nostr NIP-57 Prototol
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
