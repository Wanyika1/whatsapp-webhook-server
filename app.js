const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "token123"; // lazima ifanane na Meta

// 1️⃣ VERIFY WEBHOOK
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 2️⃣ POKEA UJUMBE WA WHATSAPP
app.post("/webhook", (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (!message) {
    return res.sendStatus(200);
  }

  const from = message.from;
  const text = message.text?.body?.toLowerCase() || "";

  let reply = "Karibu.\n1️⃣ Bei\n2️⃣ Oda\n3️⃣ Mawasiliano";

  if (text === "1") reply = "Bei zetu:\n- Bidhaa A: 10,000\n- Bidhaa B: 20,000";
  if (text === "2") reply = "Tuma jina la bidhaa unayotaka kuagiza.";
  if (text === "3") reply = "Piga: 07XXXXXXXX";

  console.log("FROM:", from);
  console.log("MESSAGE:", text);
  console.log("REPLY:", reply);

  // hapa baadaye tutatuma reply kwa WhatsApp API
  res.sendStatus(200);
});

// 3️⃣ TEST PAGE
app.get("/", (req, res) => {
  res.send("Sales Automation System Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on", PORT));
