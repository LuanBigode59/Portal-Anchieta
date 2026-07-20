import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qwwbxgybuprnoqwqivsk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2J4Z3lidXBybm9xd3FpdnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NzY5OCwiZXhwIjoyMDk3MTczNjk4fQ.B2KLznR-zdGBUts8DGTZVVexsbOvXKHReoTyLoC_PrE';

async function checkPolicies() {
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query: `
      SELECT polname, polcmd, polqual, polwithcheck 
      FROM pg_policy 
      WHERE polrelid = (SELECT oid FROM pg_class WHERE relname = 'chat_messages');
    ` })
  });
  
  const text = await res.text();
  console.log(text);
}

checkPolicies();
