import { 
  users, type User, type InsertUser, 
  gameRecords, type GameRecord, type InsertGameRecord,
  blackjackGames, slotGames, rouletteGames, diceGames, coinflipGames,
  type LeaderboardUser, type GameStatistics
} from "@shared/schema";
import { db } from './db';
import { eq, desc, sql, and } from 'drizzle-orm';

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  
  // Game record methods
  createGameRecord(record: InsertGameRecord): Promise<GameRecord>;
  getGameRecords(userId: number, limit: number): Promise<GameRecord[]>;
  getGameStatistics(userId: number): Promise<GameStatistics[]>;
  
  // Leaderboard methods
  getLeaderboard(limit?: number): Promise<LeaderboardUser[]>;
  
  // Game specific methods for storage
  storeBlackjackGame(
    gameRecordId: number, 
    playerCards: string, 
    dealerCards: string, 
    playerScore: number, 
    dealerScore: number, 
    isBlackjack: boolean
  ): Promise<void>;
  
  storeSlotGame(
    gameRecordId: number, 
    reels: string, 
    payline: string, 
    multiplier: number
  ): Promise<void>;
  
  storeRouletteGame(
    gameRecordId: number, 
    prediction: string, 
    result: number
  ): Promise<void>;
  
  storeDiceGame(
    gameRecordId: number, 
    diceType: string, 
    prediction: number, 
    result: number
  ): Promise<void>;
  
  storeCoinflipGame(
    gameRecordId: number, 
    prediction: string, 
    result: string
  ): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with a default user if needed
    this.createDefaultUserIfNotExists();
  }
  
  private async createDefaultUserIfNotExists() {
    // Check if player1 exists
    const existingUser = await this.getUserByUsername("player1");
    if (!existingUser) {
      // Create a default user
      await this.createUser({
        username: "player1",
        password: "password123"
      });
      console.log("Created default user: player1");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      balance: 10000,
      totalGames: 0,
      totalWins: 0,
      biggestWin: 0,
      totalProfit: 0
    }).returning();
    
    return user;
  }
  
  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  // Game record methods
  async createGameRecord(record: InsertGameRecord): Promise<GameRecord> {
    // Create the game record
    const [gameRecord] = await db.insert(gameRecords).values({
      ...record,
      timestamp: new Date()
    }).returning();
    
    // Update user statistics
    const user = await this.getUser(record.userId);
    if (user) {
      const isWin = record.outcome === 'win';
      await db.update(users)
        .set({
          totalGames: user.totalGames + 1,
          totalWins: user.totalWins + (isWin ? 1 : 0),
          biggestWin: isWin && record.profit > user.biggestWin ? record.profit : user.biggestWin,
          totalProfit: user.totalProfit + record.profit
        })
        .where(eq(users.id, user.id));
    }
    
    return gameRecord;
  }
  
  async getGameRecords(userId: number, limit: number): Promise<GameRecord[]> {
    return await db.select()
      .from(gameRecords)
      .where(eq(gameRecords.userId, userId))
      .orderBy(desc(gameRecords.timestamp))
      .limit(limit);
  }
  
  async getGameStatistics(userId: number): Promise<GameStatistics[]> {
    const gameTypes = ["blackjack", "slots", "roulette", "dice", "coinflip"];
    const stats: GameStatistics[] = [];
    
    for (const gameType of gameTypes) {
      // Get total games for this type
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(gameRecords)
        .where(and(
          eq(gameRecords.userId, userId),
          eq(gameRecords.gameType, gameType)
        ));
      
      // Get wins for this type
      const [winsResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(gameRecords)
        .where(and(
          eq(gameRecords.userId, userId),
          eq(gameRecords.gameType, gameType),
          eq(gameRecords.outcome, 'win')
        ));
      
      const totalGames = totalResult?.count || 0;
      const wins = winsResult?.count || 0;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
      
      stats.push({
        gameType,
        totalGames,
        wins,
        winRate
      });
    }
    
    return stats;
  }
  
  // Leaderboard methods
  async getLeaderboard(limit: number = 10): Promise<LeaderboardUser[]> {
    const allUsers = await db.select().from(users);
    
    // Calculate winRate for each user
    const leaderboardUsers: LeaderboardUser[] = allUsers.map((user: User) => ({
      id: user.id,
      username: user.username,
      totalGames: user.totalGames,
      winRate: user.totalGames > 0 ? (user.totalWins / user.totalGames) * 100 : 0,
      totalProfit: user.totalProfit
    }));
    
    // Sort by profit and return limited results
    return leaderboardUsers
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, limit);
  }
  
  // Game specific methods
  async storeBlackjackGame(
    gameRecordId: number, 
    playerCards: string, 
    dealerCards: string, 
    playerScore: number, 
    dealerScore: number, 
    isBlackjack: boolean
  ): Promise<void> {
    await db.insert(blackjackGames).values({
      gameRecordId,
      playerCards,
      dealerCards,
      playerScore,
      dealerScore,
      isBlackjack
    });
  }
  
  async storeSlotGame(
    gameRecordId: number, 
    reels: string, 
    payline: string, 
    multiplier: number
  ): Promise<void> {
    await db.insert(slotGames).values({
      gameRecordId,
      reels,
      payline,
      multiplier
    });
  }
  
  async storeRouletteGame(
    gameRecordId: number, 
    prediction: string, 
    result: number
  ): Promise<void> {
    await db.insert(rouletteGames).values({
      gameRecordId,
      prediction,
      result
    });
  }
  
  async storeDiceGame(
    gameRecordId: number, 
    diceType: string, 
    prediction: number, 
    result: number
  ): Promise<void> {
    await db.insert(diceGames).values({
      gameRecordId,
      diceType,
      prediction,
      result
    });
  }
  
  async storeCoinflipGame(
    gameRecordId: number, 
    prediction: string, 
    result: string
  ): Promise<void> {
    await db.insert(coinflipGames).values({
      gameRecordId,
      prediction,
      result
    });
  }
}

export const storage = new DatabaseStorage();