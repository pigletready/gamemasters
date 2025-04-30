import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(10000),
  totalGames: integer("total_games").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  biggestWin: integer("biggest_win").notNull().default(0),
  totalProfit: integer("total_profit").notNull().default(0),
});

// Game record schema
export const gameRecords = pgTable("game_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameType: text("game_type").notNull(), // blackjack, slots, roulette, dice, coinflip
  bet: integer("bet").notNull(),
  outcome: text("outcome").notNull(), // win, loss, push
  profit: integer("profit").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Game specific schemas
export const blackjackGames = pgTable("blackjack_games", {
  id: serial("id").primaryKey(),
  gameRecordId: integer("game_record_id").notNull().references(() => gameRecords.id),
  playerCards: text("player_cards").notNull(),
  dealerCards: text("dealer_cards").notNull(),
  playerScore: integer("player_score").notNull(),
  dealerScore: integer("dealer_score").notNull(),
  isBlackjack: boolean("is_blackjack").notNull().default(false),
});

export const slotGames = pgTable("slot_games", {
  id: serial("id").primaryKey(),
  gameRecordId: integer("game_record_id").notNull().references(() => gameRecords.id),
  reels: text("reels").notNull(),
  payline: text("payline").notNull(),
  multiplier: real("multiplier").notNull(),
});

export const rouletteGames = pgTable("roulette_games", {
  id: serial("id").primaryKey(),
  gameRecordId: integer("game_record_id").notNull().references(() => gameRecords.id),
  prediction: text("prediction").notNull(),
  result: integer("result").notNull(),
});

export const diceGames = pgTable("dice_games", {
  id: serial("id").primaryKey(),
  gameRecordId: integer("game_record_id").notNull().references(() => gameRecords.id),
  diceType: text("dice_type").notNull(), // d4, d6, d8, d10, d12, d20
  prediction: integer("prediction").notNull(),
  result: integer("result").notNull(),
});

export const coinflipGames = pgTable("coinflip_games", {
  id: serial("id").primaryKey(),
  gameRecordId: integer("game_record_id").notNull().references(() => gameRecords.id),
  prediction: text("prediction").notNull(), // heads, tails
  result: text("result").notNull(), // heads, tails
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameRecordSchema = createInsertSchema(gameRecords).pick({
  userId: true,
  gameType: true,
  bet: true,
  outcome: true,
  profit: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GameRecord = typeof gameRecords.$inferSelect;
export type InsertGameRecord = z.infer<typeof insertGameRecordSchema>;

export type BlackjackGame = typeof blackjackGames.$inferSelect;
export type SlotGame = typeof slotGames.$inferSelect;
export type RouletteGame = typeof rouletteGames.$inferSelect;
export type DiceGame = typeof diceGames.$inferSelect;
export type CoinflipGame = typeof coinflipGames.$inferSelect;

// Game specific input types
export const blackjackActionSchema = z.object({
  action: z.enum(["hit", "stand", "double", "new"]),
  bet: z.number().optional(),
});

export const slotSpinSchema = z.object({
  bet: z.number(),
});

export const rouletteBetSchema = z.object({
  prediction: z.string(),
  bet: z.number(),
});

export const diceBetSchema = z.object({
  diceType: z.enum(["d4", "d6", "d8", "d10", "d12", "d20"]),
  prediction: z.number(),
  bet: z.number(),
});

export const coinflipBetSchema = z.object({
  prediction: z.enum(["heads", "tails"]),
  bet: z.number(),
});

// Leaderboard types
export type LeaderboardUser = {
  id: number;
  username: string;
  totalGames: number;
  winRate: number;
  totalProfit: number;
};

// Game statistics types
export type GameStatistics = {
  gameType: string;
  totalGames: number;
  wins: number;
  winRate: number;
};
