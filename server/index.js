const express = require("express");
require("dotenv").config();
const port = 3000;
const app = express();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
