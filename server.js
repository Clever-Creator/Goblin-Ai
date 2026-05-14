const express = require('express');

const mongoose = require('mongoose');

// Hapa weka link yako uliyocopy, hakikisha umeweka password yako sahihi

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Atlas Is Connected!'))
  .catch(err => console.error('Database Is Corrupted:', err));

// Schema kwa ajili ya kutunza history ya miradi yako na maongezi
const chatSchema = new mongoose.Schema({
    userId: String, // Hapa tutatumia jina la mtumiaji (e.g., Goblin Schofield)
    messages: Array,
    timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);
const { OpenAI } = require('openai');
const app = express();
app.use(express.json());
app.use(express.static('public'));

require('dotenv').config();
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
// Global variable ya kutunza maongezi (Kwa sasa tunatumia RAM)
let chatContext = [
    { role: "system", content: "Wewe ni GOBLIN AI, msaidizi wa kitaalamu uliyeundwa na Clever Innocent..." }
];

// --- MWISHO WA ENDPOINT YA CHAT ---

// 1. NJIA YA CHAT (TEXT & HISTORY)
app.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Wewe ni GOBLIN AI, msaidizi mwerevu wa Goblin Schofield." },
        { role: "user", content: prompt }
      ]
    });

    // Hifadhi kwenye MongoDB kinyamwezi
    const mpya = new Chat({ prompt: prompt, response: completion.choices[0].message.content });
    await mpya.save();

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ response: "Dah! Mtambo wa text umekwama kiongozi." });
  }
});

// 2. NJIA YA PICHA (DALL-E) - Hii iwe tofauti kabisa!
app.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        // Hapa unatumia OpenAI API Key yako (Sio ya Groq)
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        res.json({ imageUrl: response.data[0].url });
    } catch (error) {
        console.error("Kosa la Picha:", error);
        res.status(500).json({ error: "Picha imegoma kutoka kiongozi!" });
    }
});

app.listen(3000, () => console.log('GOBLIN AI Is Alive!'));