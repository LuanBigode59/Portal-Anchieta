import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUser() {
  const { data, error } = await supabase
    .from('profiles')
    .select('nome, cpf, cargo, patente')
    .ilike('nome', '%Luan%');
    
  console.log('User profiles for Luan:', data);
}

checkUser();
