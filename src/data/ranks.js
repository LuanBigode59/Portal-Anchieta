// ========== HIERARQUIA MILITAR COMPLETA — 2º BP CHOQUE ==========

export const rankCategories = {
  OFFICER: 'officer',
  NCO: 'nco',        // Non-commissioned officer (Praças especiais / Graduados)
  ENLISTED: 'enlisted'
};

export const ranks = [
  {
    id: 'tenente_coronel',
    name: 'Tenente-Coronel PM',
    abbreviation: 'TC',
    insignia: '★★✩',
    category: rankCategories.OFFICER,
    order: 1,
    level: 15,
    color: '#FFD700',
    responsibilities: [
      'Comando do Batalhão',
      'Decisões estratégicas e operacionais',
      'Gerenciamento total do efetivo',
      'Aprovação de promoções e exonerações',
      'Representação institucional'
    ],
    functions: [
      'Comandante do 2º BP Choque',
      'Autoridade máxima do batalhão',
      'Responsável pela disciplina e ordem'
    ]
  },
  {
    id: 'major',
    name: 'Major PM',
    abbreviation: 'Maj',
    insignia: '★✩✩',
    category: rankCategories.OFFICER,
    order: 2,
    level: 14,
    color: '#FFD700',
    responsibilities: [
      'Subcomandante do Batalhão',
      'Substituir o Comandante em sua ausência',
      'Supervisionar operações táticas',
      'Gerenciar o Painel Administrativo'
    ],
    functions: [
      'Subcomandante',
      'Chefe do Estado-Maior',
      'Coordenador de operações especiais'
    ]
  },
  {
    id: 'capitao',
    name: 'Capitão PM',
    abbreviation: 'Cap',
    insignia: '☆☆☆',
    category: rankCategories.OFFICER,
    order: 3,
    level: 13,
    color: '#FFD700',
    responsibilities: [
      'Comandar companhias',
      'Planejar e executar operações',
      'Supervisionar instrução de tropa',
      'Avaliar desempenho do efetivo'
    ],
    functions: [
      'Comandante de Companhia',
      'Instrutor-chefe',
      'Oficial de operações'
    ]
  },
  {
    id: 'primeiro_tenente',
    name: '1º Tenente PM',
    abbreviation: '1º Ten',
    insignia: '✩✩',
    category: rankCategories.OFFICER,
    order: 4,
    level: 12,
    color: '#FFD700',
    responsibilities: [
      'Comandar pelotões',
      'Auxiliar o Capitão',
      'Instruir e avaliar tropa',
      'Coordenar escalas de serviço'
    ],
    functions: [
      'Comandante de Pelotão',
      'Oficial de dia',
      'Instrutor de curso'
    ]
  },
  {
    id: 'segundo_tenente',
    name: '2º Tenente PM',
    abbreviation: '2º Ten',
    insignia: '✩',
    category: rankCategories.OFFICER,
    order: 5,
    level: 11,
    color: '#FFD700',
    responsibilities: [
      'Auxiliar na instrução',
      'Comandar grupos de combate',
      'Elaborar relatórios operacionais'
    ],
    functions: [
      'Auxiliar de Pelotão',
      'Oficial de comunicações',
      'Coordenador de treinamento'
    ]
  },
  {
    id: 'aspirante',
    name: 'Aspirante a Oficial PM',
    abbreviation: 'Asp',
    insignia: '✩',
    category: rankCategories.OFFICER,
    order: 6,
    level: 10,
    color: '#FFD700',
    responsibilities: [
      'Estágio probatório como oficial',
      'Auxiliar oficiais superiores',
      'Participar de instrução ativa'
    ],
    functions: [
      'Oficial em formação',
      'Auxiliar administrativo',
      'Supervisor de instrução'
    ]
  },
  {
    id: 'aluno_oficial',
    name: 'Aluno-Oficial PM',
    abbreviation: 'Al Of',
    insignia: '⊕',
    category: rankCategories.OFFICER,
    order: 7,
    level: 9,
    color: '#FFD700',
    responsibilities: [
      'Formação acadêmica militar',
      'Participar de exercícios práticos'
    ],
    functions: [
      'Cadete em formação'
    ]
  },
  {
    id: 'subtenente',
    name: 'Subtenente PM',
    abbreviation: 'SubTen',
    insignia: 'A',
    category: rankCategories.NCO,
    order: 8,
    level: 8,
    color: '#4CAF50',
    responsibilities: [
      'Auxiliar os oficiais',
      'Manutenção da disciplina',
      'Supervisionar sargentos e praças',
      'Gerenciar escala de serviço'
    ],
    functions: [
      'Auxiliar de Pelotão',
      'Chefe de Seção',
      'Sargenteante'
    ]
  },
  {
    id: 'primeiro_sargento',
    name: '1º Sargento PM',
    abbreviation: '1º Sgt',
    insignia: '>>>>>',
    category: rankCategories.NCO,
    order: 9,
    level: 7,
    color: '#4CAF50',
    responsibilities: [
      'Liderar equipes táticas',
      'Instruir soldados e cabos',
      'Supervisionar atividades diárias'
    ],
    functions: [
      'Comandante de Grupo',
      'Instrutor',
      'Supervisor de serviço'
    ]
  },
  {
    id: 'segundo_sargento',
    name: '2º Sargento PM',
    abbreviation: '2º Sgt',
    insignia: '>>>>',
    category: rankCategories.NCO,
    order: 10,
    level: 6,
    color: '#4CAF50',
    responsibilities: [
      'Auxiliar 1º Sargento',
      'Conduzir treinamentos',
      'Fiscalizar atividades'
    ],
    functions: [
      'Auxiliar de Grupo',
      'Instrutor adjunto',
      'Fiscal de dia'
    ]
  },
  {
    id: 'terceiro_sargento',
    name: '3º Sargento PM',
    abbreviation: '3º Sgt',
    insignia: '>>>',
    category: rankCategories.NCO,
    order: 11,
    level: 5,
    color: '#4CAF50',
    responsibilities: [
      'Executar ordens dos superiores',
      'Liderar pequenos grupos',
      'Manter disciplina da tropa'
    ],
    functions: [
      'Líder de equipe',
      'Auxiliar de instrução'
    ]
  },
  {
    id: 'aluno_sargento',
    name: 'Aluno-Sargento PM',
    abbreviation: 'Al Sgt',
    insignia: '>>>',
    category: rankCategories.NCO,
    order: 12,
    level: 4,
    color: '#4CAF50',
    responsibilities: [
      'Formação para graduação de sargento',
      'Participar de cursos e instrução'
    ],
    functions: [
      'Sargento em formação'
    ]
  },
  {
    id: 'cabo',
    name: 'Cabo PM',
    abbreviation: 'Cb',
    insignia: '>>',
    category: rankCategories.ENLISTED,
    order: 13,
    level: 3,
    color: '#a0aec0',
    responsibilities: [
      'Liderar binômios e trinômios',
      'Auxiliar sargentos',
      'Executar patrulhamento'
    ],
    functions: [
      'Líder de equipe',
      'Motorista',
      'Patrulheiro'
    ]
  },
  {
    id: 'soldado_primeira',
    name: 'Soldado 1ª Classe PM',
    abbreviation: 'Sd 1ª Cl',
    insignia: '>',
    category: rankCategories.ENLISTED,
    order: 14,
    level: 2,
    color: '#6b7280',
    responsibilities: [
      'Executar missões designadas',
      'Patrulhamento',
      'Manter equipamento em ordem'
    ],
    functions: [
      'Patrulheiro',
      'Guarda'
    ]
  },
  {
    id: 'soldado_segunda',
    name: 'Soldado 2ª Classe PM',
    abbreviation: 'Sd 2ª Cl',
    insignia: '›',
    category: rankCategories.ENLISTED,
    order: 15,
    level: 1,
    color: '#6b7280',
    responsibilities: [
      'Recém incorporado ao batalhão',
      'Cumprir escalas de serviço',
      'Participar de cursos de formação'
    ],
    functions: [
      'Patrulheiro em formação',
      'Auxiliar de serviço'
    ]
  }
];

export const getRankById = (id) => ranks.find(r => r.id === id);
export const getRankByOrder = (order) => ranks.find(r => r.order === order);
export const getOfficerRanks = () => ranks.filter(r => r.category === rankCategories.OFFICER);
export const getNCORanks = () => ranks.filter(r => r.category === rankCategories.NCO);
export const getEnlistedRanks = () => ranks.filter(r => r.category === rankCategories.ENLISTED);

export const cargoLabels = {
  tenente_coronel: 'Tenente-Coronel',
  major: 'Major',
  capitao: 'Capitão',
  primeiro_tenente: '1º Tenente',
  segundo_tenente: '2º Tenente',
  aspirante: 'Aspirante a Oficial',
  aluno_oficial: 'Aluno-Oficial',
  subtenente: 'Subtenente',
  primeiro_sargento: '1º Sargento',
  segundo_sargento: '2º Sargento',
  terceiro_sargento: '3º Sargento',
  aluno_sargento: 'Aluno-Sargento',
  cabo: 'Cabo',
  soldado_primeira: 'Soldado 1ª Classe',
  soldado_segunda: 'Soldado 2ª Classe',
  instrutor: 'Instrutor',
  cabo_sargento: 'Cabo/Sargento',
  soldado: 'Soldado',
};

export const cargoBadgeClass = {
  tenente_coronel: 'badge-gold',
  major: 'badge-gold',
  capitao: 'badge-gold',
  primeiro_tenente: 'badge-gold',
  segundo_tenente: 'badge-gold',
  aspirante: 'badge-gold',
  aluno_oficial: 'badge-gold',
  subtenente: 'badge-green',
  primeiro_sargento: 'badge-green',
  segundo_sargento: 'badge-green',
  terceiro_sargento: 'badge-green',
  aluno_sargento: 'badge-green',
  cabo: 'badge-steel',
  soldado_primeira: 'badge-steel',
  soldado_segunda: 'badge-steel',
  instrutor: 'badge-green',
  cabo_sargento: 'badge-steel',
  soldado: 'badge-warn',
};
