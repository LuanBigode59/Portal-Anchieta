import { supabase } from '../supabaseClient';

export const pontoService = {
  // Retorna o ponto aberto (se houver) para o usuário
  async obterPontoAtual(userId) {
    const { data, error } = await supabase
      .from('ponto_eletronico')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'Aberto')
      .order('entrada', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao obter ponto atual:', error);
      throw error;
    }
    
    return data || null;
  },

  // Retorna o histórico de pontos do usuário
  async obterHistorico(userId) {
    const { data, error } = await supabase
      .from('ponto_eletronico')
      .select('*')
      .eq('user_id', userId)
      .order('entrada', { ascending: false });

    if (error) {
      console.error('Erro ao obter histórico de pontos:', error);
      throw error;
    }

    return data;
  },

  // Retorna o total de militares com ponto aberto
  async obterTotalEmPatrulha() {
    const { count, error } = await supabase
      .from('ponto_eletronico')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Aberto');

    if (error) {
      console.error('Erro ao obter total em patrulha:', error);
      return 0;
    }
    
    return count || 0;
  },

  // Inicia um novo turno de ponto
  async baterPontoEntrada(userId) {
    // Verifica se já existe um ponto aberto
    const pontoAtual = await this.obterPontoAtual(userId);
    if (pontoAtual) {
      throw new Error('Você já possui um ponto em aberto.');
    }

    const { data, error } = await supabase
      .from('ponto_eletronico')
      .insert([
        { 
          user_id: userId,
          status: 'Aberto',
          entrada: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao bater ponto de entrada:', error);
      throw error;
    }

    return data;
  },

  // Encerra o turno atual e adiciona as horas ao banco do perfil
  async baterPontoSaida(pontoId, userId) {
    // Primeiro obtem o ponto para saber a hora de entrada
    const { data: ponto, error: getError } = await supabase
      .from('ponto_eletronico')
      .select('*')
      .eq('id', pontoId)
      .single();
      
    if (getError) throw getError;
    if (ponto.status === 'Fechado') throw new Error('Este ponto já foi fechado.');

    const agora = new Date();
    const entrada = new Date(ponto.entrada);
    const diferencaSegundos = Math.floor((agora - entrada) / 1000);

    // 1. Atualizar o ponto
    const { data: pontoAtualizado, error: updateError } = await supabase
      .from('ponto_eletronico')
      .update({
        saida: agora.toISOString(),
        tempo_segundos: diferencaSegundos,
        status: 'Fechado'
      })
      .eq('id', pontoId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao bater ponto de saída:', updateError);
      throw updateError;
    }

    // 2. Atualizar o banco de horas no profile
    // Obter o perfil atual
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('banco_horas')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    const novoBanco = (profile.banco_horas || 0) + diferencaSegundos;
    
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ banco_horas: novoBanco })
      .eq('id', userId);
      
    if (updateProfileError) throw updateProfileError;

    return pontoAtualizado;
  }
};
