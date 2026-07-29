import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testDelete() {
  const { data, error, count } = await supabase
    .from('resultados_provas')
    .delete({ count: 'exact' })
    .eq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log("Delete test:", { data, error, count });
}

testDelete();
