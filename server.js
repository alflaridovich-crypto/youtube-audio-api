import express from "express";
import ytdl from "@distube/ytdl-core";

const app = express();
const PORT = process.env.PORT || 3000;

// Проверка, что сервис жив
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

    // Заголовки — говорим, что будет mp3/аудио-поток
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="audio.mp3"');

    // Стримим только аудио-дорожку
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
      requestOptions: {
        headers: {
          // Маскируемся под обычный браузер
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "accept-language": "en-US,en;q=0.9"
        }
      }
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
