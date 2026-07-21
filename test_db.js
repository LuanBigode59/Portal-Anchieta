import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwwbxgybuprnoqwqivsk.supabase.co';
const supabaseAnonKey = 'sb_publishable_7slLakjK5AdmhbfAR9fN9w_rFW5bKKm';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(2);
  console.log('Error:', error);
  console.log('Data:', data);
}

check();
