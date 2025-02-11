import express from "express";

const router = express.Router();

router.get("/workout_splits", async (req, res) => {
  try {
    const allSplits = await pool.query("SELECT * FROM workout_splits");
    res.status(200).json(allSplits.rows);
  } catch (err) {
    console.log(err.message);
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

export default router;
