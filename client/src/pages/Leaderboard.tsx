import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import LeaderboardTable from "@/components/LeaderboardTable";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Leaderboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "allTime">("allTime");
  
  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['/api/leaderboard', timeRange],
    retry: false,
  });
  
  // Fetch game distribution data
  const { data: gameDistribution = [], isLoading: isLoadingDistribution } = useQuery({
    queryKey: ['/api/games/distribution'],
    retry: false,
  });
  
  // Create sample game distribution data if not available
  const pieData = gameDistribution.length > 0 ? gameDistribution : [
    { name: "Blackjack", value: 35, color: "#4CAF50" },
    { name: "Slots", value: 25, color: "#2196F3" },
    { name: "Roulette", value: 20, color: "#F44336" },
    { name: "Dice", value: 12, color: "#FF9800" },
    { name: "Coin Flip", value: 8, color: "#9C27B0" }
  ];
  
  const COLORS = ["#4CAF50", "#2196F3", "#F44336", "#FF9800", "#9C27B0"];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-montserrat font-bold mb-1">Leaderboard</h1>
        <p className="text-neutral-400">See who's winning big at Rocket Casino</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-montserrat font-semibold flex items-center">
              <span className="material-icons text-accent mr-2">leaderboard</span>
              Top Players
            </CardTitle>
            
            <div className="flex">
              <button 
                className={`px-3 py-1 rounded-l-full font-montserrat font-medium text-sm ${
                  timeRange === "daily" ? "bg-primary text-white" : "bg-neutral-800 text-neutral-300"
                }`}
                onClick={() => setTimeRange("daily")}
              >
                Daily
              </button>
              <button 
                className={`px-3 py-1 font-montserrat font-medium text-sm ${
                  timeRange === "weekly" ? "bg-primary text-white" : "bg-neutral-800 text-neutral-300"
                }`}
                onClick={() => setTimeRange("weekly")}
              >
                Weekly
              </button>
              <button 
                className={`px-3 py-1 rounded-r-full font-montserrat font-medium text-sm ${
                  timeRange === "allTime" ? "bg-primary text-white" : "bg-neutral-800 text-neutral-300"
                }`}
                onClick={() => setTimeRange("allTime")}
              >
                All Time
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLeaderboard ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <LeaderboardTable leaderboard={leaderboard} />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-montserrat font-semibold flex items-center">
              <span className="material-icons text-primary-light mr-2">pie_chart</span>
              Game Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoadingDistribution ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Usage']}
                      contentStyle={{ backgroundColor: '#212121', borderColor: '#424242' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="biggest-wins" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="biggest-wins">Biggest Wins</TabsTrigger>
          <TabsTrigger value="biggest-bets">Biggest Bets</TabsTrigger>
          <TabsTrigger value="longest-streaks">Longest Streaks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="biggest-wins">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-montserrat font-semibold">
                All-Time Biggest Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-neutral-400 border-b border-neutral-800">
                        <th className="pb-2 font-medium">Player</th>
                        <th className="pb-2 font-medium">Game</th>
                        <th className="pb-2 font-medium">Bet</th>
                        <th className="pb-2 font-medium">Win</th>
                        <th className="pb-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-primary-light flex items-center justify-center text-white text-xs font-medium">TB</div>
                            <span className="ml-2 font-medium">TopBettor</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Slots</td>
                        <td className="py-3">25,000</td>
                        <td className="py-3 text-success font-medium">+250,000</td>
                        <td className="py-3 text-neutral-400">May 15, 2023</td>
                      </tr>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">LC</div>
                            <span className="ml-2 font-medium">LuckyCat</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Blackjack</td>
                        <td className="py-3">20,000</td>
                        <td className="py-3 text-success font-medium">+150,000</td>
                        <td className="py-3 text-neutral-400">April 28, 2023</td>
                      </tr>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">RG</div>
                            <span className="ml-2 font-medium">RoyalGambler</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Roulette</td>
                        <td className="py-3">10,000</td>
                        <td className="py-3 text-success font-medium">+120,000</td>
                        <td className="py-3 text-neutral-400">June 3, 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="biggest-bets">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-montserrat font-semibold">
                All-Time Biggest Bets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-neutral-400 border-b border-neutral-800">
                        <th className="pb-2 font-medium">Player</th>
                        <th className="pb-2 font-medium">Game</th>
                        <th className="pb-2 font-medium">Bet</th>
                        <th className="pb-2 font-medium">Outcome</th>
                        <th className="pb-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium">HS</div>
                            <span className="ml-2 font-medium">HighStakes</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Roulette</td>
                        <td className="py-3 font-medium">100,000</td>
                        <td className="py-3 text-error font-medium">LOSS</td>
                        <td className="py-3 text-neutral-400">March 20, 2023</td>
                      </tr>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">BB</div>
                            <span className="ml-2 font-medium">BigBaller</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Blackjack</td>
                        <td className="py-3 font-medium">75,000</td>
                        <td className="py-3 text-success font-medium">WIN</td>
                        <td className="py-3 text-neutral-400">May 12, 2023</td>
                      </tr>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">WB</div>
                            <span className="ml-2 font-medium">WhaleBet</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Slots</td>
                        <td className="py-3 font-medium">50,000</td>
                        <td className="py-3 text-success font-medium">WIN</td>
                        <td className="py-3 text-neutral-400">June 17, 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="longest-streaks">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-montserrat font-semibold">
                Longest Win Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-neutral-400 border-b border-neutral-800">
                        <th className="pb-2 font-medium">Player</th>
                        <th className="pb-2 font-medium">Game</th>
                        <th className="pb-2 font-medium">Streak</th>
                        <th className="pb-2 font-medium">Total Profit</th>
                        <th className="pb-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">LC</div>
                            <span className="ml-2 font-medium">LuckyCat</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Blackjack</td>
                        <td className="py-3 font-medium">12 wins</td>
                        <td className="py-3 text-success font-medium">+320,500</td>
                        <td className="py-3 text-neutral-400">April 10-12, 2023</td>
                      </tr>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-primary-light flex items-center justify-center text-white text-xs font-medium">TB</div>
                            <span className="ml-2 font-medium">TopBettor</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Roulette</td>
                        <td className="py-3 font-medium">9 wins</td>
                        <td className="py-3 text-success font-medium">+250,000</td>
                        <td className="py-3 text-neutral-400">May 20-21, 2023</td>
                      </tr>
                      <tr className="border-b border-neutral-800 text-sm">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-medium">GK</div>
                            <span className="ml-2 font-medium">GoldenKing</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">Coin Flip</td>
                        <td className="py-3 font-medium">8 wins</td>
                        <td className="py-3 text-success font-medium">+150,000</td>
                        <td className="py-3 text-neutral-400">June 5, 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
