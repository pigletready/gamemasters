// Card utilities
export const SUITS = ["H", "D", "C", "S"]; // Hearts, Diamonds, Clubs, Spades
export const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

/**
 * Create a deck of cards
 * @param numDecks Number of decks to create (default: 1)
 * @returns Array of card strings (e.g., "AH" for Ace of Hearts)
 */
export function createDeck(numDecks: number = 1): string[] {
  const deck: string[] = [];
  
  for (let i = 0; i < numDecks; i++) {
    for (const suit of SUITS) {
      for (const value of VALUES) {
        deck.push(value + suit);
      }
    }
  }
  
  return deck;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param array Array to shuffle
 * @returns Shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Calculate the value of a blackjack hand
 * @param cards Array of card strings
 * @returns Object with the hand value and whether it's soft (contains an Ace counted as 11)
 */
export function calculateBlackjackHand(cards: string[]): { value: number, isSoft: boolean } {
  let value = 0;
  let aces = 0;
  
  for (const card of cards) {
    const cardValue = card.slice(0, -1); // Remove the suit
    
    if (cardValue === "A") {
      aces++;
      value += 11;
    } else if (["J", "Q", "K"].includes(cardValue)) {
      value += 10;
    } else {
      value += parseInt(cardValue);
    }
  }
  
  // If we're busting, convert Aces from 11 to 1 as needed
  let isSoft = false;
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  // If we have an Ace counted as 11, it's a soft hand
  if (aces > 0) {
    isSoft = true;
  }
  
  return { value, isSoft };
}

/**
 * Check if a hand is a blackjack (Ace + 10-value card)
 * @param cards Array of card strings
 * @returns True if the hand is a blackjack
 */
export function isBlackjack(cards: string[]): boolean {
  if (cards.length !== 2) return false;
  
  const { value } = calculateBlackjackHand(cards);
  return value === 21;
}

/**
 * Format currency with comma separators
 * @param amount Number to format
 * @returns Formatted string
 */
export function formatCurrency(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Get random integer between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random integer
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Simulate spinning a roulette wheel
 * @returns Object with the result number and color
 */
export function spinRouletteWheel(): { number: number, color: "red" | "black" | "green" } {
  // Roulette wheel numbers
  const wheelNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];
  
  // Red numbers on a standard roulette wheel
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  // Randomly select a position on the wheel
  const index = Math.floor(Math.random() * wheelNumbers.length);
  const number = wheelNumbers[index];
  
  // Determine color
  let color: "red" | "black" | "green";
  if (number === 0) {
    color = "green";
  } else if (redNumbers.includes(number)) {
    color = "red";
  } else {
    color = "black";
  }
  
  return { number, color };
}

/**
 * Simulate rolling a dice
 * @param sides Number of sides on the dice
 * @returns Result of the dice roll
 */
export function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Simulate flipping a coin
 * @returns "heads" or "tails"
 */
export function flipCoin(): "heads" | "tails" {
  return Math.random() < 0.5 ? "heads" : "tails";
}

/**
 * Generate slot machine symbols
 * @param numReels Number of reels
 * @param symbolsPerReel Array of possible symbols for each reel
 * @returns Array of symbols for each reel
 */
export function spinSlotMachine(numReels: number, symbolsPerReel: string[][]): string[] {
  const result: string[] = [];
  
  for (let i = 0; i < numReels; i++) {
    const reelSymbols = symbolsPerReel[i];
    const randomIndex = Math.floor(Math.random() * reelSymbols.length);
    result.push(reelSymbols[randomIndex]);
  }
  
  return result;
}

/**
 * Calculate slot machine payout based on symbols and paylines
 * @param symbols Array of symbols on the reels
 * @param payTable Record mapping symbol combinations to payout multipliers
 * @returns Payout multiplier
 */
export function calculateSlotPayout(symbols: string[], payTable: Record<string, number>): number {
  // Simple implementation: check if all symbols are the same
  const firstSymbol = symbols[0];
  const allSame = symbols.every(symbol => symbol === firstSymbol);
  
  if (allSame && payTable[firstSymbol]) {
    return payTable[firstSymbol];
  }
  
  // Count occurrences of each symbol
  const counts: Record<string, number> = {};
  for (const symbol of symbols) {
    counts[symbol] = (counts[symbol] || 0) + 1;
  }
  
  // Find the symbol with the highest count
  let maxCount = 0;
  let maxSymbol = "";
  
  for (const symbol in counts) {
    if (counts[symbol] > maxCount) {
      maxCount = counts[symbol];
      maxSymbol = symbol;
    }
  }
  
  // Return payout based on the number of matching symbols
  if (maxCount >= 2 && payTable[`${maxSymbol}${maxCount}`]) {
    return payTable[`${maxSymbol}${maxCount}`];
  }
  
  return 0; // No win
}
