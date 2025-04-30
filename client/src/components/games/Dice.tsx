import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";

interface DiceProps {
  type: DiceType;
  value: number;
  rolling: boolean;
}

const Dice: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // User data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  // Game state
  const [diceType, setDiceType] = useState<DiceType>("d6");
  const [prediction, setPrediction] = useState<number>(1);
  const [betAmount, setBetAmount] = useState<string>("");
  const [rolling, setRolling] = useState<boolean>(false);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [result, setResult] = useState<"" | "win" | "lose">("");
  const [winAmount, setWinAmount] = useState<number>(0);
  
  // Get max value based on dice type
  const getMaxValue = (type: DiceType): number => {
    switch (type) {
      case "d4": return 4;
      case "d6": return 6;
      case "d8": return 8;
      case "d10": return 10;
      case "d12": return 12;
      case "d20": return 20;
      default: return 6;
    }
  };
  
  // Handle dice roll
  const diceMutation = useMutation({
    mutationFn: async ({ diceType, prediction, bet }: { diceType: DiceType, prediction: number, bet: number }) => {
      return await apiRequest("POST", "/api/games/dice", { diceType, prediction, bet });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      
      // Start rolling animation
      setRolling(true);
      
      // After a delay, show the result
      setTimeout(() => {
        setRolling(false);
        setDiceValue(data.result);
        setResult(data.outcome);
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
      }, 1500); // Time to roll
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setRolling(false);
    }
  });
  
  const handleRoll = () => {
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
    
    diceMutation.mutate({ diceType, prediction, bet });
  };
  
  // Reset the game
  const handleNewGame = () => {
    setResult("");
    setBetAmount("");
    setWinAmount(0);
  };
  
  // Generate array of numbers for prediction select
  const predictionOptions = Array.from({ length: getMaxValue(diceType) }, (_, i) => i + 1);
  
  // Render dice based on type and value
  const renderDice = ({ type, value, rolling }: DiceProps) => {
    // For simple dice with dots (d6)
    if (type === "d6") {
      // Map of dice faces for d6
      const dotPositions = {
        1: [{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }],
        2: [
          { top: "25%", left: "25%" },
          { bottom: "25%", right: "25%" }
        ],
        3: [
          { top: "25%", left: "25%" },
          { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
          { bottom: "25%", right: "25%" }
        ],
        4: [
          { top: "25%", left: "25%" },
          { top: "25%", right: "25%" },
          { bottom: "25%", left: "25%" },
          { bottom: "25%", right: "25%" }
        ],
        5: [
          { top: "25%", left: "25%" },
          { top: "25%", right: "25%" },
          { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
          { bottom: "25%", left: "25%" },
          { bottom: "25%", right: "25%" }
        ],
        6: [
          { top: "25%", left: "25%" },
          { top: "25%", right: "25%" },
          { top: "50%", left: "25%" },
          { top: "50%", right: "25%" },
          { bottom: "25%", left: "25%" },
          { bottom: "25%", right: "25%" }
        ]
      };
      
      return (
        <motion.div
          animate={
            rolling
              ? { rotateX: [0, 360, 720, 1080], rotateY: [0, 360, 720, 1080] }
              : {}
          }
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="w-24 h-24 bg-white rounded-lg shadow-lg relative"
        >
          {dotPositions[value as keyof typeof dotPositions].map((pos, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-black rounded-full"
              style={pos}
            />
          ))}
        </motion.div>
      );
    }
    
    // For numbered dice (d4, d8, d10, d12, d20)
    return (
      <motion.div
        animate={
          rolling
            ? { rotateX: [0, 360, 720, 1080], rotateY: [0, 360, 720, 1080] }
            : {}
        }
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className={`w-24 h-24 bg-white text-black font-bold text-3xl flex items-center justify-center shadow-lg ${
          type === "d4" 
            ? "rounded-b-lg" 
            : type === "d8" 
              ? "rounded-lg transform rotate-45" 
              : type === "d20" 
                ? "rounded-full" 
                : "rounded-lg"
        }`}
      >
        {value}
      </motion.div>
    );
  };
  
  return (
    <div className="p-4 md:p-6">
      {/* Game header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-montserrat font-semibold">Dice</h3>
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
      
      {/* Dice game */}
      <div className="flex flex-col items-center justify-center">
        {/* Payouts info */}
        <div className="mb-6 bg-neutral-800 p-3 rounded-lg text-sm text-neutral-300 w-full max-w-md text-center">
          <p className="mb-2">Select your dice type and predict the outcome.</p>
          <p>Payout = dice max value:1 (e.g. for d20, payout is 20:1)</p>
        </div>
        
        {/* Dice display */}
        <div className="h-40 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${diceType}-${diceValue}-${rolling}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              {renderDice({
                type: diceType,
                value: diceValue,
                rolling
              })}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Result display */}
        <AnimatePresence>
          {result && !rolling && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 text-center"
            >
              <div 
                className={`text-2xl font-bold mb-2 ${
                  result === "win" ? "text-success" : "text-error"
                }`}
              >
                {result === "win" ? "YOU WIN!" : "YOU LOSE!"}
              </div>
              {result === "win" && (
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
        {(!result || result === "") && !rolling && (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Dice type selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dice Type</label>
                  <Select
                    value={diceType}
                    onValueChange={(value) => setDiceType(value as DiceType)}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="Select dice type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="d4">d4</SelectItem>
                      <SelectItem value="d6">d6</SelectItem>
                      <SelectItem value="d8">d8</SelectItem>
                      <SelectItem value="d10">d10</SelectItem>
                      <SelectItem value="d12">d12</SelectItem>
                      <SelectItem value="d20">d20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Prediction selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Prediction</label>
                  <Select
                    value={prediction.toString()}
                    onValueChange={(value) => setPrediction(parseInt(value))}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="Select your prediction" />
                    </SelectTrigger>
                    <SelectContent>
                      {predictionOptions.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                
                {/* Roll button */}
                <Button 
                  onClick={handleRoll}
                  disabled={!betAmount || parseInt(betAmount) <= 0 || diceMutation.isPending}
                  className="w-full bg-primary hover:bg-primary-dark"
                >
                  {diceMutation.isPending ? "Rolling..." : "Roll Dice"}
                </Button>
                
                {/* Payout display */}
                <div className="text-center text-sm text-neutral-400">
                  If you win, you'll get {getMaxValue(diceType)}x your bet
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dice;
