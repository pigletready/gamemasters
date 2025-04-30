import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

// Roulette wheel numbers in order
const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Numbers by color
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
const greenNumbers = [0];

// Helper to get color of a number
const getNumberColor = (num: number): string => {
  if (redNumbers.includes(num)) return "red";
  if (blackNumbers.includes(num)) return "black";
  return "green";
};

const Roulette: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // User data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  // Game state
  const [spinning, setSpinning] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<string>("");
  const [betAmount, setBetAmount] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<"" | "win" | "lose">("");
  const [selectedTab, setSelectedTab] = useState<"numbers" | "colors" | "sections">("numbers");
  
  // Ball position for animation
  const [ballPosition, setBallPosition] = useState<number>(0);
  
  // Handle roulette bet
  const rouletteMutation = useMutation({
    mutationFn: async ({ prediction, bet }: { prediction: string, bet: number }) => {
      return await apiRequest("POST", "/api/games/roulette", { prediction, bet });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      
      // Start spinning animation
      setSpinning(true);
      
      // After a delay, show the result
      setTimeout(() => {
        setResult(data.result);
        setBallPosition(wheelNumbers.indexOf(data.result));
        
        // After spinning completes
        setTimeout(() => {
          setSpinning(false);
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
        }, 1500); // Time after spinning stops to show result
      }, 3000); // Time to spin
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
  
  const handlePlaceBet = () => {
    if (!prediction) {
      toast({
        title: "Error",
        description: "Please select a prediction",
        variant: "destructive",
      });
      return;
    }
    
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
    
    rouletteMutation.mutate({ prediction, bet });
  };
  
  const handleSelectPrediction = (value: string) => {
    setPrediction(value);
  };
  
  // Reset the game
  const handleNewGame = () => {
    setPrediction("");
    setBetAmount("");
    setResult(null);
    setWinAmount(0);
    setGameResult("");
  };
  
  // Color section selectors
  const colorSelectors = [
    { name: "Red", value: "red", className: "bg-red-600" },
    { name: "Black", value: "black", className: "bg-black" },
    { name: "Green", value: "green", className: "bg-green-600" },
  ];
  
  // Section selectors
  const sectionSelectors = [
    { name: "1st Half (1-18)", value: "1stHalf" },
    { name: "2nd Half (19-36)", value: "2ndHalf" },
    { name: "1st Dozen (1-12)", value: "1st12" },
    { name: "2nd Dozen (13-24)", value: "2nd12" },
    { name: "3rd Dozen (25-36)", value: "3rd12" },
    { name: "1st Column", value: "1stCol" },
    { name: "2nd Column", value: "2ndCol" },
    { name: "3rd Column", value: "3rdCol" },
  ];
  
  return (
    <div className="p-4 md:p-6">
      {/* Game header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-montserrat font-semibold">Roulette</h3>
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
      
      {/* Roulette wheel */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative mb-6">
          <div className="rounded-full bg-green-800 h-64 w-64 border-4 border-yellow-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-600"></div>
            
            {/* Spinning wheel */}
            <motion.div
              className="absolute inset-0"
              animate={{ 
                rotate: spinning ? 360 * 5 + (ballPosition * (360 / wheelNumbers.length)) : 0 
              }}
              transition={{ 
                duration: spinning ? 3 : 0,
                ease: "easeOut"
              }}
            >
              {wheelNumbers.map((num, index) => (
                <div
                  key={`wheel-${num}`}
                  className={`absolute w-1 h-20 top-1/2 left-1/2 -translate-y-full -translate-x-1/2 origin-bottom ${
                    getNumberColor(num) === "red" 
                      ? "bg-red-600" 
                      : getNumberColor(num) === "black" 
                        ? "bg-black" 
                        : "bg-green-600"
                  }`}
                  style={{ 
                    transform: `translate(-50%, -100%) rotate(${index * (360 / wheelNumbers.length)}deg)` 
                  }}
                >
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 text-xs font-bold text-white"
                    style={{ transform: `rotate(${-index * (360 / wheelNumbers.length)}deg)` }}
                  >
                    {num}
                  </div>
                </div>
              ))}
            </motion.div>
            
            {/* Ball */}
            <div className="rounded-full bg-white h-4 w-4 absolute top-4 left-1/2 transform -translate-x-1/2 z-10"></div>
            
            {/* Result display in the center */}
            {result !== null && !spinning && (
              <div 
                className={`text-3xl font-bold font-montserrat z-20 ${
                  getNumberColor(result) === "red" 
                    ? "text-red-500" 
                    : getNumberColor(result) === "black" 
                      ? "text-black" 
                      : "text-green-500"
                }`}
              >
                {result}
              </div>
            )}
          </div>
          
          {/* Ball pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-10 flex flex-col items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div className="w-1 h-6 bg-yellow-500"></div>
          </div>
        </div>
        
        {/* Game result */}
        <AnimatePresence>
          {gameResult && !spinning && (
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
        {(!gameResult || gameResult === "") && !spinning && (
          <Card className="w-full max-w-2xl">
            <div className="p-4">
              {/* Betting tabs */}
              <div className="flex border-b border-neutral-700 mb-4">
                <button 
                  className={`px-4 py-2 font-medium text-sm ${
                    selectedTab === "numbers" 
                      ? "border-b-2 border-primary text-primary" 
                      : "text-neutral-400"
                  }`}
                  onClick={() => setSelectedTab("numbers")}
                >
                  Numbers
                </button>
                <button 
                  className={`px-4 py-2 font-medium text-sm ${
                    selectedTab === "colors" 
                      ? "border-b-2 border-primary text-primary" 
                      : "text-neutral-400"
                  }`}
                  onClick={() => setSelectedTab("colors")}
                >
                  Colors
                </button>
                <button 
                  className={`px-4 py-2 font-medium text-sm ${
                    selectedTab === "sections" 
                      ? "border-b-2 border-primary text-primary" 
                      : "text-neutral-400"
                  }`}
                  onClick={() => setSelectedTab("sections")}
                >
                  Sections
                </button>
              </div>
              
              {/* Number selection */}
              {selectedTab === "numbers" && (
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-4">
                  <button 
                    className={`p-2 rounded text-center font-bold bg-green-600 hover:bg-green-500 ${
                      prediction === "0" ? "ring-2 ring-yellow-400" : ""
                    }`}
                    onClick={() => handleSelectPrediction("0")}
                  >
                    0
                  </button>
                  
                  {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                    <button 
                      key={`num-${num}`}
                      className={`p-2 rounded text-center font-bold ${
                        redNumbers.includes(num) 
                          ? "bg-red-600 hover:bg-red-500" 
                          : "bg-black hover:bg-neutral-800"
                      } ${
                        prediction === num.toString() ? "ring-2 ring-yellow-400" : ""
                      }`}
                      onClick={() => handleSelectPrediction(num.toString())}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Color selection */}
              {selectedTab === "colors" && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {colorSelectors.map(color => (
                    <button 
                      key={`color-${color.value}`}
                      className={`p-3 rounded flex items-center justify-center ${color.className} ${
                        prediction === color.value ? "ring-2 ring-yellow-400" : ""
                      }`}
                      onClick={() => handleSelectPrediction(color.value)}
                    >
                      <span className="font-bold text-white">{color.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Section selection */}
              {selectedTab === "sections" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {sectionSelectors.map(section => (
                    <button 
                      key={`section-${section.value}`}
                      className={`p-2 rounded bg-neutral-800 hover:bg-neutral-700 ${
                        prediction === section.value ? "ring-2 ring-yellow-400" : ""
                      }`}
                      onClick={() => handleSelectPrediction(section.value)}
                    >
                      {section.name}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Bet amount and place bet */}
              <div className="flex flex-col md:flex-row gap-3 mt-4">
                <div className="flex-grow">
                  <Input
                    type="number"
                    placeholder="Bet amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                    min={1}
                    max={user?.balance || 0}
                  />
                </div>
                <Button 
                  onClick={handlePlaceBet}
                  disabled={!prediction || !betAmount || parseInt(betAmount) <= 0 || rouletteMutation.isPending}
                  className="bg-primary hover:bg-primary-dark"
                >
                  {rouletteMutation.isPending ? "Placing Bet..." : "Place Bet"}
                </Button>
              </div>
              
              {/* Quick bet buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button 
                  variant="outline"
                  className="text-xs"
                  onClick={() => setBetAmount("100")}
                >
                  +100
                </Button>
                <Button 
                  variant="outline"
                  className="text-xs"
                  onClick={() => setBetAmount("500")}
                >
                  +500
                </Button>
                <Button 
                  variant="outline"
                  className="text-xs"
                  onClick={() => setBetAmount("1000")}
                >
                  +1000
                </Button>
                <Button 
                  variant="outline"
                  className="text-xs"
                  onClick={() => setBetAmount("5000")}
                >
                  +5000
                </Button>
                <Button 
                  variant="outline"
                  className="text-xs"
                  onClick={() => setBetAmount(user?.balance?.toString() || "0")}
                >
                  Max
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Roulette;
