import { supabase } from '../supabaseClient';

export const docService = {
  // --- BOLETINS INTERNOS ---
  async getBulletins() {
    const { data, error } = await supabase
      .from('boletins')
      .select('*, profiles(nome, cargo)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createBulletin(bulletinData) {
    const { data, error } = await supabase
      .from('boletins')
      .insert([bulletinData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async signBulletin(bulletinId, userSign) {
    const { data: current } = await supabase
      .from('boletins')
      .select('assinaturas')
      .eq('id', bulletinId)
      .single();
    
    const currentSigns = current?.assinaturas || [];
    // Evitar assinar duas vezes
    if (currentSigns.some(s => s.user_id === userSign.user_id)) {
      throw new Error("Você já assinou este boletim.");
    }

    const { data, error } = await supabase
      .from('boletins')
      .update({ assinaturas: [...currentSigns, { ...userSign, data: new Date().toISOString() }] })
      .eq('id', bulletinId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- RELATÓRIOS OPERACIONAIS ---
  async getReports() {
    const { data, error } = await supabase
      .from('relatorios_operacionais')
      .select('*, profiles(nome, cargo)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createReport(reportData) {
    const { data, error } = await supabase
      .from('relatorios_operacionais')
      .insert([reportData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async signReport(reportId, userSign) {
    const { data: current } = await supabase
      .from('relatorios_operacionais')
      .select('assinaturas')
      .eq('id', reportId)
      .single();
    
    const currentSigns = current?.assinaturas || [];
    if (currentSigns.some(s => s.user_id === userSign.user_id)) {
      throw new Error("Você já assinou este relatório.");
    }

    const { data, error } = await supabase
      .from('relatorios_operacionais')
      .update({ assinaturas: [...currentSigns, { ...userSign, data: new Date().toISOString() }] })
      .eq('id', reportId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
