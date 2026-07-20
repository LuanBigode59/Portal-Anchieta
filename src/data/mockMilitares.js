export const initialMilitares = [
  {
    id: 'luan-bigode-001',
    nome: 'Luan Bigode',
    cpf: '12345678900',
    discord: 'luanbigode#0000',
    patente: 'tenente_coronel',
    companhia: 'QG / Comando',
    dataIngresso: '2020-01-01',
    status: 'Ativo',
    horasServico: '4500h',
    cursos: [
      { nome: 'Curso de Controle de Distúrbios Civis (CDC)', data: '2020-05-10' },
      { nome: 'Curso de Ações Táticas Especiais (CATE)', data: '2021-08-15' },
      { nome: 'Curso de Formação de Oficiais (CFO)', data: '2019-12-01' }
    ],
    advertencias: [],
    elogios: [
      { data: '2022-09-07', descricao: 'Ato de bravura em operação de resgate.' }
    ],
    promocoes: [
      { data: '2024-01-01', patenteAnterior: 'major', novaPatente: 'tenente_coronel', motivo: 'Merecimento' }
    ],
    condecoracoes: [
      { nome: 'Medalha Sangue de Heróis', data: '2023-11-15' },
      { nome: 'Mérito Policial Militar', data: '2025-05-24' }
    ],
    observacoes: 'Comandante Geral do 2º Batalhão de Polícia de Choque. Conduta exemplar.',
    historico: [
      { data: new Date().toISOString(), tipo: 'Registro', descricao: 'Sistema inicializado.' }
    ]
  },
  {
    id: 'silva-002',
    nome: 'Roberto Silva',
    cpf: '25256',
    discord: 'silva#1234',
    patente: 'cabo',
    companhia: 'Equipe Guardião',
    dataIngresso: '2022-03-10',
    status: 'Ativo',
    horasServico: '1200h',
    cursos: [
      { nome: 'Tiro Policial Nível 1', data: '2022-06-15' }
    ],
    advertencias: [
      { data: '2023-04-12', tipo: 'Advertência Verbal', motivo: 'Atraso na formatura matinal.' }
    ],
    elogios: [],
    promocoes: [
      { data: '2023-12-01', patenteAnterior: 'soldado_primeira', novaPatente: 'cabo', motivo: 'Tempo de Serviço' }
    ],
    condecoracoes: [],
    observacoes: 'Militar aplicado, mas precisa melhorar pontualidade.',
    historico: [
      { data: new Date(Date.now() - 86400000 * 30).toISOString(), tipo: 'Advertência', descricao: 'Recebeu Advertência Verbal por atraso na formatura matinal.' }
    ]
  },
  {
    id: 'oliveira-003',
    nome: 'Lucas Oliveira',
    cpf: '98765',
    discord: 'lucaso#5678',
    patente: 'primeiro_tenente',
    companhia: 'Rocam',
    dataIngresso: '2021-08-20',
    status: 'Ativo',
    horasServico: '2800h',
    cursos: [
      { nome: 'Curso de Formação de Oficiais (CFO)', data: '2020-12-01' },
      { nome: 'Curso de Controle de Distúrbios Civis (CDC)', data: '2022-02-10' }
    ],
    advertencias: [],
    elogios: [
      { data: '2024-05-01', descricao: 'Liderança destacada na Operação Sentinela.' }
    ],
    promocoes: [
      { data: '2025-01-01', patenteAnterior: 'segundo_tenente', novaPatente: 'primeiro_tenente', motivo: 'Merecimento e tempo de serviço' }
    ],
    condecoracoes: [
      { nome: 'Láurea de Mérito Pessoal - 5º Grau', data: '2023-09-10' }
    ],
    observacoes: 'Excelente oficial, perfil de liderança operacional.',
    historico: [
      { data: new Date(Date.now() - 86400000 * 180).toISOString(), tipo: 'Promoção', descricao: 'Promovido a 1º Tenente por merecimento.' }
    ]
  },
  {
    id: 'santos-004',
    nome: 'Marcos Santos',
    cpf: '11223',
    discord: 'msantos#9999',
    patente: 'soldado_segunda',
    companhia: 'Comando',
    dataIngresso: '2024-05-15',
    status: 'Ativo',
    horasServico: '150h',
    cursos: [],
    advertencias: [],
    elogios: [],
    promocoes: [],
    condecoracoes: [],
    observacoes: 'Militar em período de estágio.',
    historico: [
      { data: '2024-05-15T10:00:00Z', tipo: 'Ingresso', descricao: 'Ingresso no 2º BP Choque.' }
    ]
  }
];

// Helper to simulate a database with local storage (if needed) or simple variable for the session.
let currentMilitares = [...initialMilitares];

export const getMilitares = () => {
  return currentMilitares;
};

export const getMilitarById = (id) => {
  return currentMilitares.find(m => m.id === id);
};

export const addMilitar = (militarData) => {
  const novoMilitar = {
    ...militarData,
    id: `militar-${Date.now()}`,
    status: militarData.status || 'Ativo',
    horasServico: militarData.horasServico || '0h',
    cursos: [],
    advertencias: [],
    elogios: [],
    promocoes: [],
    condecoracoes: [],
    historico: [
      { data: new Date().toISOString(), tipo: 'Ingresso', descricao: 'Ingresso no 2º BP Choque.' }
    ]
  };
  currentMilitares = [...currentMilitares, novoMilitar];
  return novoMilitar;
};

export const updateMilitar = (id, updates) => {
  const index = currentMilitares.findIndex(m => m.id === id);
  if (index !== -1) {
    const militar = currentMilitares[index];
    const historicoAtualizado = [...militar.historico];
    
    // Add history entry if there are changes to track
    if (updates.patente && updates.patente !== militar.patente) {
      historicoAtualizado.push({ data: new Date().toISOString(), tipo: 'Alteração de Patente', descricao: `Patente alterada para ${updates.patente}` });
    }
    if (updates.companhia && updates.companhia !== militar.companhia) {
       historicoAtualizado.push({ data: new Date().toISOString(), tipo: 'Transferência', descricao: `Transferido para ${updates.companhia}` });
    }
    if (updates.status && updates.status !== militar.status) {
       historicoAtualizado.push({ data: new Date().toISOString(), tipo: 'Alteração de Status', descricao: `Status alterado para ${updates.status}` });
    }

    currentMilitares[index] = { ...militar, ...updates, historico: historicoAtualizado };
    return currentMilitares[index];
  }
  throw new Error("Militar não encontrado.");
};

export const registerAction = (id, tipo, detalhes) => {
    const index = currentMilitares.findIndex(m => m.id === id);
    if (index !== -1) {
      const militar = currentMilitares[index];
      const historicoEntry = { data: new Date().toISOString(), tipo, descricao: detalhes.descricao };
      
      let updatedMilitar = { ...militar, historico: [historicoEntry, ...militar.historico] };

      if (tipo === 'Promoção') {
          updatedMilitar.promocoes = [{ data: new Date().toISOString(), patenteAnterior: militar.patente, novaPatente: detalhes.novaPatente, motivo: detalhes.motivo }, ...militar.promocoes];
          updatedMilitar.patente = detalhes.novaPatente;
      } else if (tipo === 'Rebaixamento') {
          updatedMilitar.promocoes = [{ data: new Date().toISOString(), patenteAnterior: militar.patente, novaPatente: detalhes.novaPatente, motivo: detalhes.motivo }, ...militar.promocoes];
          updatedMilitar.patente = detalhes.novaPatente;
      } else if (tipo === 'Advertência') {
          updatedMilitar.advertencias = [{ data: new Date().toISOString(), tipo: detalhes.tipoAdvertencia, motivo: detalhes.motivo }, ...militar.advertencias];
      } else if (tipo === 'Elogio') {
          updatedMilitar.elogios = [{ data: new Date().toISOString(), descricao: detalhes.descricao }, ...militar.elogios];
      } else if (tipo === 'Exoneração') {
          updatedMilitar.status = 'Exonerado';
      } else if (tipo === 'Curso') {
          updatedMilitar.cursos = [{ nome: detalhes.cursoNome, data: new Date().toISOString() }, ...militar.cursos];
      }

      currentMilitares[index] = updatedMilitar;
      return updatedMilitar;
    }
    throw new Error("Militar não encontrado.");
};
