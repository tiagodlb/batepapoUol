import express, { json } from "express";
import cors from "cors";
import joi from "joi";
import chalk from "chalk"
import dayjs from "dayjs";
import db from "./db.js";

const app = express();
app.use(json());
app.use(cors());

app.post("/participants", async (req, res) => {
  const participant = req.body.name;
  const participantSchema = joi.object({
    name: joi.string().min(1).required(),
  });
  const { error } = participantSchema.validate(participant);

  if (error) {
    console.log(error);
    return res.sendStatus(422);
  }
  try {
    const participantExists = await db
      .collection("participants")
      .findOne({ name: participant.name });
    if (participantExists) {
      return res.sendStatus(409);
    }

    await db.collection("participants").insertOne({ name: participant.name });
    await db.collection("messages").insertOne({
      from: participant.name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format("HH:nn:ss"),
    });

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro ao registrar usuario");
  }
});

app.get("/participants", async (req,res) => {
    try{
        const participants = await db.collection("participants").find().toArray();
        res.send(participants)
    } catch (error) {
        console.log(error);
        return res.status(500).send("Erro ao obter participantes");
    }
});

app.listen(process.env.PORT, () => {
  console.log(chalk.bold.blue(`Server running on port ${process.env.PORT}`));
});