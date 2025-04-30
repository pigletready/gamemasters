import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session middleware with simple in-memory storage (not suitable for production)
app.use(session({
  secret: "casino-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Add a global unhandled promise rejection handler to avoid crashes from WebSocket errors
process.on('unhandledRejection', (reason, promise) => {
  // Only log the error and continue running
  console.error('Unhandled Promise Rejection:', reason);
});

// Add a global uncaught exception handler
process.on('uncaughtException', (error) => {
  // Check if it's a WebSocket error
  if (error.message && (
    error.message.includes('WebSocket') || 
    error.message.includes('ws error') || 
    error.message.includes('vite') ||
    error.message.includes('hmr'))) {
    console.log('WebSocket error suppressed:', error.message);
  } else {
    // For other errors, log but don't crash
    console.error('Uncaught Exception:', error);
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Skip throwing WebSocket-related errors to avoid crashing the server
    if (message.includes('WebSocket') || message.includes('ws error')) {
      console.error('WebSocket error handled:', message);
      res.status(status).json({ message });
      return;
    }

    res.status(status).json({ message });
    
    // Only log the error instead of throwing it to prevent server crashes
    console.error('Server error:', err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
