import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import passport from "passport";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import accountsRouter from "./routes/accounts.js";
import authRouter from "./routes/auth.js";
import categoriesRouter from "./routes/categories.js";
import cyclesRouter from "./routes/cycles.js";
import transactionsRouter from "./routes/transactions.js";
import { authenticate, getUserId } from "./middleware/authenticate.js";
import { User } from "./models/User.js";

const app = express();

app.disable("x-powered-by");
if (config.nodeEnv === "production") app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.frontendUrls.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(passport.initialize());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(
  "/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false
  }),
  authRouter
);
app.get("/api/me", authenticate, async (req, res) => {
  const user = await User.findById(getUserId(req)).select("-googleId");
  res.json(user);
});
app.use("/api/accounts", accountsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/cycles", cyclesRouter);
app.use("/api/transactions", transactionsRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

try {
  console.log("Connecting to MongoDB...");
  await connectDb();
  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
} catch (error) {
  console.error("Failed to start backend:", error);
  process.exit(1);
}
