// User types
export interface User {
  id: number;
  username: string;
  balance: number;
  totalGames: number;
  totalWins: number;
  biggestWin: number;
  totalProfit: number;
}

// Game record types
export interface GameRecord {
  id: number;
  userId: number;
  gameType: string;
  bet: number;
  outcome: "win" | "lose" | "push";
  profit: number;
  timestamp: Date;
}

// Game specific types
export interface BlackjackGame {
  playerCards: string[];
  dealerCards: string[];
  playerScore: number;
  dealerScore: number;
  bet: number;
  gameState: "betting" | "playing" | "finished";
  result: "" | "win" | "lose" | "push";
  winAmount: number;
}

export interface SlotGame {
  reels: string[];
  payline: string[];
  multiplier: number;
  bet: number;
  result: "win" | "lose";
  winAmount: number;
}

export interface RouletteGame {
  prediction: string;
  result: number;
  outcome: "win" | "lose";
  bet: number;
  winAmount: number;
}

export interface DiceGame {
  diceType: string;
  prediction: number;
  result: number;
  outcome: "win" | "lose";
  bet: number;
  winAmount: number;
}

export interface CoinflipGame {
  prediction: string;
  result: string;
  outcome: "win" | "lose";
  bet: number;
  winAmount: number;
}

// Leaderboard types
export interface LeaderboardUser {
  id: number;
  username: string;
  totalGames: number;
  winRate: number;
  totalProfit: number;
}

// Game statistics types
export interface GameStatistics {
  gameType: string;
  totalGames: number;
  wins: number;
  winRate: number;
}
