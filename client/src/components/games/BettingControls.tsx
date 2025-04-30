import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface BettingControlsProps {
  onPlaceBet: (amount: number) => void;
  buttonText?: string;
  buttonColor?: string;
}

const BettingControls: React.FC<BettingControlsProps> = ({ 
  onPlaceBet,
  buttonText = "Deal",
  buttonColor = "bg-success hover:bg-green-600 transition-colors"
}) => {
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<string>("");
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  
  // Get user data for balance check
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  const chipValues = [100, 500, 1000, 5000, 10000];
  
  const handleChipSelect = (value: number) => {
    setSelectedChip(value);
    setBetAmount((prev) => {
      const current = parseInt(prev) || 0;
      return (current + value).toString();
    });
  };
  
  const handleClearBet = () => {
    setBetAmount("");
    setSelectedChip(null);
  };
  
  const handlePlaceBet = () => {
    const amount = parseInt(betAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > (user?.balance || 0)) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough chips for this bet",
        variant: "destructive",
      });
      return;
    }
    
    onPlaceBet(amount);
  };
  
  return (
    <div>
      <div className="text-center mb-4 text-sm text-neutral-400">Place Your Bet</div>
      
      {/* Chip selection */}
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        {chipValues.map((value) => (
          <button
            key={value}
            onClick={() => handleChipSelect(value)}
            className={`chip h-12 w-12 rounded-full 
              ${value === 100 ? "bg-blue-600 border-blue-500" : 
                value === 500 ? "bg-green-600 border-green-500" : 
                value === 1000 ? "bg-red-600 border-red-500" : 
                value === 5000 ? "bg-purple-600 border-purple-500" : 
                "bg-yellow-600 border-yellow-500"} 
              flex items-center justify-center text-white font-montserrat font-medium text-sm border-2
              transform transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
          >
            {value >= 1000 ? `${value / 1000}K` : value}
          </button>
        ))}
      </div>
      
      {/* Bet amount input */}
      <div className="flex justify-center gap-3 mb-4">
        <Input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Enter bet amount"
          className="max-w-[200px] bg-neutral-800 border-neutral-700"
          min={1}
          max={user?.balance || 0}
        />
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={handleClearBet}
          className="bg-neutral-800 hover:bg-neutral-700 transition-colors"
        >
          Clear
        </Button>
        <Button
          onClick={handlePlaceBet}
          className={buttonColor}
          disabled={!betAmount || parseInt(betAmount) <= 0}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default BettingControls;
