const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const fs = require("fs");
const speech = require("@google-cloud/speech");

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// 📌 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// 📌 User Schema
const userSchema = new mongoose.Schema({
  googleId: String,
  githubId: String,
  name: String,
  email: String,
  profilePicture: String,
  preferences: {
    darkMode: Boolean,
    language: String,
    notifications: Boolean
  },
  totalScore: { type: Number, default: 0 },
  achievements: [{ type: String }]
});

const User = mongoose.model("User", userSchema);

// 📌 Google Auth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profilePicture: profile.photos[0].value,
      preferences: { darkMode: false, language: "English", notifications: true },
      totalScore: 0,
      achievements: []
    });
  }
  return done(null, user);
}));

// 📌 GitHub Auth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback",
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ githubId: profile.id });
  if (!user) {
    user = await User.create({
      githubId: profile.id,
      name: profile.displayName,
      profilePicture: profile.photos[0].value,
      preferences: { darkMode: false, language: "English", notifications: true },
      totalScore: 0,
      achievements: []
    });
  }
  return done(null, user);
}));

// 📌 Serialize & Deserialize User
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// 📌 Authentication Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/login" }),
  (req, res) => res.redirect("http://localhost:3000/dashboard")
);

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
app.get("/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "http://localhost:3000/login" }),
  (req, res) => res.redirect("http://localhost:3000/dashboard")
);

app.get("/auth/logout", (req, res) => {
  req.logout(() => res.json({ message: "Logged out successfully!" }));
});

// 📌 AI-Powered Mock Interview with Voice Analysis
const upload = multer({ dest: "uploads/" });
const speechClient = new speech.SpeechClient();

app.post("/api/mock-interview", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file uploaded." });

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const audio = { content: fileBuffer.toString("base64") };
    const request = {
      config: { encoding: "LINEAR16", sampleRateHertz: 16000, languageCode: "en-US" },
      audio: audio,
    };

    const [response] = await speechClient.recognize(request);
    const transcript = response.results.map(result => result.alternatives[0].transcript).join(" ");

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Analyze the interview answer for clarity, fluency, and confidence. Provide feedback and a score (0-100)." },
        { role: "user", content: `Interview Answer: ${transcript}\nEvaluate and provide feedback.` },
      ],
    });

    const evaluation = aiResponse.choices[0].message.content;
    const scoreMatch = evaluation.match(/Score: (\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    // Cleanup file
    fs.unlinkSync(req.file.path);

    res.json({ transcript, evaluation, score });

  } catch (error) {
    console.error("❌ Mock Interview Error:", error);
    res.status(500).json({ error: "Failed to process interview" });
  }
});

// 📌 Leaderboard API
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ totalScore: -1 })
      .limit(10)
      .select("name profilePicture totalScore achievements");

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve leaderboard" });
  }
});

// 📌 Get User Achievements
app.get("/api/user-achievements/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("achievements");
    res.json(user.achievements);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve achievements" });
  }
});

// ✅ Start Server
const PORT = 3001;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
