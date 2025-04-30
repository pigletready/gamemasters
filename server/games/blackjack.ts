import { storage } from "../storage";
import { createDeck, shuffle, calculateBlackjackHand, isBlackjack } from "../../client/src/lib/gameUtils";

interface BlackjackGame {
  playerCards: string[];
  dealerCards: string[];
  playerScore: number;
  dealerScore: number;
  isBlackjack: boolean;
}

// Store active games by user ID
const activeGames = new Map<number, {
  deck: string[];
  playerCards: string[];
  dealerCards: string[];
  bet: number;
}>();

/**
 * Handle blackjack actions (new, hit, stand, double)
 */
async function handleAction(userId: number, action: string, betAmount?: number) {
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Start a new game
  if (action === "new") {
    if (!betAmount || betAmount <= 0) {
      throw new Error("Invalid bet amount");
    }
    
    if (betAmount > user.balance) {
      throw new Error("Insufficient balance");
    }
    
    // Deduct the bet amount
    await storage.updateUserBalance(userId, user.balance - betAmount);
    
    // Create and shuffle deck (6 decks)
    const deck = shuffle(createDeck(6));
    
    // Deal initial cards
    const playerCards = [deck.pop()!, deck.pop()!];
    const dealerCards = [deck.pop()!, deck.pop()!];
    
    // Store game state
    activeGames.set(userId, {
      deck,
      playerCards,
      dealerCards,
      bet: betAmount
    });
    
    // Calculate hand values
    const { value: playerScore } = calculateBlackjackHand(playerCards);
    const { value: dealerScore } = calculateBlackjackHand([dealerCards[1]]); // Only show one dealer card
    
    // Check for blackjack
    if (isBlackjack(playerCards)) {
      // Player has blackjack
      const playerBlackjack = true;
      const dealerBlackjack = isBlackjack(dealerCards);
      
      // Clean up game state
      activeGames.delete(userId);
      
      // Handle outcome
      if (dealerBlackjack) {
        // Both have blackjack - push
        await storage.updateUserBalance(userId, user.balance); // Return bet
        
        // Save game record
        const gameRecord = await storage.createGameRecord({
          userId,
          gameType: "blackjack",
          bet: betAmount,
          outcome: "push",
          profit: 0
        });
        
        // Save blackjack game details
        await storage.storeBlackjackGame(
          gameRecord.id,
          JSON.stringify(playerCards),
          JSON.stringify(dealerCards),
          21,
          21,
          true
        );
        
        return {
          playerCards,
          dealerCards,
          playerScore: 21,
          dealerScore: 21,
          gameState: "finished",
          result: "push",
          winAmount: 0
        };
      } else {
        // Player has blackjack, dealer doesn't - win with 3:2 odds
        const winAmount = Math.floor(betAmount * 2.5); // Bet * 1.5 (3:2 odds) + original bet
        await storage.updateUserBalance(userId, user.balance + winAmount);
        
        // Save game record
        const gameRecord = await storage.createGameRecord({
          userId,
          gameType: "blackjack",
          bet: betAmount,
          outcome: "win",
          profit: winAmount - betAmount
        });
        
        // Save blackjack game details
        await storage.storeBlackjackGame(
          gameRecord.id,
          JSON.stringify(playerCards),
          JSON.stringify(dealerCards),
          21,
          calculateBlackjackHand(dealerCards).value,
          true
        );
        
        return {
          playerCards,
          dealerCards,
          playerScore: 21,
          dealerScore: calculateBlackjackHand(dealerCards).value,
          gameState: "finished",
          result: "win",
          winAmount: winAmount - betAmount
        };
      }
    }
    
    // Regular game - no blackjack
    return {
      playerCards,
      dealerCards: [dealerCards[1], "?"], // Hide dealer's first card
      playerScore,
      dealerScore,
      gameState: "playing"
    };
  }
  
  // Handle other actions (hit, stand, double)
  const game = activeGames.get(userId);
  
  if (!game) {
    throw new Error("No active game found");
  }
  
  const { deck, playerCards, dealerCards, bet } = game;
  
  // Hit - draw another card
  if (action === "hit") {
    // Draw card for player
    const newCard = deck.pop()!;
    playerCards.push(newCard);
    
    // Calculate new hand value
    const { value: playerScore } = calculateBlackjackHand(playerCards);
    const { value: dealerScore } = calculateBlackjackHand([dealerCards[1]]); // Still only show second dealer card
    
    // Update game state
    activeGames.set(userId, {
      deck,
      playerCards,
      dealerCards,
      bet
    });
    
    // Check if player busts
    if (playerScore > 21) {
      // Player busts - game over
      activeGames.delete(userId);
      
      // Save game record
      const gameRecord = await storage.createGameRecord({
        userId,
        gameType: "blackjack",
        bet,
        outcome: "lose",
        profit: -bet
      });
      
      // Save blackjack game details
      await storage.storeBlackjackGame(
        gameRecord.id,
        JSON.stringify(playerCards),
        JSON.stringify(dealerCards),
        playerScore,
        calculateBlackjackHand(dealerCards).value,
        false
      );
      
      return {
        playerCards,
        dealerCards,
        playerScore,
        dealerScore: calculateBlackjackHand(dealerCards).value,
        gameState: "finished",
        result: "lose",
        winAmount: 0
      };
    }
    
    // Player hasn't busted, continue game
    return {
      playerCards,
      dealerCards: [dealerCards[1], "?"], // Still hide dealer's first card
      playerScore,
      dealerScore,
      gameState: "playing"
    };
  }
  
  // Double down - double bet, draw one card, then stand
  if (action === "double") {
    // Check if player has exactly 2 cards (can only double on initial hand)
    if (playerCards.length !== 2) {
      throw new Error("Can only double down on initial hand");
    }
    
    // Check if player has enough balance to double
    if (user.balance < bet) {
      throw new Error("Insufficient balance to double down");
    }
    
    // Deduct additional bet
    await storage.updateUserBalance(userId, user.balance - bet);
    
    // Draw one card for player
    const newCard = deck.pop()!;
    playerCards.push(newCard);
    
    // Calculate new hand value
    const { value: playerScore } = calculateBlackjackHand(playerCards);
    
    // Proceed to dealer's turn (same as stand)
    // Double bet amount for payout calculation
    const doubleBet = bet * 2;
    
    // Reveal dealer's first card
    const dealerHand = [...dealerCards];
    const { value: dealerScore } = calculateBlackjackHand(dealerHand);
    
    // Dealer draws until they have at least 17
    while (dealerScore < 17) {
      const newCard = deck.pop()!;
      dealerHand.push(newCard);
      const { value: newDealerScore } = calculateBlackjackHand(dealerHand);
      if (newDealerScore >= 17) break;
    }
    
    // Calculate final scores
    const finalPlayerScore = calculateBlackjackHand(playerCards).value;
    const finalDealerScore = calculateBlackjackHand(dealerHand).value;
    
    // Determine outcome
    let result: "win" | "lose" | "push";
    let winAmount = 0;
    
    if (finalPlayerScore > 21) {
      // Player busts
      result = "lose";
    } else if (finalDealerScore > 21) {
      // Dealer busts, player wins
      result = "win";
      winAmount = doubleBet * 2; // Double bet returned with winnings
    } else if (finalPlayerScore > finalDealerScore) {
      // Player has higher score
      result = "win";
      winAmount = doubleBet * 2; // Double bet returned with winnings
    } else if (finalPlayerScore < finalDealerScore) {
      // Dealer has higher score
      result = "lose";
    } else {
      // Push (tie)
      result = "push";
      winAmount = doubleBet; // Return double bet
    }
    
    // Clean up game state
    activeGames.delete(userId);
    
    // Update user balance for win/push
    if (winAmount > 0) {
      await storage.updateUserBalance(userId, user.balance + winAmount);
    }
    
    // Save game record
    const profit = result === "win" ? doubleBet : result === "push" ? 0 : -doubleBet;
    const gameRecord = await storage.createGameRecord({
      userId,
      gameType: "blackjack",
      bet: doubleBet,
      outcome: result,
      profit
    });
    
    // Save blackjack game details
    await storage.storeBlackjackGame(
      gameRecord.id,
      JSON.stringify(playerCards),
      JSON.stringify(dealerHand),
      finalPlayerScore,
      finalDealerScore,
      false
    );
    
    return {
      playerCards,
      dealerCards: dealerHand,
      playerScore: finalPlayerScore,
      dealerScore: finalDealerScore,
      gameState: "finished",
      result,
      winAmount: profit
    };
  }
  
  // Stand - dealer plays their hand
  if (action === "stand") {
    // Reveal dealer's first card
    const dealerHand = [...dealerCards];
    let dealerScore = calculateBlackjackHand(dealerHand).value;
    
    // Dealer draws until they have at least 17
    while (dealerScore < 17) {
      const newCard = deck.pop()!;
      dealerHand.push(newCard);
      dealerScore = calculateBlackjackHand(dealerHand).value;
    }
    
    // Calculate final scores
    const playerScore = calculateBlackjackHand(playerCards).value;
    
    // Determine outcome
    let result: "win" | "lose" | "push";
    let winAmount = 0;
    
    if (playerScore > 21) {
      // Player busts
      result = "lose";
    } else if (dealerScore > 21) {
      // Dealer busts, player wins
      result = "win";
      winAmount = bet * 2; // Bet returned with winnings
    } else if (playerScore > dealerScore) {
      // Player has higher score
      result = "win";
      winAmount = bet * 2; // Bet returned with winnings
    } else if (playerScore < dealerScore) {
      // Dealer has higher score
      result = "lose";
    } else {
      // Push (tie)
      result = "push";
      winAmount = bet; // Return bet
    }
    
    // Clean up game state
    activeGames.delete(userId);
    
    // Update user balance for win/push
    if (winAmount > 0) {
      await storage.updateUserBalance(userId, user.balance + winAmount);
    }
    
    // Save game record
    const profit = result === "win" ? bet : result === "push" ? 0 : -bet;
    const gameRecord = await storage.createGameRecord({
      userId,
      gameType: "blackjack",
      bet,
      outcome: result,
      profit
    });
    
    // Save blackjack game details
    await storage.storeBlackjackGame(
      gameRecord.id,
      JSON.stringify(playerCards),
      JSON.stringify(dealerHand),
      playerScore,
      dealerScore,
      false
    );
    
    return {
      playerCards,
      dealerCards: dealerHand,
      playerScore,
      dealerScore,
      gameState: "finished",
      result,
      winAmount: profit
    };
  }
  
  throw new Error("Invalid action");
}

export default {
  handleAction
};
