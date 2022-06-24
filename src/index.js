import express, { json } from "express";
import cors from "cors";
import joi from "joi";
import db from "./db.js";

const app = express();
app.use(json());
app.use(cors());

app.listen(process.env.PORT, () => {
  console.log(chalk.blue(`Server running on port ${process.env.PORT}`));
});
