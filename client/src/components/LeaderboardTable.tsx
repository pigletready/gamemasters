import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LeaderboardUser } from "@/lib/types";

interface LeaderboardTableProps {
  leaderboard: LeaderboardUser[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ leaderboard }) => {
  // Function to get initials from username
  const getInitials = (username: string): string => {
    return username.substring(0, 2).toUpperCase();
  };
  
  // Function to format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Function to format win rate
  const formatWinRate = (rate: number): string => {
    return `${Math.round(rate)}%`;
  };
  
  // Function to get color for avatar based on position
  const getAvatarColor = (index: number): string => {
    if (index === 0) return "bg-primary-light";
    if (index === 1) return "bg-blue-500";
    if (index === 2) return "bg-green-500";
    if (index === 3) return "bg-red-500";
    if (index === 4) return "bg-orange-500";
    return "bg-neutral-600";
  };
  
  // Function to get trophy icon based on position
  const getTrophy = (index: number): React.ReactNode => {
    if (index === 0) return <span className="material-icons text-accent mr-1 text-base">emoji_events</span>;
    if (index === 1) return <span className="material-icons text-neutral-400 mr-1 text-base">emoji_events</span>;
    if (index === 2) return <span className="material-icons text-yellow-600 mr-1 text-base">emoji_events</span>;
    return null;
  };
  
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-montserrat font-semibold flex items-center">
          <span className="material-icons text-accent mr-2">leaderboard</span>
          Leaderboard
        </h3>
        <div className="flex">
          <button className="bg-neutral-800 px-3 py-1 rounded-l-full font-montserrat font-medium text-sm text-neutral-300">
            Daily
          </button>
          <button className="bg-primary px-3 py-1 rounded-r-full font-montserrat font-medium text-sm">
            All Time
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-neutral-800">
              <TableHead className="text-neutral-400">Rank</TableHead>
              <TableHead className="text-neutral-400">Player</TableHead>
              <TableHead className="text-neutral-400">Winnings</TableHead>
              <TableHead className="text-neutral-400">Games</TableHead>
              <TableHead className="text-neutral-400">Win Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((player, index) => (
              <TableRow key={player.id} className="border-b border-neutral-800">
                <TableCell className="font-montserrat font-medium">
                  <div className="flex items-center">
                    {getTrophy(index)}
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`h-6 w-6 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white text-xs font-medium`}>
                      {getInitials(player.username)}
                    </div>
                    <span className="ml-2 font-medium">{player.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-success font-medium">
                  +{formatNumber(player.totalProfit)}
                </TableCell>
                <TableCell>{player.totalGames}</TableCell>
                <TableCell>{formatWinRate(player.winRate)}</TableCell>
              </TableRow>
            ))}
            
            {/* If no leaderboard data, show empty state */}
            {leaderboard.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-neutral-400">
                  No leaderboard data available yet. Start playing games to appear here!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
