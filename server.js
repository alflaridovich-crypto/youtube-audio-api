import express from "express";
import ytdl from "yt-dlp-exec";

const app = express();
const PORT = process.env.PORT || 3000;

// простой healthcheck
app.get("/", (req, res) => {
  res.send("YouTube Audio API is working");
});

// основной endpoint: /download?url=...
app.get("/download", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing video URL");

    console.log("Downloading audio from:", url);

    // запускаем yt-dlp как библиотеку
    const process = ytdl(url, {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: "-",
    });

    // устанавливаем заголовки для mp3
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=audio.mp3");

    // прокидываем поток в ответ
    process.stdout.pipe(res);

    process.stderr.on("data", data => {
      console.error("yt-dlp error:", data.toString());
    });

  } catch (e) {
    console.error(e);
    res.status(500).send("Error downloading audio");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
