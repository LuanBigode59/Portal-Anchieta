import { supabase } from '../supabaseClient';

export const operationService = {
  async getOperations() {
    const { data, error } = await supabase
      .from('operacoes')
      .select('*')
      .order('data', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createOperation(opData) {
    const { data, error } = await supabase
      .from('operacoes')
      .insert([opData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateOperation(id, updates) {
    const { data, error } = await supabase
      .from('operacoes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteOperation(id) {
    const { error } = await supabase
      .from('operacoes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
