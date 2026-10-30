require("dotenv").config();
const express = require("express");
const app = express();
const authRouter = require("./auth");
const avaibilityRouter = require("./avaibility");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRouter);

app.use("/api/availability", avaibilityRouter);

app.listen(process.env.PORT, () => {
  console.log("Backend is online");
});
