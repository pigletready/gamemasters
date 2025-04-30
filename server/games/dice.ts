import { storage } from "../storage";

// Dice types and their sides
const diceTypes = {
  "d4": 4,
  "d6": 6,
  "d8": 8,
  "d10": 10,
  "d12": 12,
  "d20": 20
};

/**
 * Handle dice roll
 */
async function roll(userId: number, diceType: string, prediction: number, bet: number) {
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  if (bet <= 0) {
    throw new Error("Bet must be greater than 0");
  }
  
  if (bet > user.balance) {
    throw new Error("Insufficient balance");
  }
  
  // Validate dice type
  if (!diceTypes[diceType as keyof typeof diceTypes]) {
    throw new Error("Invalid dice type");
  }
  
  const sides = diceTypes[diceType as keyof typeof diceTypes];
  
  // Validate prediction
  if (prediction < 1 || prediction > sides) {
    throw new Error(`Prediction must be between 1 and ${sides}`);
  }
  
  // Deduct bet amount
  await storage.updateUserBalance(userId, user.balance - bet);
  
  // Roll the dice
  const result = Math.floor(Math.random() * sides) + 1;
  
  // Check if prediction is correct
  const win = result === prediction;
  
  // Calculate winnings (odds are sides:1)
  // E.g., for d20, payout is 20:1
  const winAmount = win ? bet * sides : 0;
  const profit = win ? winAmount - bet : -bet;
  const outcome = win ? "win" : "lose";
  
  // Update user balance if they won
  if (win) {
    await storage.updateUserBalance(userId, user.balance - bet + winAmount);
  }
  
  // Save game record
  const gameRecord = await storage.createGameRecord({
    userId,
    gameType: "dice",
    bet,
    outcome,
    profit
  });
  
  // Save dice game details
  await storage.storeDiceGame(
    gameRecord.id,
    diceType,
    prediction,
    result
  );
  
  return {
    diceType,
    prediction,
    result,
    outcome,
    winAmount: profit
  };
}

export default {
  roll
};
