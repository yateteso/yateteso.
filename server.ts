import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation, Type, ThinkingLevel } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history, mode } = req.body;
      const contents = history ? [...history, message] : [message];
      
      let model = 'gemini-3.5-flash';
      let tools: any[] = [];
      let thinkingConfig: any = undefined;

      if (mode === 'fast') {
        model = 'gemini-3.1-flash-lite';
      } else if (mode === 'search') {
        model = 'gemini-3.5-flash';
        tools = [{ googleSearch: {} }];
      } else if (mode === 'maps') {
        model = 'gemini-3.5-flash';
        tools = [{ googleMaps: {} }];
      } else if (mode === 'complex') {
        model = 'gemini-3.1-pro-preview';
        thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }

      const config: any = {
        systemInstruction: 'You are an AI assistant for Yateteso, a premium electronics store in Ghana. You can answer questions about products, delivery, policies, and more.',
      };
      if (tools.length > 0) config.tools = tools;
      if (thinkingConfig) config.thinkingConfig = thinkingConfig;
      
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt } = req.body;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            { text: prompt || 'Analyze this image and describe what electronics are in it.' },
            { inlineData: { data: imageBase64.split(',')[1], mimeType } }
          ]
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-video', async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt, aspectRatio } = req.body;
      
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this scene naturally',
        image: {
          imageBytes: imageBase64.split(',')[1],
          mimeType: mimeType || 'image/jpeg',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio || '16:9'
        }
      });
      
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/video-download', async (req, res) => {
    try {
      const { operationName } = req.body;
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!uri) {
        return res.status(404).json({ error: 'Video URI not found' });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY as string },
      });
      
      res.setHeader('Content-Type', 'video/mp4');
      // @ts-ignore
      videoRes.body!.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      );
    } catch (error: any) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

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
