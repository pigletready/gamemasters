import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BettingControls from "./BettingControls";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SlotSymbol {
  symbol: string;
  value: number;
}

const slotSymbols: SlotSymbol[] = [
  { symbol: "🍒", value: 1 },
  { symbol: "🍋", value: 2 },
  { symbol: "🍊", value: 3 },
  { symbol: "🍇", value: 4 },
  { symbol: "🔔", value: 5 },
  { symbol: "💎", value: 6 },
  { symbol: "7️⃣", value: 7 },
  { symbol: "🎰", value: 8 },
];

const Slots: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Game state
  const [spinning, setSpinning] = useState<boolean>(false);
  const [reels, setReels] = useState<string[][]>([
    ["🍒", "🍋", "🍊"],
    ["🍇", "🔔", "💎"],
    ["7️⃣", "🎰", "🍒"],
  ]);
  const [result, setResult] = useState<"" | "win" | "lose">("");
  const [betAmount, setBetAmount] = useState<number>(0);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [payline, setPayline] = useState<string[]>([]);
  const [multiplier, setMultiplier] = useState<number>(0);
  
  // References for animations
  const spinTimers = useRef<NodeJS.Timeout[]>([]);
  
  // Handle slot spin
  const slotMutation = useMutation({
    mutationFn: async (bet: number) => {
      return await apiRequest("POST", "/api/games/slots", { bet });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      
      // Start spinning animation
      setSpinning(true);
      
      // Clear any existing timers
      spinTimers.current.forEach(timer => clearTimeout(timer));
      spinTimers.current = [];
      
      // After a delay, show the result
      const spinDuration = 2000; // 2 seconds
      
      // Schedule the end of spinning
      const timer = setTimeout(() => {
        setReels(JSON.parse(data.reels));
        setPayline(JSON.parse(data.payline));
        setMultiplier(data.multiplier);
        setResult(data.result);
        setWinAmount(data.winAmount);
        setSpinning(false);
        
        // Show toast based on result
        if (data.result === "win") {
          toast({
            title: "You win!",
            description: `You won ${data.winAmount} chips with a ${data.multiplier}x multiplier!`,
            variant: "default",
          });
        } else {
          toast({
            title: "No win",
            description: "Better luck next time",
            variant: "destructive",
          });
        }
        
        // Refresh user data to update balance
        queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      }, spinDuration);
      
      spinTimers.current.push(timer);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setSpinning(false);
    }
  });
  
  const handleSpin = (bet: number) => {
    setBetAmount(bet);
    slotMutation.mutate(bet);
  };
  
  return (
    <div className="p-4 md:p-6">
      {/* Game header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-montserrat font-semibold">Slots</h3>
        <div className="flex items-center text-sm">
          <button className="text-neutral-400 hover:text-white mr-4 flex items-center">
            <span className="material-icons text-sm mr-1">help_outline</span>
            Rules
          </button>
          {betAmount > 0 && (
            <div className="bg-neutral-800 rounded-full py-1 px-3 flex items-center">
              <span className="material-icons text-xs mr-1 text-accent">account_balance</span>
              <span className="text-accent font-medium">
                {betAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Slot machine */}
      <div className="flex flex-col items-center justify-center">
        {/* Payouts info */}
        <div className="mb-4 bg-neutral-800 p-3 rounded-lg text-sm text-neutral-300 grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🎰🎰🎰</span>
            <span>500:1</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">7️⃣7️⃣7️⃣</span>
            <span>50:1</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">💎💎💎</span>
            <span>25:1</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">🔔🔔🔔</span>
            <span>10:1</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">🍇🍇🍇</span>
            <span>5:1</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">🍊🍊🍊</span>
            <span>3:1</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">🍋🍋🍋</span>
            <span>2:1</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">🍒🍒🍒</span>
            <span>1:1</span>
          </div>
        </div>
        
        {/* Slot reels */}
        <div className="bg-neutral-800 p-6 rounded-lg mb-4">
          <div className="flex justify-center mb-2">
            <div className="flex">
              {reels.map((reel, reelIndex) => (
                <div 
                  key={`reel-${reelIndex}`} 
                  className="slot-reel bg-black rounded-md h-24 w-20 mx-1 flex items-center justify-center overflow-hidden border border-neutral-700"
                >
                  <motion.div
                    animate={{
                      y: spinning ? [0, -500, -1000, -1500, -2000] : 0,
                      transition: {
                        duration: spinning ? 2 : 0,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      }
                    }}
                  >
                    <div className="text-4xl">{reel[1]}</div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Win line */}
          <div className="h-2 bg-primary-light rounded-full opacity-50"></div>
        </div>
        
        {/* Result display */}
        <AnimatePresence>
          {result === "win" && !spinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mb-4"
            >
              <div className="text-success text-xl font-bold mb-1">WIN!</div>
              <div className="text-primary text-2xl font-bold font-montserrat">
                +{winAmount.toLocaleString()} ({multiplier}x)
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Betting/Spin controls */}
        <div className="mt-4 w-full max-w-md">
          {spinning ? (
            <Button 
              disabled
              className="w-full py-6 bg-neutral-700 text-lg"
            >
              <span className="animate-spin mr-2">🎰</span>
              Spinning...
            </Button>
          ) : (
            <BettingControls 
              onPlaceBet={handleSpin} 
              buttonText="SPIN" 
              buttonColor="bg-success hover:bg-green-600"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Slots;
