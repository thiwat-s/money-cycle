import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "../config.js";
import { authenticate, getUserId } from "../middleware/authenticate.js";
import { User } from "../models/User.js";

const router = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: config.nodeEnv === "production" ? ("none" as const) : ("lax" as const),
  secure: config.nodeEnv === "production"
};

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackUrl
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account has no email"));

        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          {
            googleId: profile.id,
            email,
            name: profile.displayName || email
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const user = req.user as { _id: { toString: () => string } };
    const token = jwt.sign({ sub: user._id.toString() }, config.jwtSecret, { expiresIn: "7d" });

    res.cookie("token", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(`${config.frontendUrl}/dashboard`);
  }
);

router.get("/me", authenticate, async (req, res) => {
  const user = await User.findById(getUserId(req)).select("-googleId");
  res.json(user);
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ ok: true });
});

export default router;
