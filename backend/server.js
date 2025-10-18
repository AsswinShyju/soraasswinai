import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from frontend

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.post("/api/generate-video", async (req, res) => {
    try {
        const { prompt, duration } = req.body;
        const body = { model: "sora-2", prompt, ...(duration ? { duration } : {}) };

        const response = await fetch("https://api.openai.com/v1/video/generations", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/video-status/:jobId", async (req, res) => {
    const { jobId } = req.params;
    try {
        const response = await fetch(`https://api.openai.com/v1/video/generations/${jobId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${OPENAI_KEY}` },
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));