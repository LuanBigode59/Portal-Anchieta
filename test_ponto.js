import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qwwbxgybuprnoqwqivsk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2J4Z3lidXBybm9xd3FpdnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5NzY5OCwiZXhwIjoyMDk3MTczNjk4fQ.B2KLznR-zdGBUts8DGTZVVexsbOvXKHReoTyLoC_PrE';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('Testando tabela ponto_eletronico...');
  const { data, error } = await supabase.from('ponto_eletronico').select('*').limit(1);
  console.log('Select:', error ? error.message : 'OK, registros: ' + data.length);
  
  if (error) {
     console.error(error);
  }
}

main().catch(console.error);
