import React, { useState } from "react";
import GameSelector from "@/components/GameSelector";
import Blackjack from "@/components/games/Blackjack";
import Slots from "@/components/games/Slots";
import Roulette from "@/components/games/Roulette";
import Dice from "@/components/games/Dice";
import CoinFlip from "@/components/games/CoinFlip";
import LeaderboardTable from "@/components/LeaderboardTable";
import UserStats from "@/components/UserStats";
import { useQuery } from "@tanstack/react-query";

type GameType = "blackjack" | "slots" | "roulette" | "dice" | "coinflip";

const Home: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>("blackjack");
  
  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  // Fetch leaderboard data
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/leaderboard'],
    retry: false,
  });
  
  // Fetch user statistics if user is logged in
  const { data: statistics = [] } = useQuery({
    queryKey: ['/api/statistics', user?.id],
    enabled: !!user,
    retry: false,
  });
  
  // Render the selected game component
  const renderGame = () => {
    switch (selectedGame) {
      case "blackjack":
        return <Blackjack />;
      case "slots":
        return <Slots />;
      case "roulette":
        return <Roulette />;
      case "dice":
        return <Dice />;
      case "coinflip":
        return <CoinFlip />;
      default:
        return <Blackjack />;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Game Selector */}
      <GameSelector selectedGame={selectedGame} onSelectGame={setSelectedGame} />
      
      {/* Game Container */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 mb-8">
        {renderGame()}
      </div>
      
      {/* Other Games Preview - Only show if a game is selected */}
      {selectedGame && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {selectedGame !== "slots" && (
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-montserrat font-semibold">Slots</h3>
                <button 
                  className="bg-primary hover:bg-primary-dark transition-colors px-4 py-1 rounded-full font-montserrat font-medium text-sm"
                  onClick={() => setSelectedGame("slots")}
                >
                  Play Now
                </button>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-neutral-800 p-4 rounded-lg inline-flex">
                  <div className="bg-black rounded-md h-24 w-16 mx-1 flex items-center justify-center overflow-hidden border border-neutral-700">
                    <span className="text-4xl">🍒</span>
                  </div>
                  <div className="bg-black rounded-md h-24 w-16 mx-1 flex items-center justify-center overflow-hidden border border-neutral-700">
                    <span className="text-4xl">7️⃣</span>
                  </div>
                  <div className="bg-black rounded-md h-24 w-16 mx-1 flex items-center justify-center overflow-hidden border border-neutral-700">
                    <span className="text-4xl">🍒</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-3 text-sm text-neutral-400">
                Spin the reels and match symbols to win!
              </div>
            </div>
          )}
          
          {selectedGame !== "roulette" && (
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-montserrat font-semibold">Roulette</h3>
                <button 
                  className="bg-primary hover:bg-primary-dark transition-colors px-4 py-1 rounded-full font-montserrat font-medium text-sm"
                  onClick={() => setSelectedGame("roulette")}
                >
                  Play Now
                </button>
              </div>
              
              <div className="flex justify-center">
                <div className="rounded-full bg-green-800 h-32 w-32 border-4 border-yellow-700 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-2 border-yellow-600"></div>
                  <div className="rounded-full bg-red-600 h-4 w-4 absolute bottom-4 left-1/2 transform -translate-x-1/2"></div>
                  <div className="text-accent font-bold font-montserrat text-xl">36</div>
                </div>
              </div>
              
              <div className="text-center mt-3 text-sm text-neutral-400">
                Place bets on numbers, colors, or combinations!
              </div>
            </div>
          )}
          
          {selectedGame !== "dice" && (
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-montserrat font-semibold">Dice</h3>
                <button 
                  className="bg-primary hover:bg-primary-dark transition-colors px-4 py-1 rounded-full font-montserrat font-medium text-sm"
                  onClick={() => setSelectedGame("dice")}
                >
                  Play Now
                </button>
              </div>
              
              <div className="flex justify-center gap-6">
                <div className="bg-white h-16 w-16 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-3 grid-rows-3 gap-1 h-12 w-12">
                    <div className="rounded-full bg-black"></div>
                    <div></div>
                    <div className="rounded-full bg-black"></div>
                    <div></div>
                    <div className="rounded-full bg-black"></div>
                    <div></div>
                    <div className="rounded-full bg-black"></div>
                    <div></div>
                    <div className="rounded-full bg-black"></div>
                  </div>
                </div>
                
                <div className="bg-white h-16 w-16 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-3 grid-rows-3 gap-1 h-12 w-12">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div className="rounded-full bg-black"></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-3 text-sm text-neutral-400">
                Roll the dice and bet on the outcome!
              </div>
            </div>
          )}
          
          {selectedGame !== "coinflip" && (
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-montserrat font-semibold">Coin Flip</h3>
                <button 
                  className="bg-primary hover:bg-primary-dark transition-colors px-4 py-1 rounded-full font-montserrat font-medium text-sm"
                  onClick={() => setSelectedGame("coinflip")}
                >
                  Play Now
                </button>
              </div>
              
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-yellow-500 border-4 border-yellow-600 flex items-center justify-center font-bold text-neutral-800 font-montserrat text-lg">
                  HEADS
                </div>
              </div>
              
              <div className="text-center mt-3 text-sm text-neutral-400">
                Pick heads or tails and flip to win!
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Leaderboard and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <LeaderboardTable leaderboard={leaderboard} />
        </div>
        
        <div>
          <UserStats user={user} statistics={statistics} />
        </div>
      </div>
    </div>
  );
};

export default Home;
