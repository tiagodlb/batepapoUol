import express, { json } from "express";
import cors from "cors";
import joi from "joi";
import chalk from "chalk";
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
  const { error } = participantSchema.validate(participant, {
    abortEarly: false,
  });

  if (error) {
    return res.status(422).send(error.details.map((detail) => detail.message));
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

app.get("/participants", async (req, res) => {
  try {
    const participants = await db.collection("participants").find().toArray();
    res.send(participants);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro ao obter participantes");
  }
});

app.post("/messages", async (req, res) => {
  const message = req.body;
  const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid("message", "private_message").required(),
  });
  const { error } = messageSchema.validate(message, { abortEarly: false });

  if (error) {
    return res.status(422).send(error.details.map((detail) => detail.message));
  }

  const { user } = req.headers;

  try {
    const participant = await db
      .collection("participants")
      .findOne({ name: user });
    if (!participant) {
      return res.sendStatus(422);
    }

    await db.collection("messages").insertOne({
      to: message.to,
      text: message.text,
      type: message.type,
      from: user,
      time: dayjs().format("HH:mm:ss"),
    });

    res.sendStatus(201);
  } catch (error) {
    res.status(422).send("Participante não existe!");
  }
});

app.get("/messages", async (req, res) => {
    const limit = parseInt(req.query.limit);
    const { user } = req.headers;

    try {
        const messages = await db.collection("messages").find().toArray();
        const filteredMessages = messages.filter(message => {
            const toUser = message.to === "Todos" || (message.to === user || message.from === user);
            const isPublic = message.type === "message";

            return toUser || isPublic
        });

        if( limit && limit !== NaN){
            return res.send(filteredMessages.slice(-limit))
        }

        res.send(filteredMessages);
    } catch (error) {
        res.status(500).send("Erro ao obter mensagens");
    }
});

app.post("/status", async (req, res) => {});

app.listen(process.env.PORT, () => {
  console.log(chalk.bold.blue(`Server running on port ${process.env.PORT}`));
});
