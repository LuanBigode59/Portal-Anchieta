import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qwwbxgybuprnoqwqivsk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2J4Z3lidXBybm9xd3FpdnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NzY5OCwiZXhwIjoyMDk3MTczNjk4fQ.B2KLznR-zdGBUts8DGTZVVexsbOvXKHReoTyLoC_PrE';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('Tentando criar tabela fardamentos e storage...\n');

  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query: `
      CREATE TABLE IF NOT EXISTS public.fardamentos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        patente VARCHAR NOT NULL,
        descricao TEXT NOT NULL,
        foto_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID REFERENCES public.profiles(id)
      );
      
      -- RLS
      ALTER TABLE public.fardamentos ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Leitura publica de fardamentos" ON public.fardamentos;
      CREATE POLICY "Leitura publica de fardamentos" 
      ON public.fardamentos FOR SELECT TO public USING (true);

      DROP POLICY IF EXISTS "Autenticados podem inserir fardamentos" ON public.fardamentos;
      CREATE POLICY "Autenticados podem inserir fardamentos" 
      ON public.fardamentos FOR INSERT TO authenticated WITH CHECK (true);

      DROP POLICY IF EXISTS "Autenticados podem deletar fardamentos" ON public.fardamentos;
      CREATE POLICY "Autenticados podem deletar fardamentos" 
      ON public.fardamentos FOR DELETE TO authenticated USING (true);
      ` 
    })
  });
  
  const txt = await res.text();
  console.log('pg/query status:', res.status, txt.substring(0, 300));

  // Storage
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.id === 'fardamentos_fotos')) {
    const { data: bucket, error } = await supabase.storage.createBucket('fardamentos_fotos', { public: true });
    if (error) console.error('Erro ao criar bucket:', error);
    else console.log('Bucket fardamentos_fotos criado!');
  } else {
    console.log('Bucket fardamentos_fotos já existe.');
  }

  const check = await supabase.from('fardamentos').select('id').limit(1);
  console.log('\nfardamentos existe?', check.error ? 'NAO - ' + check.error.message : 'SIM ✅');
}

main().catch(console.error);
