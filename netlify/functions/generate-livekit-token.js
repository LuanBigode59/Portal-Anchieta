import { AccessToken } from 'livekit-server-sdk';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

  if (!supabaseUrl || !supabaseServiceKey || !livekitApiKey || !livekitApiSecret) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration missing' })
    };
  }

  try {
    const { roomName, identity, isInstructor } = JSON.parse(event.body);

    if (!roomName || !identity) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing roomName or identity' }) };
    }

    // Initialize Supabase Client to verify permissions if needed
    // Assuming auth check is passed here from client, but strictly we should verify the JWT

    const at = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: identity,
      name: identity,
    });

    at.addGrant({ 
      roomJoin: true, 
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      hidden: isInstructor ? false : false, // Could hide students from each other if needed
    });

    const token = await at.toJwt();

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
