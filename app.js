import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// WEBHOOK VERIFY
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// RECEIVE MESSAGE
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body || "";

      // AUTO REPLY
      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: `Ujumbe wako umepokelewa: "${text}"` },
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    res.sendStatus(200);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000);
