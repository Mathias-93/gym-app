const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 1337;
const pool = require("./db");

app.use(cors());
app.use(express.json());

app.get("/exercises", async (req, res) => {
  try {
    const allExercises = await pool.query("SELECT * FROM exercises");
    res.status(200).json(allExercises.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
