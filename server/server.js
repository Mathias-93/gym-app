const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 1337;

app.use(cors());
app.use(express.json);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
