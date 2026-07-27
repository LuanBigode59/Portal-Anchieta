import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qwwbxgybuprnoqwqivsk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2J4Z3lidXBybm9xd3FpdnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NzY5OCwiZXhwIjoyMDk3MTczNjk4fQ.B2KLznR-zdGBUts8DGTZVVexsbOvXKHReoTyLoC_PrE';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('Atualizando tabela fardamentos...\n');

  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query: `
      ALTER TABLE public.fardamentos
      ADD COLUMN IF NOT EXISTS nome VARCHAR,
      ADD COLUMN IF NOT EXISTS foto_lado_direito TEXT,
      ADD COLUMN IF NOT EXISTS foto_lado_esquerdo TEXT,
      ADD COLUMN IF NOT EXISTS foto_costas TEXT;

      ALTER TABLE public.fardamentos ALTER COLUMN patente DROP NOT NULL;
      ` 
    })
  });
  
  const txt = await res.text();
  console.log('pg/query status:', res.status, txt.substring(0, 300));

  const check = await supabase.from('fardamentos').select('id, nome, foto_lado_direito').limit(1);
  console.log('\nfardamentos atualizada?', check.error ? 'NAO - ' + check.error.message : 'SIM ✅');
}

main().catch(console.error);
