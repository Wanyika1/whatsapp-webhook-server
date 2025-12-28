const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "token123"; // iwe SAWA na uliyoweka Meta

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/* =========================
   WEBHOOK VERIFY (GET)
========================= */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/* =========================
   RECEIVE MESSAGE (POST)
========================= */
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from; // namba ya mteja
    const text = message.text?.body || "";

    console.log("MESSAGE FROM:", from);
    console.log("TEXT:", text);

    let reply = "Karibu 😊\n1️⃣ Bei\n2️⃣ Oda\n3️⃣ Msaada";

    if (text === "1") reply = "Bei zetu zinaanzia 20,000 TZS";
    if (text === "2") reply = "Tafadhali tuma jina la bidhaa";
    if (text === "3") reply = "Tutakusaidia muda mfupi ujao";

    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.sendStatus(200);
  }
});

/* =========================
   ROOT TEST
========================= */
app.get("/", (req, res) => {
  res.send("Webhook server running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Running on port", PORT);
});
