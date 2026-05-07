import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to normalize YouTube URLs and extract ID
  const getYouTubeID = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
      if (parsed.hostname.includes('youtube.com')) return parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
      return null;
    } catch {
      return null;
    }
  };

  // API Route: Fetch YouTube Transcript & Metadata
  app.get("/api/transcript", async (req, res) => {
    const rawUrl = req.query.url as string;
    
    if (!rawUrl) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    const videoId = getYouTubeID(rawUrl);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL format. Please provide a standard YouTube or youtu.be link." });
    }

    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      console.log(`Processing video: ${videoId}`);
      
      let transcriptText = "";
      let videoInfo: any = { 
        videoId,
        title: null,
        description: null,
        author: null
      };
      let errors: string[] = [];

      // 1. Try to get Metadata via OEmbed (Official & Highly Reliable for Title)
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          videoInfo.title = oembedData.title || null;
          videoInfo.author = oembedData.author_name || null;
          console.log(`OEmbed Success: Found title "${videoInfo.title}"`);
        } else {
          console.warn(`OEmbed returned status ${oembedRes.status}`);
        }
      } catch (e) {
        console.warn("OEmbed fetching failed:", e);
      }

      // 2. Try to get Full Metadata (Description) via ytdl-core
      // This is more detailed but prone to bot detection
      let metaSuccess = false;
      try {
        const info = await ytdl.getBasicInfo(normalizedUrl);
        videoInfo.title = info.videoDetails.title || videoInfo.title;
        videoInfo.description = info.videoDetails.description || null;
        videoInfo.author = info.videoDetails.author.name || videoInfo.author;
        metaSuccess = true;
      } catch (metaError: any) {
        const msg = metaError.message || String(metaError);
        console.warn("ytdl metadata extraction failed:", msg);
        if (msg.includes('confirm you’re not a bot')) {
          errors.push("METADATA_BOT_DETECTION: YouTube blocked detailed metadata extraction.");
        } else {
          errors.push(`METADATA_FAILED: ${msg.slice(0, 100)}`);
        }
      }

      // 3. Fallback: Direct HTML Scraping for Meta Tags (Highly robust fallback)
      if (!videoInfo.title || !videoInfo.description) {
        try {
          console.log("Attempting HTML scrape fallback for metadata...");
          const scrapeRes = await fetch(normalizedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
          });
          if (scrapeRes.ok) {
            const html = await scrapeRes.text();
            
            if (!videoInfo.title) {
              const titleMatch = html.match(/<meta name="title" content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
              if (titleMatch) {
                videoInfo.title = titleMatch[1].replace(' - YouTube', '');
                console.log("Scrape Success: Found title via HTML");
              }
            }
            
            if (!videoInfo.description) {
              const descMatch = html.match(/<meta name="description" content="([^"]+)"/) || html.match(/"shortDescription":"([^"]+)"/);
              if (descMatch) {
                videoInfo.description = descMatch[1];
                console.log("Scrape Success: Found description via HTML");
              }
            }
            metaSuccess = metaSuccess || !!videoInfo.title;
          }
        } catch (scrapeError) {
          console.warn("Direct scrape failed:", scrapeError);
        }
      }

      // 4. Fetch Transcript
      let transcriptSuccess = false;
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(normalizedUrl);
        if (transcript && transcript.length > 0) {
          transcriptText = transcript
            .map((item) => item.text)
            .join(" ")
            .replace(/&amp;#39;/g, "'")
            .replace(/&quot;/g, '"');
          transcriptSuccess = true;
        }
      } catch (transcriptError: any) {
        const msg = transcriptError.message || String(transcriptError);
        console.warn("Transcript fetching failed:", msg);
        if (msg.includes('Transcript is disabled')) {
          errors.push("TRANSCRIPT_DISABLED: Captions are unavailable for this video.");
        } else if (msg.includes('confirm you’re not a bot')) {
          errors.push("TRANSCRIPT_BOT_DETECTION: YouTube blocked transcript extraction.");
        } else {
          errors.push(`TRANSCRIPT_FAILED: ${msg.slice(0, 100)}`);
        }
      }

      // Final Check: Do we have enough to attempt AI synthesis?
      // We need at least a TITLE to reasonably guess the content.
      if (!videoInfo.title) {
        console.error("Extraction failed completely. No title found.");
        
        let userMessage = "We couldn't extract any information from this video.";
        
        const hasBotDetection = errors.some(e => e.includes('BOT_DETECTION'));
        if (hasBotDetection) {
          userMessage = "YouTube is currently limiting automated access. This often happens with high-traffic videos or temporary server-side restrictions. Please try another video or try again in a few minutes.";
        } else if (errors.length > 0) {
          userMessage = `Unable to process video: ${errors[0].split(':').pop()?.trim()}`;
        }

        return res.status(404).json({ 
          error: userMessage,
          details: errors 
        });
      }

      console.log(`Extraction Result -> Title: ${!!videoInfo.title}, Desc: ${!!videoInfo.description}, Transcript: ${transcriptSuccess}`);
      
      res.json({ 
        transcript: transcriptText,
        metadata: {
          ...videoInfo,
          title: videoInfo.title || "Untitled Video"
        },
        isSynthesized: !transcriptSuccess,
        warnings: errors
      });
    } catch (error: any) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: "An error occurred while processing the video. Please try a different video or try again later." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
