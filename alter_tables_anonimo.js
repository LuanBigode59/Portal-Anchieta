import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qwwbxgybuprnoqwqivsk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2J4Z3lidXBybm9xd3FpdnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NzY5OCwiZXhwIjoyMDk3MTczNjk4fQ.B2KLznR-zdGBUts8DGTZVVexsbOvXKHReoTyLoC_PrE';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  const query = `
    ALTER TABLE public.reclamacoes ADD COLUMN IF NOT EXISTS is_anonimo BOOLEAN DEFAULT false;
    ALTER TABLE public.sugestoes ADD COLUMN IF NOT EXISTS is_anonimo BOOLEAN DEFAULT false;
  `;

  console.log('Adicionando coluna is_anonimo...');

  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query })
  });
  
  const txt = await res.text();
  console.log('pg/query status:', res.status, txt.substring(0, 300));
}

main().catch(console.error);
