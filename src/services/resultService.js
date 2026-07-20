import { supabase } from '../supabaseClient';

export const resultService = {
  async getAllResults() {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, profiles(nome, patente, cargo), exams(nome, curso_id)')
      .order('finalizada_em', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getResultsByUser(userId) {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, exams(nome, curso_id)')
      .eq('usuario_id', userId)
      .order('finalizada_em', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getResultsByExam(examId) {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, profiles(nome, patente)')
      .eq('prova_id', examId)
      .order('nota', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};
