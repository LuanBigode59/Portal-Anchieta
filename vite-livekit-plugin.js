import { AccessToken } from 'livekit-server-sdk';
import { loadEnv } from 'vite';

/**
 * Vite plugin that creates a local endpoint for generating LiveKit tokens.
 * This replaces the Netlify function during local development.
 */
export default function livekitTokenPlugin() {
  let env = {};
  return {
    name: 'livekit-token-dev',
    config(config, { mode }) {
      env = loadEnv(mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use('/.netlify/functions/generate-livekit-token', async (req, res) => {
        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { roomName, identity, isInstructor } = JSON.parse(body);

            if (!roomName || !identity) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Missing roomName or identity' }));
            }

            const apiKey = env.LIVEKIT_API_KEY;
            const apiSecret = env.LIVEKIT_API_SECRET;

            if (!apiKey || !apiSecret) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: 'LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set in .env' }));
            }

            const at = new AccessToken(apiKey, apiSecret, {
              identity: identity,
              name: identity,
            });

            at.addGrant({
              roomJoin: true,
              room: roomName,
              canPublish: true,
              canSubscribe: true,
              canPublishData: true,
            });

            const token = await at.toJwt();

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ token }));
          } catch (error) {
            console.error('LiveKit token error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      });
    }
  };
}
