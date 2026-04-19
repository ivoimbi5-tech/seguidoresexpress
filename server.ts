import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
try {
  admin.initializeApp({
    projectId: "gen-lang-client-0626746561"
  });
} catch (e) {
  console.error('Firebase Admin Init Error:', e);
}

const dbInstance = admin.firestore();
// Target the specific database ID if necessary
try {
  dbInstance.settings({ 
    databaseId: 'ai-studio-f1551a99-588b-4388-b362-bd4f1d3fc933' 
  });
} catch (e) {
  // If settings already applied or other error
  console.log('Note: Firestore settings update skipped or failed');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
