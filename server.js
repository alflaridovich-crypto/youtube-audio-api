import express from "express";
import ytdl from "ytdl-core";

const app = express();
const PORT = process.env.PORT || 3000;

// Простой healthcheck — чтобы проверить, что сервис жив
app.get("/", (req, res) => {
  res.send("YouTube Audio API is working");
});

// Основной эндпоинт: /download?url=...
app.get("/download", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Missing video URL");
    }

    const isValid = ytdl.validateURL(url);
    if (!isValid) {
      return res.status(400).send("Invalid YouTube URL");
    }

    console.log("Downloading audio from:", url);

    // Заголовки — сообщаем, что будет mp3-аудио
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="audio.mp3"');

    // Стримим только аудио-дорожку
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio"
    });

    stream.pipe(res);

    stream.on("error", (err) => {
      console.error("ytdl error:", err);
      if (!res.headersSent) {
        res.status(500).send("Error downloading audio");
      } else {
        res.end();
      }
    });

  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).send("Server error");
    } else {
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
