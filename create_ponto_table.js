import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qwwbxgybuprnoqwqivsk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2J4Z3lidXBybm9xd3FpdnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NzY5OCwiZXhwIjoyMDk3MTczNjk4fQ.B2KLznR-zdGBUts8DGTZVVexsbOvXKHReoTyLoC_PrE';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('Tentando criar tabela ponto_eletronico e coluna banco_horas em profiles...\n');

  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query: `
      CREATE TABLE IF NOT EXISTS public.ponto_eletronico (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        entrada TIMESTAMPTZ DEFAULT NOW(),
        saida TIMESTAMPTZ,
        tempo_segundos INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Aberto'
      );
      
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banco_horas INTEGER DEFAULT 0;
      ` 
    })
  });
  
  const txt = await res.text();
  console.log('pg/query status:', res.status, txt.substring(0, 300));

  const check = await supabase.from('ponto_eletronico').select('id').limit(1);
  console.log('\nponto_eletronico existe?', check.error ? 'NAO - ' + check.error.message : 'SIM ✅');
}

main().catch(console.error);
