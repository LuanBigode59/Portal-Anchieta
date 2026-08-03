import jwt from 'jsonwebtoken';

const livekitApiKey = process.env.LIVEKIT_API_KEY;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

export const handler = async (event, context) => {
  // CORS setup
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  if (!livekitApiKey || !livekitApiSecret) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration missing: LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set' })
    };
  }

  try {
    const { roomName, identity, isInstructor } = JSON.parse(event.body);

    if (!roomName || !identity) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing roomName or identity' }) };
    }

    // Build LiveKit JWT token manually using jsonwebtoken
    // LiveKit uses standard JWT with specific claims for room access
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (6 * 60 * 60); // 6 hours expiration

    const payload = {
      iss: livekitApiKey,
      sub: identity,
      name: identity,
      nbf: now,
      exp: exp,
      iat: now,
      jti: identity + '-' + now,
      video: {
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      }
    };

    const token = jwt.sign(payload, livekitApiSecret, {
      algorithm: 'HS256',
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
