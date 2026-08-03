import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.EXAM_JWT_SECRET || 'fallback-secret-change-me-in-prod';

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

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration missing' })
    };
  }

  try {
    const { participant_id } = JSON.parse(event.body);
    const authHeader = event.headers.authorization;

    if (!participant_id || !authHeader) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required parameters' }) };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user JWT from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // Verify participant is approved
    const { data: participant, error: pError } = await supabase
      .from('proctor_participants')
      .select('*')
      .eq('id', participant_id)
      .eq('student_id', user.id)
      .single();

    if (pError || !participant) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Participant not found' }) };
    }

    if (participant.status !== 'approved' && participant.status !== 'taking_exam') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Not approved for exam' }) };
    }

    // Generate short lived exam token
    const examToken = jwt.sign(
      { 
        session_id: participant.session_id,
        participant_id: participant.id,
        student_id: participant.student_id,
        type: 'exam_access' 
      },
      jwtSecret,
      { expiresIn: '60s' } // 60 seconds expiration
    );

    // Update status to taking_exam if it's currently approved
    if (participant.status === 'approved') {
      await supabase
        .from('proctor_participants')
        .update({ status: 'taking_exam', connected_at: new Date().toISOString() })
        .eq('id', participant.id);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ examToken })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
