import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PlayingCard from "./PlayingCard";
import BettingControls from "./BettingControls";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const Blackjack: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Game state
  const [gameState, setGameState] = useState<"betting" | "playing" | "finished">("betting");
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [dealerCards, setDealerCards] = useState<string[]>([]);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [dealerScore, setDealerScore] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [result, setResult] = useState<"" | "win" | "lose" | "push">("");
  const [winAmount, setWinAmount] = useState<number>(0);
  
  // Handle blackjack game actions
  const blackjackMutation = useMutation({
    mutationFn: async ({ action, bet }: { action: string, bet?: number }) => {
      return await apiRequest("POST", "/api/games/blackjack", { action, bet });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      
      setPlayerCards(data.playerCards);
      setDealerCards(data.dealerCards);
      setPlayerScore(data.playerScore);
      setDealerScore(data.dealerScore);
      
      if (data.gameState === "playing") {
        setGameState("playing");
      } else if (data.gameState === "finished") {
        setGameState("finished");
        setResult(data.result);
        setWinAmount(data.winAmount);
        
        // Show toast based on result
        if (data.result === "win") {
          toast({
            title: "You win!",
            description: `You won ${data.winAmount} chips`,
            variant: "default",
          });
        } else if (data.result === "lose") {
          toast({
            title: "You lose!",
            description: "Better luck next time",
            variant: "destructive",
          });
        } else if (data.result === "push") {
          toast({
            title: "Push!",
            description: "Your bet has been returned",
            variant: "default",
          });
        }
      }
      
      // Refresh user data to update balance
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  const handleDeal = (bet: number) => {
    setBetAmount(bet);
    blackjackMutation.mutate({ action: "new", bet });
  };
  
  const handleHit = () => {
    blackjackMutation.mutate({ action: "hit" });
  };
  
  const handleStand = () => {
    blackjackMutation.mutate({ action: "stand" });
  };
  
  const handleDouble = () => {
    blackjackMutation.mutate({ action: "double" });
  };
  
  const handleNewGame = () => {
    setGameState("betting");
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerScore(0);
    setDealerScore(0);
    setBetAmount(0);
    setResult("");
    setWinAmount(0);
  };
  
  return (
    <div className="p-4 md:p-6">
      {/* Game header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-montserrat font-semibold">Blackjack</h3>
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
      
      {/* Game board */}
      <div className="relative">
        {/* Dealer area */}
        <div className="mb-8">
          <div className="text-sm text-neutral-400 mb-2 flex items-center">
            <span className="material-icons text-xs mr-1">person</span>
            Dealer's Hand
            {gameState !== "betting" && (
              <span className="ml-2 text-neutral-300">({dealerScore})</span>
            )}
          </div>
          <div className="flex items-center">
            <AnimatePresence>
              {dealerCards.map((card, index) => (
                <motion.div
                  key={`dealer-${index}`}
                  initial={{ opacity: 0, y: -50, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mr-2"
                >
                  <PlayingCard 
                    card={card} 
                    hidden={gameState === "playing" && index === 0} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Player area */}
        <div>
          <div className="text-sm text-neutral-400 mb-2 flex items-center">
            <span className="material-icons text-xs mr-1">person</span>
            Your Hand
            {gameState !== "betting" && (
              <span className="ml-2 text-neutral-300">({playerScore})</span>
            )}
          </div>
          <div className="flex items-center">
            <AnimatePresence>
              {playerCards.map((card, index) => (
                <motion.div
                  key={`player-${index}`}
                  initial={{ opacity: 0, y: 50, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="mr-2"
                >
                  <PlayingCard card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Game result overlay */}
        {gameState === "finished" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className={`text-5xl font-bold font-montserrat ${
                result === "win" ? "text-success" : 
                result === "lose" ? "text-error" : "text-warning"
              }`}
            >
              {result === "win" ? "WIN!" : result === "lose" ? "LOSE!" : "PUSH!"}
              {result === "win" && (
                <div className="text-2xl mt-2 text-center text-primary">+{winAmount}</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Game controls */}
      {gameState === "playing" && (
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button 
            onClick={handleHit}
            disabled={blackjackMutation.isPending}
            className="bg-primary hover:bg-primary-dark transition-colors"
          >
            Hit
          </Button>
          <Button 
            onClick={handleStand}
            disabled={blackjackMutation.isPending}
            className="bg-primary hover:bg-primary-dark transition-colors"
          >
            Stand
          </Button>
          <Button 
            onClick={handleDouble}
            disabled={blackjackMutation.isPending || playerCards.length > 2}
            className="bg-secondary hover:bg-secondary-dark transition-colors"
          >
            Double Down
          </Button>
        </div>
      )}
      
      {/* New game button only visible when game is finished */}
      {gameState === "finished" && (
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleNewGame}
            className="bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            New Game
          </Button>
        </div>
      )}
      
      {/* Betting controls only visible when in betting state */}
      {gameState === "betting" && (
        <div className="mt-8">
          <BettingControls onPlaceBet={handleDeal} />
        </div>
      )}
    </div>
  );
};

export default Blackjack;
