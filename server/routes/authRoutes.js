import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // encrytion
  const hashedPassword = bcrypt.hashSync(password, 8);

  console.log(
    "Username:",
    username,
    "|",
    "Email:",
    email,
    "|",
    "Password:",
    hashedPassword
  );

  // Creating a new user
  try {
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
    console.error(err.message);
    res.status(503).json({ message: err });
  }
});

router.post("/login", (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "Yo you did it 2" });
});

export default router;
