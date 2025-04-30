import { storage } from "../storage";

// Roulette wheel numbers
const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Red numbers on a standard roulette wheel
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Black numbers on a standard roulette wheel
const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// Green numbers (zero)
const greenNumbers = [0];

/**
 * Get payout multiplier based on prediction type
 */
function getPayoutMultiplier(prediction: string, result: number): { win: boolean, multiplier: number } {
  // Single number (including 0)
  if (!isNaN(parseInt(prediction))) {
    return { 
      win: parseInt(prediction) === result, 
      multiplier: 36 // 35:1 odds
    };
  }
  
  // Color predictions
  if (prediction === "red") {
    return { 
      win: redNumbers.includes(result), 
      multiplier: 2 // 1:1 odds
    };
  }
  
  if (prediction === "black") {
    return { 
      win: blackNumbers.includes(result), 
      multiplier: 2 // 1:1 odds
    };
  }
  
  if (prediction === "green") {
    return { 
      win: greenNumbers.includes(result), 
      multiplier: 36 // 35:1 odds
    };
  }
  
  // Range predictions
  if (prediction === "1stHalf") {
    return { 
      win: result >= 1 && result <= 18, 
      multiplier: 2 // 1:1 odds
    };
  }
  
  if (prediction === "2ndHalf") {
    return { 
      win: result >= 19 && result <= 36, 
      multiplier: 2 // 1:1 odds
    };
  }
  
  // Dozen predictions
  if (prediction === "1st12") {
    return { 
      win: result >= 1 && result <= 12, 
      multiplier: 3 // 2:1 odds
    };
  }
  
  if (prediction === "2nd12") {
    return { 
      win: result >= 13 && result <= 24, 
      multiplier: 3 // 2:1 odds
    };
  }
  
  if (prediction === "3rd12") {
    return { 
      win: result >= 25 && result <= 36, 
      multiplier: 3 // 2:1 odds
    };
  }
  
  // Column predictions
  if (prediction === "1stCol" || prediction === "col1") {
    return { 
      win: result % 3 === 1 && result !== 0, 
      multiplier: 3 // 2:1 odds
    };
  }
  
  if (prediction === "2ndCol" || prediction === "col2") {
    return { 
      win: result % 3 === 2 && result !== 0, 
      multiplier: 3 // 2:1 odds
    };
  }
  
  if (prediction === "3rdCol" || prediction === "col3") {
    return { 
      win: result % 3 === 0 && result !== 0, 
      multiplier: 3 // 2:1 odds
    };
  }
  
  // Custom ranges (e.g., "1-12" or "1,3,5")
  if (prediction.includes("-")) {
    const [start, end] = prediction.split("-").map(Number);
    return { 
      win: result >= start && result <= end, 
      multiplier: Math.floor(36 / (end - start + 1)) // Proportional odds
    };
  }
  
  if (prediction.includes(",")) {
    const numbers = prediction.split(",").map(Number);
    return { 
      win: numbers.includes(result), 
      multiplier: Math.floor(36 / numbers.length) // Proportional odds
    };
  }
  
  // Unknown prediction type
  return { win: false, multiplier: 0 };
}

/**
 * Handle roulette bet
 */
async function placeBet(userId: number, prediction: string, bet: number) {
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
  
  // Spin the wheel
  const randomIndex = Math.floor(Math.random() * wheelNumbers.length);
  const result = wheelNumbers[randomIndex];
  
  // Check if the prediction wins
  const { win, multiplier } = getPayoutMultiplier(prediction, result);
  
  // Calculate winnings
  const winAmount = win ? bet * multiplier : 0;
  const profit = win ? winAmount - bet : -bet;
  const outcome = win ? "win" : "lose";
  
  // Update user balance if they won
  if (win) {
    await storage.updateUserBalance(userId, user.balance - bet + winAmount);
  }
  
  // Save game record
  const gameRecord = await storage.createGameRecord({
    userId,
    gameType: "roulette",
    bet,
    outcome,
    profit
  });
  
  // Save roulette game details
  await storage.storeRouletteGame(
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
  placeBet
};
