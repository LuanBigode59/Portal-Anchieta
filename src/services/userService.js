import { supabase } from '../supabaseClient';

export const userService = {
  // Returns only ACTIVE military (excludes exonerated)
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('status', 'Exonerado')
      .order('nome');
    if (error) throw error;
    
    // Parse arrays that might come as strings or nulls
    return data.map(m => ({
      ...m,
      cursos: m.cursos || [],
      advertencias: m.advertencias || [],
      elogios: m.elogios || [],
      promocoes: m.promocoes || [],
      condecoracoes: m.condecoracoes || [],
      historico: m.historico || [],
      status: m.status || 'Ativo',
      companhia: m.companhia || 'QG / Comando',
      horasServico: m.horas_servico || '0h'
    })) || [];
  },

  // Returns ALL users (for internal use, like counting total)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nome');
    if (error) throw error;
    
    return data.map(m => ({
      ...m,
      cursos: m.cursos || [],
      advertencias: m.advertencias || [],
      elogios: m.elogios || [],
      promocoes: m.promocoes || [],
      condecoracoes: m.condecoracoes || [],
      historico: m.historico || [],
      status: m.status || 'Ativo',
      companhia: m.companhia || 'QG / Comando',
      horasServico: m.horas_servico || '0h'
    })) || [];
  },

  // Returns only EXONERATED military
  async getExonerated() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'Exonerado')
      .order('nome');
    if (error) throw error;
    
    return data.map(m => ({
      ...m,
      cursos: m.cursos || [],
      advertencias: m.advertencias || [],
      elogios: m.elogios || [],
      promocoes: m.promocoes || [],
      condecoracoes: m.condecoracoes || [],
      historico: m.historico || [],
      status: m.status || 'Exonerado',
      companhia: m.companhia || 'QG / Comando',
      horasServico: m.horas_servico || '0h'
    })) || [];
  },

  async getUserById(id) {
    let query = supabase.from('profiles').select('*');
    
    // Check if ID looks like a UUID
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(id)) {
      query = query.eq('id', id).single();
    } else {
      query = query.ilike('nome', `%${id}%`).limit(1).single();
    }

    const { data, error } = await query;
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
    
    if (data) {
       data.cursos = data.cursos || [];
       data.advertencias = data.advertencias || [];
       data.elogios = data.elogios || [];
       data.promocoes = data.promocoes || [];
       data.condecoracoes = data.condecoracoes || [];
       data.historico = data.historico || [];
       data.status = data.status || 'Ativo';
       data.companhia = data.companhia || 'QG / Comando';
       data.horasServico = data.horas_servico || '0h';
    }
    return data;
  },

  async updateUser(id, updates) {
    if (updates.patente) {
      updates.cargo = updates.patente;
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addMilitar(militarData) {
    // Usually auth register creates the profile, but for manual addition by Commander:
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: militarData.id || crypto.randomUUID(), // If no auth id, we generate a random UUID for the profile (this isn't standard Supabase auth flow, but works for mock manual inserts)
          nome: militarData.nome,
          cpf: militarData.cpf,
          cargo: militarData.patente,
          patente: militarData.patente, // Store raw rank id, we can format it in UI
          companhia: militarData.companhia,
          discord: militarData.discord,
          observacoes: militarData.observacoes,
          status: 'Ativo',
          horas_servico: '0h',
          cursos: [],
          advertencias: [],
          elogios: [],
          promocoes: [],
          condecoracoes: [],
          historico: [
            { data: new Date().toISOString(), tipo: 'Ingresso', descricao: 'Ingresso manual no 2º BP Choque.' }
          ]
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async registerAction(id, tipo, detalhes) {
    const militar = await this.getUserById(id);
    if (!militar) throw new Error("Militar não encontrado");

    const historicoEntry = { data: new Date().toISOString(), tipo, descricao: detalhes.descricao };
    let updates = { historico: [historicoEntry, ...militar.historico] };

    if (tipo === 'Promoção' || tipo === 'Rebaixamento') {
        updates.promocoes = [{ data: new Date().toISOString(), patenteAnterior: militar.cargo, novaPatente: detalhes.novaPatente, motivo: detalhes.motivo }, ...militar.promocoes];
        updates.cargo = detalhes.novaPatente;
        updates.patente = detalhes.novaPatente;
    } else if (tipo === 'Advertência') {
        updates.advertencias = [{ data: new Date().toISOString(), tipo: detalhes.tipoAdvertencia, motivo: detalhes.motivo }, ...militar.advertencias];
    } else if (tipo === 'Elogio') {
        updates.elogios = [{ data: new Date().toISOString(), descricao: detalhes.descricao }, ...militar.elogios];
    } else if (tipo === 'Exoneração') {
        updates.status = 'Exonerado';
        updates.ativo = false;
    } else if (tipo === 'Curso') {
        updates.cursos = [{ nome: detalhes.cursoNome, data: new Date().toISOString() }, ...militar.cursos];
    }

    return await this.updateUser(id, updates);
  },

  // Reintegrate an exonerated military back to active duty
  async reintegrateMilitar(id) {
    const militar = await this.getUserById(id);
    if (!militar) throw new Error("Militar não encontrado");

    const historicoEntry = { 
      data: new Date().toISOString(), 
      tipo: 'Reintegração', 
      descricao: 'Reintegrado ao 2º BP Choque por determinação do Comando.' 
    };

    const updates = {
      status: 'Ativo',
      ativo: true,
      historico: [historicoEntry, ...militar.historico]
    };

    return await this.updateUser(id, updates);
  }
};

