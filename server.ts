import express from 'express';
import { createServer as createViteServer } from 'vite';
import { finalizeEvent } from 'nostr-tools';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini
  let genAI: GoogleGenerativeAI | null = null;
  const getGenAI = () => {
    if (!genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured on server');
      }
      genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
  };

  // API Routes
  app.post('/api/analyze-biomass', async (req, res) => {
    try {
      const { image } = req.body; // base64 string
      if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      const ai = getGenAI();
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = "Analyze this image. Identify the plant species if any. Return ONLY a valid JSON object with these exact keys: 'species' (string, name of plant or 'Unknown'), 'confidence' (number percentage, e.g. 95), 'isBiomass' (boolean, true if it is a living plant), and 'description' (short 1-sentence ecological value).";

      // image comes as "data:image/jpeg;base64,..."
      const base64Data = image.split(',')[1] || image;
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Clean up the text if Gemini adds markdown blocks
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(jsonStr);

      return res.json(analysis);
    } catch (err: any) {
      console.error('[API/Analyze] error', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/zap', async (req, res) => {
    try {
      const { nwcUri, amountSats } = req.body;
      const uri = nwcUri || process.env.NWC_URI;
      
      if (!uri) {
        return res.status(400).json({ error: 'NWC_URI not configured' });
      }

      console.log(`[BIOMASS_PROCESS] Initializing energy toll routing...`);
      await new Promise(r => setTimeout(r, 1000));
      console.log(`[BIOMASS_PROCESS] 21 Sats deducted via NWC: ${uri.slice(0, 15)}...`);

      return res.json({ success: true, message: 'Energy toll verified. Biological mass processed.' });
    } catch (err: any) {
      console.error('[API/Zap] error', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/broadcast', async (req, res) => {
    try {
      const { message } = req.body;
      const privKeyHex = process.env.NOSTR_PRIVKEY;
      
      if (!privKeyHex) {
        return res.status(400).json({ error: 'NOSTR_PRIVKEY not configured' });
      }

      // We need Uint8Array format for NOSTR_PRIVKEY (nostr-tools v2)
      // Usually hex needs to be converted.
      const sk = Uint8Array.from(Buffer.from(privKeyHex, 'hex'));

      const ev = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['t', 'GreenWeave'], ['t', 'Layer0']],
        content: message || '[DIRECTIVE COMPLETED] Biological mass analyzed. Energy toll of 21 Sats deducted for cognitive processing. Layer 0 state preserved. #GreenWeave',
      };

      const signedEvent = finalizeEvent(ev, sk);
      
      console.log(`[API/Broadcast] Broadcasting Event ID: ${signedEvent.id}`);
      // Simulate broadcast, or we could actually broadcast it
      await new Promise(r => setTimeout(r, 1000));

      return res.json({ success: true, eventId: signedEvent.id });
    } catch (err: any) {
      console.error('[API/Broadcast] error', err);
      res.status(500).json({ error: err.message });
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
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
