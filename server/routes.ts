import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertUserSchema, insertGameRecordSchema,
  blackjackActionSchema, slotSpinSchema, rouletteBetSchema, 
  diceBetSchema, coinflipBetSchema
} from "@shared/schema";
import { z } from "zod";
import blackjack from "./games/blackjack";
import slots from "./games/slots";
import roulette from "./games/roulette";
import dice from "./games/dice";
import coinflip from "./games/coinflip";
import { WebSocketServer } from "ws";

// Extend Express Session type
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create minimal WebSocket server that doesn't crash on errors
  try {
    const wss = new WebSocketServer({ 
      server: httpServer,
      perMessageDeflate: false, // Disable compression to avoid issues
      handleProtocols: () => false, // Reject all protocols to simplify handling
    });
    
    // Global error handler to prevent crashes
    wss.on('error', (error) => {
      console.log('WebSocket server error suppressed');
    });
    
    // Handle connections with minimal processing
    wss.on('connection', (ws) => {
      // Set up minimal event handlers to suppress errors
      ws.on('error', () => {});
      ws.on('message', () => {});
      
      // Close connection immediately to prevent issues
      try {
        ws.close();
      } catch (e) {
        // Ignore close errors
      }
    });
    
    console.log('WebSocket server set up in minimal mode');
  } catch (error) {
    console.log('Error setting up WebSocket server, continuing without it');
  }
  
  // Auth routes
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const user = await storage.createUser(userData);
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      req.session!.userId = user.id;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Set user ID in session
      req.session!.userId = user.id;
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/logout', (req: Request, res: Response) => {
    req.session!.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // User routes
  app.get('/api/me', async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Game routes
  app.post('/api/games/blackjack', async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { action, bet } = blackjackActionSchema.parse(req.body);
      
      // Handle blackjack game action
      const result = await blackjack.handleAction(userId, action, bet);
      
      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/games/slots', async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { bet } = slotSpinSchema.parse(req.body);
      
      // Validate bet amount
      if (bet <= 0) {
        return res.status(400).json({ message: 'Bet must be greater than 0' });
      }
      
      if (bet > user.balance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Handle slots game
      const result = await slots.spin(userId, bet);
      
      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/games/roulette', async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { prediction, bet } = rouletteBetSchema.parse(req.body);
      
      // Validate bet amount
      if (bet <= 0) {
        return res.status(400).json({ message: 'Bet must be greater than 0' });
      }
      
      if (bet > user.balance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Handle roulette game
      const result = await roulette.placeBet(userId, prediction, bet);
      
      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/games/dice', async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { diceType, prediction, bet } = diceBetSchema.parse(req.body);
      
      // Validate bet amount
      if (bet <= 0) {
        return res.status(400).json({ message: 'Bet must be greater than 0' });
      }
      
      if (bet > user.balance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Handle dice game
      const result = await dice.roll(userId, diceType, prediction, bet);
      
      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/games/coinflip', async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { prediction, bet } = coinflipBetSchema.parse(req.body);
      
      // Validate bet amount
      if (bet <= 0) {
        return res.status(400).json({ message: 'Bet must be greater than 0' });
      }
      
      if (bet > user.balance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Handle coinflip game
      const result = await coinflip.flip(userId, prediction, bet);
      
      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Leaderboard routes
  app.get('/api/leaderboard', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const leaderboard = await storage.getLeaderboard(limit);
      
      return res.json(leaderboard);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Game statistics routes
  app.get('/api/statistics/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const statistics = await storage.getGameStatistics(userId);
      
      return res.json(statistics);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  return httpServer;
}
