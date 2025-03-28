import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/workout_splits", async (req, res) => {
  try {
    const userId = req.user.id;
    const splits = await pool.query(
      "SELECT * FROM workout_splits WHERE user_id = $1",
      [userId]
    );
    res.status(200).json(splits.rows);
  } catch (err) {
    console.log("Error fetching splits:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/workouts", async (req, res) => {
  try {
    const allworkouts = await pool.query("SELECT * FROM workouts");
    res.status(200).json(allworkouts.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/save_custom_split", async (req, res) => {
  try {
    const { splitName, numberOfDays, workoutsObject } = req.body;

    const newEntry = await pool.query("", [
      splitName,
      numberOfDays,
      workoutsObject,
    ]);

    res.status(201).json({
      message: "Split successfully added to database",
    });
  } catch (err) {
    console.log("Error saving split to db:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
