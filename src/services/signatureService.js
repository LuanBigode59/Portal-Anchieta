import { supabase } from '../supabaseClient';
import { userService } from './userService';

// Helper to generate a random hash-like string
const generateSimulatedHash = (dataString) => {
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const randomPart = Math.random().toString(36).substr(2, 8);
  return `sha256_${hex}${randomPart}_officially_signed_choque`;
};

export const signatureService = {
  async getPendingDocuments() {
    try {
      const { data, error } = await supabase
        .from('documentos_oficiais')
        .select('*')
        .eq('status', 'pendente')
        .order('data_criacao', { ascending: false });
      if (error) {
        console.warn('documentos_oficiais não encontrada:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Erro ao buscar documentos pendentes:', err);
      return [];
    }
  },

  async getSignedDocuments() {
    try {
      const { data, error } = await supabase
        .from('documentos_oficiais')
        .select('*')
        .neq('status', 'pendente')
        .order('data_criacao', { ascending: false });
      if (error) {
        console.warn('documentos_oficiais não encontrada:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Erro ao buscar documentos assinados:', err);
      return [];
    }
  },

  async createDocument(docData) {
    const payload = {
      tipo: docData.tipo,
      titulo: docData.titulo,
      dados: docData.dados,
      status: 'pendente',
      data_criacao: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('documentos_oficiais')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async signDocument(docId, signer) {
    // 1. Get the document first
    const { data: doc, error: fetchError } = await supabase
      .from('documentos_oficiais')
      .select('*')
      .eq('id', docId)
      .single();
    if (fetchError) throw fetchError;
    if (doc.status !== 'pendente') throw new Error("Documento já foi processado.");

    const docString = JSON.stringify(doc.dados) + doc.titulo + doc.tipo;
    const hash = generateSimulatedHash(docString);
    const code = `AUTH-${doc.tipo.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // 2. Perform actions based on document type
    try {
      if (doc.tipo === 'promocao') {
        const { target_militar_id, nova_patente, motivo } = doc.dados;
        await userService.registerAction(target_militar_id, 'Promoção', {
          novaPatente: nova_patente,
          motivo: motivo
        });
      } else if (doc.tipo === 'advertencia') {
        const { target_militar_id, tipo_advertencia, motivo } = doc.dados;
        await userService.registerAction(target_militar_id, 'Advertência', {
          tipoAdvertencia: tipo_advertencia,
          motivo: motivo
        });
      } else if (doc.tipo === 'certificado') {
        const { target_militar_id, curso_nome } = doc.dados;
        await userService.registerAction(target_militar_id, 'Curso', {
          cursoNome: curso_nome
        });
      } else if (doc.tipo === 'exoneracao') {
        const { target_militar_id, nome } = doc.dados;
        await userService.registerAction(target_militar_id, 'Exoneração', {
          descricao: `Exonerado do Batalhão por determinação do Comando.`
        });
      } else if (doc.tipo === 'operacao') {
        const { nome, objetivo, equipe, viaturas, data, horario, status, relatorio, fotos } = doc.dados;
        const { error: opError } = await supabase.from('operacoes').insert([{
          nome, objetivo, equipe, viaturas, data, horario, status, relatorio, fotos
        }]);
        if (opError) console.warn("Erro ao inserir operação:", opError);
      }
    } catch (actionError) {
      console.warn("Ação de registro falhou (militar possivelmente não encontrado). Prosseguindo com assinatura.", actionError);
    }

    // 3. Update document status to signed
    const { data, error } = await supabase
      .from('documentos_oficiais')
      .update({
        status: 'assinado',
        assinatura_nome: signer.nome,
        assinatura_patente: signer.patente || signer.cargo,
        assinatura_data: new Date().toISOString(),
        codigo_autenticidade: code,
        hash_seguranca: hash
      })
      .eq('id', docId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async rejectDocument(docId) {
    const { data, error } = await supabase
      .from('documentos_oficiais')
      .update({ status: 'rejeitado' })
      .eq('id', docId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDocument(docId, updates) {
    const { data, error } = await supabase
      .from('documentos_oficiais')
      .update(updates)
      .eq('id', docId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDocument(docId) {
    const { error } = await supabase
      .from('documentos_oficiais')
      .delete()
      .eq('id', docId);
    if (error) throw error;
    return true;
  }
};
