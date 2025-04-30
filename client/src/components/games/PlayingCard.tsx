import React from "react";
import { motion } from "framer-motion";

interface PlayingCardProps {
  card: string;
  hidden?: boolean;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card, hidden = false }) => {
  // If the card is hidden, show the card back
  if (hidden) {
    return (
      <div className="bg-red-600 text-white rounded-lg h-28 w-20 relative flex items-center justify-center overflow-hidden border border-neutral-300 shadow-md">
        <div className="absolute inset-0 bg-red-700 m-2 rounded-md flex items-center justify-center">
          <div className="text-2xl transform rotate-45 font-bold">RC</div>
        </div>
      </div>
    );
  }
  
  // Extract the value and suit from the card string (e.g., "2H" -> "2" and "H")
  const value = card.slice(0, -1);
  const suit = card.slice(-1);
  
  // Determine color based on suit
  const isRed = suit === "H" || suit === "D";
  const textColor = isRed ? "text-red-600" : "text-black";
  
  // Map suit to symbol
  const suitSymbol = {
    "H": "♥",
    "D": "♦",
    "C": "♣",
    "S": "♠",
  }[suit] || "?";
  
  // Map value to display value
  const displayValue = {
    "A": "A",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    "J": "J",
    "Q": "Q",
    "K": "K",
  }[value] || value;
  
  return (
    <motion.div 
      initial={{ opacity: 0, rotateY: 180 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg h-28 w-20 relative flex items-center justify-center overflow-hidden border border-neutral-300 shadow-md"
    >
      <div className={`absolute top-1 left-1 text-sm font-medium ${textColor}`}>
        {displayValue}
      </div>
      <div className={`text-2xl ${textColor}`}>
        {suitSymbol}
      </div>
      <div className={`absolute bottom-1 right-1 text-sm font-medium ${textColor}`}>
        {displayValue}
      </div>
    </motion.div>
  );
};

export default PlayingCard;
