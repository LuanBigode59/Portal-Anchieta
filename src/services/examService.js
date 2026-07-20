import { supabase } from '../supabaseClient';

export const examService = {
  // --- PROVAS ---
  async getExams() {
    const { data, error } = await supabase
      .from('provas')
      .select('*, cursos(nome)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getExamsByCourse(cursoId) {
    const { data, error } = await supabase
      .from('provas')
      .select('*')
      .eq('curso_id', cursoId)
      .eq('status', true);
    if (error) throw error;
    return data || [];
  },

  async getExamById(id) {
    const { data, error } = await supabase
      .from('provas')
      .select('*, cursos(nome)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createExam(examData) {
    const { data, error } = await supabase
      .from('provas')
      .insert([examData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateExam(id, updates) {
    const { data, error } = await supabase
      .from('provas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteExam(id) {
    const { error } = await supabase.from('provas').delete().eq('id', id);
    if (error) throw error;
  },

  // --- RESULTADOS & CERTIFICADOS ---
  async submitExam(militarId, provaId, cursoId, respostasUsuario, score, isApproved, attemptCount) {
    // 1. Salvar o resultado
    const { data: resultado, error: resError } = await supabase
      .from('resultados_provas')
      .insert([{
        militar_id: militarId,
        prova_id: provaId,
        curso_id: cursoId,
        nota: score,
        aprovado: isApproved,
        respostas_usuario: respostasUsuario,
        tentativa_num: attemptCount
      }])
      .select()
      .single();
    if (resError) throw resError;

    let certificado = null;

    // 2. Se aprovado, gerar certificado e retornar
    if (isApproved) {
      // Check if certificate already exists to avoid duplicates
      const { data: existingCert } = await supabase
        .from('certificados')
        .select('*')
        .eq('militar_id', militarId)
        .eq('curso_id', cursoId)
        .single();

      if (!existingCert) {
        const codigo = `CERT-${militarId.split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const { data: newCert, error: certError } = await supabase
          .from('certificados')
          .insert([{
            militar_id: militarId,
            curso_id: cursoId,
            codigo_verificacao: codigo
          }])
          .select()
          .single();
        if (certError) throw certError;
        certificado = newCert;
      } else {
        certificado = existingCert;
      }
    }

    return { resultado, certificado };
  },

  async getAttempts(militarId, provaId) {
    const { data, error } = await supabase
      .from('resultados_provas')
      .select('*')
      .eq('militar_id', militarId)
      .eq('prova_id', provaId);
    if (error) throw error;
    return data || [];
  },
  
  async getCertificatesByUser(militarId) {
    const { data, error } = await supabase
      .from('certificados')
      .select('*, cursos(nome, carga_horaria)')
      .eq('militar_id', militarId)
      .order('data_emissao', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};
