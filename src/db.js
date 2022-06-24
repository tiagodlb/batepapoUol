import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();
let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL);

try {
  await mongoClient.connect();
  db = mongoClient.db(process.env.BANCO);
  console.log(chalk.green(`Mongo Database connected`));
} catch (error) {
  console.log(chalk.red(`Error connecting to Mongo Database`));
  console.log(process.env.MONGO_URL);
  console.log(error);
}

export default db;