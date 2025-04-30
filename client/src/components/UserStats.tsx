import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GameStatistics } from "@/lib/types";

interface UserStatsProps {
  user: any;
  statistics: GameStatistics[];
}

const UserStats: React.FC<UserStatsProps> = ({ user, statistics }) => {
  if (!user) {
    return null;
  }
  
  // Function to format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Calculate win rate
  const winRate = user.totalGames > 0 
    ? Math.round((user.totalWins / user.totalGames) * 100) 
    : 0;
  
  // Game icons mapping
  const gameIcons: Record<string, string> = {
    blackjack: "style",
    slots: "smart_toy",
    roulette: "donut_large",
    dice: "casino",
    coinflip: "monetization_on"
  };
  
  // Get color based on win rate
  const getWinRateColor = (rate: number): string => {
    if (rate >= 60) return "bg-success";
    if (rate >= 45) return "bg-warning";
    return "bg-error";
  };
  
  // Get text color based on win rate
  const getWinRateTextColor = (rate: number): string => {
    if (rate >= 60) return "text-success";
    if (rate >= 45) return "text-warning";
    return "text-error";
  };
  
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 md:p-6">
      <h3 className="text-lg font-montserrat font-semibold mb-4 flex items-center">
        <span className="material-icons text-primary-light mr-2">analytics</span>
        Your Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-800 rounded-lg p-3">
          <div className="text-xs text-neutral-400 mb-1">Total Games</div>
          <div className="text-2xl font-montserrat font-medium">{user.totalGames}</div>
        </div>
        
        <div className="bg-neutral-800 rounded-lg p-3">
          <div className="text-xs text-neutral-400 mb-1">Win Rate</div>
          <div className={`text-2xl font-montserrat font-medium ${getWinRateTextColor(winRate)}`}>
            {winRate}%
          </div>
        </div>
        
        <div className="bg-neutral-800 rounded-lg p-3">
          <div className="text-xs text-neutral-400 mb-1">Biggest Win</div>
          <div className="text-2xl font-montserrat font-medium text-success">
            {formatNumber(user.biggestWin)}
          </div>
        </div>
        
        <div className="bg-neutral-800 rounded-lg p-3">
          <div className="text-xs text-neutral-400 mb-1">Total Profit</div>
          <div className={`text-2xl font-montserrat font-medium ${
            user.totalProfit > 0 ? "text-success" : user.totalProfit < 0 ? "text-error" : ""
          }`}>
            {user.totalProfit > 0 ? "+" : ""}{formatNumber(user.totalProfit)}
          </div>
        </div>
      </div>
      
      <h4 className="text-sm font-montserrat font-semibold mb-2">Game Performance</h4>
      <div className="space-y-3">
        {statistics.length > 0 ? (
          statistics.map((game) => (
            <div key={game.gameType} className="flex items-center">
              <span className={`material-icons mr-2 ${
                game.gameType === "blackjack" ? "text-primary-light" : "text-neutral-400"
              }`}>
                {gameIcons[game.gameType] || "casino"}
              </span>
              <div className="flex-grow">
                <div className="text-sm font-medium capitalize">{game.gameType}</div>
                <Progress 
                  value={game.winRate} 
                  max={100}
                  className="h-2 bg-neutral-800"
                  indicatorClassName={getWinRateColor(game.winRate)}
                />
              </div>
              <div className="text-sm font-medium ml-2">
                {Math.round(game.winRate)}%
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-neutral-400 text-center py-4">
            No game statistics available yet. Play some games to see your performance.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStats;
