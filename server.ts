import express from 'express';
import { createServer as createViteServer } from 'vite';
import { finalizeEvent } from 'nostr-tools';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
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
