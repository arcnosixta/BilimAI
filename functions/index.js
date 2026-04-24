const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });

exports.chat = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { messages } = req.body;

      if (!messages) {
        return res.status(400).json({ error: "messages required" });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages.map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.text }]
            }))
          })
        }
      );

      const data = await response.json();

      res.json({
        text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "Ошибка"
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
});
