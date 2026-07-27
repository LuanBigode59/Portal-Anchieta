import { supabase } from '../supabaseClient';

export const fardamentoService = {
  // Retorna todos os fardamentos
  async obterFardamentos() {
    const { data, error } = await supabase
      .from('fardamentos')
      .select('*, profiles:created_by(nome, patente, cargo)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao obter fardamentos:', error);
      throw error;
    }
    return data || [];
  },

  // Retorna os fardamentos de uma patente específica
  async obterFardamentosPorPatente(patenteId) {
    const { data, error } = await supabase
      .from('fardamentos')
      .select('*, profiles:created_by(nome, patente, cargo)')
      .eq('patente', patenteId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao obter fardamentos da patente:', error);
      throw error;
    }
    return data || [];
  },

  // Faz upload da foto do fardamento no storage
  async uploadFotoFardamento(file) {
    if (!file) return null;
    
    // Gera um nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `fardamentos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('fardamentos_fotos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro ao fazer upload da foto:', uploadError);
      throw uploadError;
    }

    // Pega a URL pública
    const { data } = supabase.storage
      .from('fardamentos_fotos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Insere um novo fardamento
  async adicionarFardamento(fardamentoData) {
    const { data, error } = await supabase
      .from('fardamentos')
      .insert([fardamentoData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar fardamento:', error);
      throw error;
    }
    return data;
  },

  // Deleta um fardamento
  async deletarFardamento(fardamentoId, fotoUrls) {
    // Tenta extrair o path do arquivo a partir das URLs
    if (fotoUrls && Array.isArray(fotoUrls)) {
      try {
        const filePaths = fotoUrls
          .filter(url => url)
          .map(url => {
            const urlParts = url.split('/fardamentos_fotos/');
            return urlParts.length > 1 ? urlParts[1] : null;
          })
          .filter(path => path !== null);

        if (filePaths.length > 0) {
          await supabase.storage.from('fardamentos_fotos').remove(filePaths);
        }
      } catch (e) {
        console.error('Erro ao tentar deletar imagens do storage:', e);
      }
    } else if (typeof fotoUrls === 'string') {
      try {
        const urlParts = fotoUrls.split('/fardamentos_fotos/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('fardamentos_fotos').remove([filePath]);
        }
      } catch (e) {
        console.error('Erro ao tentar deletar imagem do storage:', e);
      }
    }

    const { error } = await supabase
      .from('fardamentos')
      .delete()
      .eq('id', fardamentoId);

    if (error) {
      console.error('Erro ao deletar fardamento:', error);
      throw error;
    }
    return true;
  }
};
