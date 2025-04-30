import { storage } from "../storage";

// Slot symbols with their values
const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣", "🎰"];

// Payout multipliers for each symbol combination
const payouts: Record<string, number> = {
  "🍒🍒🍒": 1,   // 1:1
  "🍋🍋🍋": 2,   // 2:1
  "🍊🍊🍊": 3,   // 3:1
  "🍇🍇🍇": 5,   // 5:1
  "🔔🔔🔔": 10,  // 10:1
  "💎💎💎": 25,  // 25:1
  "7️⃣7️⃣7️⃣": 50,  // 50:1
  "🎰🎰🎰": 500, // 500:1
  
  // Pairs (2 matching symbols)
  "🍒🍒": 1,    // 1:1
  "🍋🍋": 1,    // 1:1
  "🍊🍊": 2,    // 2:1
  "🍇🍇": 3,    // 3:1
  "🔔🔔": 5,    // 5:1
  "💎💎": 10,   // 10:1
  "7️⃣7️⃣": 25,   // 25:1
  "🎰🎰": 50,   // 50:1
};

/**
 * Handle slot machine spin
 */
async function spin(userId: number, bet: number) {
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
  
  // Deduct bet amount
  await storage.updateUserBalance(userId, user.balance - bet);
  
  // Spin the reels (3 reels)
  const reels: string[] = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    reels.push(symbols[randomIndex]);
  }
  
  // Check for winning combinations
  let multiplier = 0;
  let payline: string[] = [];
  
  // Check for 3 matching symbols
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    const combo = `${reels[0]}${reels[0]}${reels[0]}`;
    multiplier = payouts[combo] || 0;
    payline = [reels[0], reels[0], reels[0]];
  }
  
  // If no 3-match, check for pairs
  if (multiplier === 0) {
    // Check first two symbols
    if (reels[0] === reels[1]) {
      const combo = `${reels[0]}${reels[0]}`;
      if (payouts[combo]) {
        multiplier = payouts[combo];
        payline = [reels[0], reels[0], ""];
      }
    }
    // Check last two symbols
    else if (reels[1] === reels[2]) {
      const combo = `${reels[1]}${reels[1]}`;
      if (payouts[combo]) {
        multiplier = payouts[combo];
        payline = ["", reels[1], reels[1]];
      }
    }
    // Check first and last symbols
    else if (reels[0] === reels[2]) {
      const combo = `${reels[0]}${reels[0]}`;
      if (payouts[combo]) {
        multiplier = payouts[combo];
        payline = [reels[0], "", reels[0]];
      }
    }
  }
  
  // Calculate win amount
  const winAmount = bet * multiplier;
  const outcome = winAmount > 0 ? "win" : "lose";
  
  // Update user balance if they won
  if (winAmount > 0) {
    await storage.updateUserBalance(userId, user.balance - bet + winAmount);
  }
  
  // Save game record
  const profit = winAmount - bet;
  const gameRecord = await storage.createGameRecord({
    userId,
    gameType: "slots",
    bet,
    outcome,
    profit
  });
  
  // Save slot game details
  await storage.storeSlotGame(
    gameRecord.id,
    JSON.stringify(reels),
    JSON.stringify(payline),
    multiplier
  );
  
  return {
    reels: JSON.stringify(reels),
    payline: JSON.stringify(payline),
    multiplier,
    result: outcome,
    winAmount: profit
  };
}

export default {
  spin
};
