import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import UserStats from "@/components/UserStats";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Profile: React.FC = () => {
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  // Fetch user statistics if user is logged in
  const { data: statistics = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/statistics', user?.id],
    enabled: !!user,
    retry: false,
  });
  
  // Fetch game records
  const { data: gameRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['/api/games/records', user?.id],
    enabled: !!user,
    retry: false,
  });
  
  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-4">You need to log in to view your profile</h2>
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Prepare data for the chart
  const chartData = statistics.map((stat: any) => ({
    name: stat.gameType.charAt(0).toUpperCase() + stat.gameType.slice(1),
    winRate: Math.round(stat.winRate),
    color: stat.winRate > 50 ? "#4CAF50" : stat.winRate > 40 ? "#FFC107" : "#F44336"
  }));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-montserrat font-bold mb-1">
          {user.username}'s Profile
        </h1>
        <p className="text-neutral-400">
          View your gaming statistics and history
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <UserStats user={user} statistics={statistics} />
        </div>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-montserrat font-semibold flex items-center">
              <span className="material-icons text-primary-light mr-2">analytics</span>
              Game Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoadingStats ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#212121', borderColor: '#424242' }}
                      formatter={(value: any) => [`${value}%`, 'Win Rate']}
                    />
                    <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent Games</TabsTrigger>
          <TabsTrigger value="best">Best Wins</TabsTrigger>
          <TabsTrigger value="worst">Worst Losses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-montserrat font-semibold">
                Your Recent Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecords ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : gameRecords.length === 0 ? (
                <p className="text-center py-8 text-neutral-400">
                  You haven't played any games yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-neutral-400 border-b border-neutral-800">
                        <th className="pb-2 font-medium">Game</th>
                        <th className="pb-2 font-medium">Bet</th>
                        <th className="pb-2 font-medium">Outcome</th>
                        <th className="pb-2 font-medium">Profit</th>
                        <th className="pb-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameRecords.map((record: any) => (
                        <tr key={record.id} className="border-b border-neutral-800 text-sm">
                          <td className="py-3 font-medium capitalize">{record.gameType}</td>
                          <td className="py-3">{record.bet}</td>
                          <td className="py-3">
                            <span className={`font-medium ${
                              record.outcome === 'win' 
                                ? 'text-success' 
                                : record.outcome === 'loss' 
                                  ? 'text-error' 
                                  : 'text-warning'
                            }`}>
                              {record.outcome.toUpperCase()}
                            </span>
                          </td>
                          <td className={`py-3 font-medium ${
                            record.profit > 0 
                              ? 'text-success' 
                              : record.profit < 0 
                                ? 'text-error' 
                                : ''
                          }`}>
                            {record.profit > 0 ? '+' : ''}{record.profit}
                          </td>
                          <td className="py-3 text-neutral-400">
                            {new Date(record.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="best">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-montserrat font-semibold">
                Your Best Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecords ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : gameRecords.length === 0 ? (
                <p className="text-center py-8 text-neutral-400">
                  You haven't won any games yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-neutral-400 border-b border-neutral-800">
                        <th className="pb-2 font-medium">Game</th>
                        <th className="pb-2 font-medium">Bet</th>
                        <th className="pb-2 font-medium">Profit</th>
                        <th className="pb-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameRecords
                        .filter((record: any) => record.profit > 0)
                        .sort((a: any, b: any) => b.profit - a.profit)
                        .slice(0, 5)
                        .map((record: any) => (
                          <tr key={record.id} className="border-b border-neutral-800 text-sm">
                            <td className="py-3 font-medium capitalize">{record.gameType}</td>
                            <td className="py-3">{record.bet}</td>
                            <td className="py-3 font-medium text-success">+{record.profit}</td>
                            <td className="py-3 text-neutral-400">
                              {new Date(record.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="worst">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-montserrat font-semibold">
                Your Worst Losses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecords ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : gameRecords.length === 0 ? (
                <p className="text-center py-8 text-neutral-400">
                  You haven't lost any games yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-neutral-400 border-b border-neutral-800">
                        <th className="pb-2 font-medium">Game</th>
                        <th className="pb-2 font-medium">Bet</th>
                        <th className="pb-2 font-medium">Loss</th>
                        <th className="pb-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameRecords
                        .filter((record: any) => record.profit < 0)
                        .sort((a: any, b: any) => a.profit - b.profit)
                        .slice(0, 5)
                        .map((record: any) => (
                          <tr key={record.id} className="border-b border-neutral-800 text-sm">
                            <td className="py-3 font-medium capitalize">{record.gameType}</td>
                            <td className="py-3">{record.bet}</td>
                            <td className="py-3 font-medium text-error">{record.profit}</td>
                            <td className="py-3 text-neutral-400">
                              {new Date(record.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
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

export default Profile;
