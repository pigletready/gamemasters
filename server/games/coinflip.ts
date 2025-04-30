import { storage } from "../storage";

/**
 * Handle coin flip
 */
async function flip(userId: number, prediction: string, bet: number) {
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
  
  // Validate prediction
  if (prediction !== "heads" && prediction !== "tails") {
    throw new Error("Prediction must be 'heads' or 'tails'");
  }
  
  // Deduct bet amount
  await storage.updateUserBalance(userId, user.balance - bet);
  
  // Flip the coin
  const result = Math.random() < 0.5 ? "heads" : "tails";
  
  // Check if prediction is correct
  const win = result === prediction;
  
  // Calculate winnings (odds are 1:1)
  const winAmount = win ? bet * 2 : 0; // Win amount includes original bet
  const profit = win ? bet : -bet; // Profit is winnings minus original bet
  const outcome = win ? "win" : "lose";
  
  // Update user balance if they won
  if (win) {
    await storage.updateUserBalance(userId, user.balance - bet + winAmount);
  }
  
  // Save game record
  const gameRecord = await storage.createGameRecord({
    userId,
    gameType: "coinflip",
    bet,
    outcome,
    profit
  });
  
  // Save coinflip game details
  await storage.storeCoinflipGame(
    gameRecord.id,
    prediction,
    result
  );
  
  return {
    prediction,
    result,
    outcome,
    winAmount: profit
  };
}

export default {
  flip
};
