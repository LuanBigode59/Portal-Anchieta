import { supabase } from '../supabaseClient';

export const medalService = {
  async getMedals() {
    const { data, error } = await supabase
      .from('medalhas')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getMedalById(id) {
    const { data, error } = await supabase
      .from('medalhas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createMedal(medalData) {
    const { data, error } = await supabase
      .from('medalhas')
      .insert([medalData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMedal(id, updates) {
    const { data, error } = await supabase
      .from('medalhas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMedal(id) {
    const { error } = await supabase.from('medalhas').delete().eq('id', id);
    if (error) throw error;
  }
};
