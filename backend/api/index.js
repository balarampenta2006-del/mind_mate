import { connectDB } from '../src/config/database.js';
import app from '../server.js';

/**
 * Vercel Serverless entry point.
 *
 * On every cold start we make sure MongoDB is connected before handing
 * the request to the Express app.  Subsequent warm invocations reuse the
 * same connection thanks to module-level caching.
 */
let dbReady = false;

export default async function handler(req, res) {
  // Fast-path OPTIONS preflight requests so CORS headers are returned immediately
  if (req.method === 'OPTIONS') {
    return app(req, res);
  }

  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
  return app(req, res);
}
