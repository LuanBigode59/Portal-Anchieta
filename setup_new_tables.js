import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://qwwbxgybuprnoqwqivsk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2J4Z3lidXBybm9xd3FpdnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NzY5OCwiZXhwIjoyMDk3MTczNjk4fQ.B2KLznR-zdGBUts8DGTZVVexsbOvXKHReoTyLoC_PrE';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  const query = `
    -- Escalas
    CREATE TABLE IF NOT EXISTS public.escalas (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      data DATE NOT NULL,
      tipo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Elogios
    CREATE TABLE IF NOT EXISTS public.elogios (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      remetente_id UUID REFERENCES auth.users(id),
      destinatario_id UUID REFERENCES auth.users(id),
      mensagem TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Reclamações
    CREATE TABLE IF NOT EXISTS public.reclamacoes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      autor_id UUID REFERENCES auth.users(id),
      mensagem TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Sugestões
    CREATE TABLE IF NOT EXISTS public.sugestoes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      autor_id UUID REFERENCES auth.users(id),
      mensagem TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Configuração de permissões RLS simplificadas para as novas tabelas (permitir all)
    ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.elogios ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.reclamacoes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Enable all access for escalas" ON public.escalas;
    CREATE POLICY "Enable all access for escalas" ON public.escalas FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Enable all access for elogios" ON public.elogios;
    CREATE POLICY "Enable all access for elogios" ON public.elogios FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Enable all access for reclamacoes" ON public.reclamacoes;
    CREATE POLICY "Enable all access for reclamacoes" ON public.reclamacoes FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Enable all access for sugestoes" ON public.sugestoes;
    CREATE POLICY "Enable all access for sugestoes" ON public.sugestoes FOR ALL USING (true) WITH CHECK (true);

    -- Add dificuldade to cursos
    ALTER TABLE IF EXISTS public.cursos ADD COLUMN IF NOT EXISTS dificuldade TEXT DEFAULT 'Básico';
  `;

  console.log('Executando query para criar tabelas...\\n');

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

  // Checks
  const t1 = await supabase.from('escalas').select('id').limit(1);
  const t2 = await supabase.from('elogios').select('id').limit(1);
  
  console.log('Tabelas criadas com sucesso?', !t1.error && !t2.error ? 'SIM ✅' : 'NAO - ' + (t1.error?.message || t2.error?.message));
}

main().catch(console.error);
