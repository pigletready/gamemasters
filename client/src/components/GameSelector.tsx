import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type GameType = "blackjack" | "slots" | "roulette" | "dice" | "coinflip";

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (game: GameType) => void;
}

interface GameOption {
  id: GameType;
  name: string;
  icon: string;
}

const GameSelector: React.FC<GameSelectorProps> = ({ selectedGame, onSelectGame }) => {
  const games: GameOption[] = [
    { id: "blackjack", name: "Blackjack", icon: "style" },
    { id: "slots", name: "Slots", icon: "smart_toy" },
    { id: "roulette", name: "Roulette", icon: "donut_large" },
    { id: "dice", name: "Dice", icon: "casino" },
    { id: "coinflip", name: "Coin Flip", icon: "monetization_on" },
  ];
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-montserrat font-semibold mb-4 flex items-center">
        <span className="material-icons mr-2 text-primary-light">casino</span>
        Games
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`bg-neutral-900 hover:bg-neutral-800 transition-colors p-3 rounded-lg flex flex-col items-center ${
              selectedGame === game.id ? "border border-primary" : ""
            }`}
          >
            <span className={`material-icons mb-1 ${
              selectedGame === game.id ? "text-primary-light" : "text-neutral-400"
            }`}>
              {game.icon}
            </span>
            <span className="font-montserrat font-medium text-sm">{game.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameSelector;
