require("dotenv").config();
const express = require("express");
const app = express();
const authRouter = require("./auth");

app.use(express.json());

app.use("/api/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log("Backend is online");
});
