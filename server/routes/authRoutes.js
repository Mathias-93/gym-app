import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Creating a new user
  try {
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Saving new user and info about user to db
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    // Generating JWT token for new user
    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Sending response
    res.status(201).json({
      message: "User successfully registered.",
      user: newUser.rows[0],
      token,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({
      message: "An error occured while registering the user.",
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Logging in a user
  try {
    // Look for user in database by email
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    // If user not in database, send error
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Extract user
    const foundUser = user.rows[0];

    // If user does exist, check if password is correct
    const passwordIsValid = await bcrypt.compare(password, foundUser.password);

    // If password is incorrect (bcrypt.compareSync returns false), send error
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a signed token
    const token = jwt.sign(
      { id: foundUser.user_id, username: foundUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });
    console.log("Generated Token:", token);
    console.log("Decoded Token:", jwt.decode(token));

    res.status(200).json({
      message: "Successfully authenticated.",
      user: { username: foundUser.username, email: foundUser.email },
      token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      message: "An error occured while attempting to log in.",
      error: err.message,
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Successfully logged out" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    console.error("Auth check error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
