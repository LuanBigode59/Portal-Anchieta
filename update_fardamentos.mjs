import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('fardamentos')
    .update({ patente: 'Operacional' })
    .neq('patente', 'Operacional');
    
  console.log('Update 1:', error || 'Success');

  const { data: d2, error: e2 } = await supabase
    .from('fardamentos')
    .update({ patente: 'Operacional' })
    .is('patente', null);

  console.log('Update 2:', e2 || 'Success');
}

run();
