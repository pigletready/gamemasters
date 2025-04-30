import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type CoinSide = "heads" | "tails";

const CoinFlip: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // User data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  // Game state
  const [prediction, setPrediction] = useState<CoinSide>("heads");
  const [betAmount, setBetAmount] = useState<string>("");
  const [flipping, setFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [gameResult, setGameResult] = useState<"" | "win" | "lose">("");
  const [winAmount, setWinAmount] = useState<number>(0);
  const [flipCount, setFlipCount] = useState<number>(0); // For animation key
  
  // Handle coin flip
  const coinflipMutation = useMutation({
    mutationFn: async ({ prediction, bet }: { prediction: CoinSide, bet: number }) => {
      return await apiRequest("POST", "/api/games/coinflip", { prediction, bet });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      
      // Start flipping animation
      setFlipping(true);
      setFlipCount(prev => prev + 1);
      
      // After a delay, show the result
      setTimeout(() => {
        setFlipping(false);
        setResult(data.result);
        setGameResult(data.outcome);
        setWinAmount(data.winAmount);
        
        // Show toast based on result
        if (data.outcome === "win") {
          toast({
            title: "You win!",
            description: `You won ${data.winAmount} chips`,
            variant: "default",
          });
        } else {
          toast({
            title: "You lose!",
            description: "Better luck next time",
            variant: "destructive",
          });
        }
        
        // Refresh user data to update balance
        queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      }, 2000); // Time to flip
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setFlipping(false);
    }
  });
  
  const handleFlip = () => {
    if (!betAmount || parseInt(betAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    const bet = parseInt(betAmount);
    
    if (bet > (user?.balance || 0)) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }
    
    coinflipMutation.mutate({ prediction, bet });
  };
  
  // Reset the game
  const handleNewGame = () => {
    setGameResult("");
    setBetAmount("");
    setWinAmount(0);
    setResult(null);
  };
  
  // Render coin
  const renderCoin = () => {
    return (
      <motion.div
        key={flipCount}
        className="relative h-36 w-36 rounded-full"
        animate={flipping ? { rotateY: [0, 1080] } : {}}
        transition={
          flipping
            ? { duration: 2, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        {/* Heads side */}
        <div
          className={`absolute inset-0 h-full w-full rounded-full bg-yellow-500 border-4 border-yellow-600 flex items-center justify-center font-bold text-neutral-800 font-montserrat text-lg backface-hidden ${
            result === "tails" && !flipping ? "rotate-y-180" : ""
          }`}
        >
          HEADS
        </div>
        
        {/* Tails side */}
        <div
          className={`absolute inset-0 h-full w-full rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center font-bold text-neutral-800 font-montserrat text-lg backface-hidden rotate-y-180 ${
            result === "tails" && !flipping ? "rotate-y-0" : ""
          }`}
        >
          TAILS
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="p-4 md:p-6">
      {/* Game header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-montserrat font-semibold">Coin Flip</h3>
        <div className="flex items-center text-sm">
          <button className="text-neutral-400 hover:text-white mr-4 flex items-center">
            <span className="material-icons text-sm mr-1">help_outline</span>
            Rules
          </button>
          {betAmount && parseInt(betAmount) > 0 && (
            <div className="bg-neutral-800 rounded-full py-1 px-3 flex items-center">
              <span className="material-icons text-xs mr-1 text-accent">account_balance</span>
              <span className="text-accent font-medium">
                {parseInt(betAmount).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Coin flip game */}
      <div className="flex flex-col items-center justify-center">
        {/* Payouts info */}
        <div className="mb-6 bg-neutral-800 p-3 rounded-lg text-sm text-neutral-300 w-full max-w-md text-center">
          <p>Pick heads or tails and flip to win! Odds: 1:1</p>
        </div>
        
        {/* Coin display */}
        <div className="h-48 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            {renderCoin()}
          </AnimatePresence>
        </div>
        
        {/* Result display */}
        <AnimatePresence>
          {gameResult && !flipping && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 text-center"
            >
              <div 
                className={`text-2xl font-bold mb-2 ${
                  gameResult === "win" ? "text-success" : "text-error"
                }`}
              >
                {gameResult === "win" ? "YOU WIN!" : "YOU LOSE!"}
              </div>
              {gameResult === "win" && (
                <div className="text-xl text-primary font-bold">
                  +{winAmount.toLocaleString()} chips
                </div>
              )}
              <Button 
                onClick={handleNewGame}
                className="mt-3 bg-neutral-800 hover:bg-neutral-700"
              >
                New Bet
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Betting controls */}
        {(!gameResult || gameResult === "") && !flipping && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Prediction selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Prediction</label>
                  <RadioGroup 
                    value={prediction} 
                    onValueChange={(value) => setPrediction(value as CoinSide)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="heads" id="heads" />
                      <Label htmlFor="heads" className="cursor-pointer">Heads</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tails" id="tails" />
                      <Label htmlFor="tails" className="cursor-pointer">Tails</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Bet amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bet Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter bet amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                    min={1}
                    max={user?.balance || 0}
                  />
                  
                  {/* Quick bet buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setBetAmount("100")}
                    >
                      +100
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setBetAmount("500")}
                    >
                      +500
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setBetAmount("1000")}
                    >
                      +1000
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setBetAmount((parseInt(betAmount) || 0) + 5000 + "")}
                    >
                      +5000
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setBetAmount(user?.balance?.toString() || "0")}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                
                {/* Flip button */}
                <Button 
                  onClick={handleFlip}
                  disabled={!betAmount || parseInt(betAmount) <= 0 || coinflipMutation.isPending}
                  className="w-full bg-primary hover:bg-primary-dark"
                >
                  {coinflipMutation.isPending ? "Flipping..." : "Flip Coin"}
                </Button>
                
                {/* Payout display */}
                <div className="text-center text-sm text-neutral-400">
                  If you win, you'll get 2x your bet
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoinFlip;
