import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "../storage";

// Replace these with your actual Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5002/api/auth/google/callback";

export function setupGoogleAuth(app: any) {
  // Configure the Google strategy for use by Passport
  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists in your database
        let user = await storage.getUserById(profile.id);
        
        if (!user) {
          // Create a new user if they don't exist
          user = await storage.upsertUser({
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            // Add any additional user fields you need
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  ));

  // Serialize user into the sessions
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from the sessions
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  });

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
      successRedirect: "/",
    })
  );

  // Logout route
  app.get("/api/auth/logout", (req: any, res: any) => {
    req.logout(() => {
      res.redirect("/");
    });
  });

  // Get current user
  app.get("/api/auth/user", (req: any, res: any) => {
    res.json(req.user || null);
  });
}
