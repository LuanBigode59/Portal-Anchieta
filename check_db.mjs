import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const { data } = await supabase.from('resultados_provas')
  .select('*, profiles(nome)')
  .order('created_at', { ascending: false })
  .limit(10);
console.log(JSON.stringify(data, null, 2));
