import dotenv from "dotenv";

dotenv.config();

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/money-cycle",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  frontendUrls: splitCsv(process.env.FRONTEND_URL ?? "http://localhost:5173"),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:4000/auth/google/callback"
};

if (config.nodeEnv === "production") {
  const missing = [
    ["MONGODB_URI", process.env.MONGODB_URI],
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["FRONTEND_URL", process.env.FRONTEND_URL],
    ["GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID],
    ["GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET],
    ["GOOGLE_CALLBACK_URL", process.env.GOOGLE_CALLBACK_URL]
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.map(([key]) => key).join(", ")}`);
  }

  if (config.jwtSecret === "change-me" || config.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be a strong secret with at least 32 characters in production");
  }
}
