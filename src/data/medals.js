// ========== MEDALHAS DO SISTEMA — 2º BP CHOQUE ==========

export const medalTypes = {
  OPERACAO: 'operacao',
  TEMPO: 'tempo',
  HONRA: 'honra',
  MERITO: 'merito',
  BRAVURA: 'bravura',
  INSTRUTOR: 'instrutor',
  MELHOR_MES: 'melhor_mes',
};

export const medals = [
  {
    id: 'medalha_operacao',
    name: 'Medalha de Operação',
    type: medalTypes.OPERACAO,
    icon: '🎖️',
    description: 'Concedida por participação destacada em operações especiais.',
    color: '#4a8c34',
    criteria: 'Participar de 10+ operações com resultado positivo.'
  },
  {
    id: 'medalha_tempo_1',
    name: 'Medalha de Tempo de Serviço — Bronze',
    type: medalTypes.TEMPO,
    icon: '🥉',
    description: '3 meses de serviço ativo no batalhão.',
    color: '#cd7f32',
    criteria: '90 dias de serviço ativo.'
  },
  {
    id: 'medalha_tempo_2',
    name: 'Medalha de Tempo de Serviço — Prata',
    type: medalTypes.TEMPO,
    icon: '🥈',
    description: '6 meses de serviço ativo no batalhão.',
    color: '#C0C0C0',
    criteria: '180 dias de serviço ativo.'
  },
  {
    id: 'medalha_tempo_3',
    name: 'Medalha de Tempo de Serviço — Ouro',
    type: medalTypes.TEMPO,
    icon: '🥇',
    description: '1 ano de serviço ativo no batalhão.',
    color: '#FFD700',
    criteria: '365 dias de serviço ativo.'
  },
  {
    id: 'medalha_honra',
    name: 'Medalha de Honra ao Mérito',
    type: medalTypes.HONRA,
    icon: '⭐',
    description: 'Concedida por atos de honra e ética exemplares.',
    color: '#e0c068',
    criteria: 'Indicação do comando por conduta exemplar.'
  },
  {
    id: 'medalha_merito',
    name: 'Medalha de Mérito Policial',
    type: medalTypes.MERITO,
    icon: '🏅',
    description: 'Concedida por desempenho excepcional em serviço.',
    color: '#c9a84c',
    criteria: 'Média de notas acima de 9.0 em todos os cursos.'
  },
  {
    id: 'medalha_bravura',
    name: 'Medalha de Bravura',
    type: medalTypes.BRAVURA,
    icon: '🦅',
    description: 'Concedida por atos de bravura em situações de risco.',
    color: '#8b1a1a',
    criteria: 'Indicação especial por ato de bravura comprovado.'
  },
  {
    id: 'medalha_instrutor',
    name: 'Medalha de Instrutor',
    type: medalTypes.INSTRUTOR,
    icon: '📚',
    description: 'Concedida por contribuição como instrutor do batalhão.',
    color: '#2d5a1e',
    criteria: 'Ministrar 5+ cursos com avaliação positiva dos alunos.'
  },
  {
    id: 'medalha_melhor_mes',
    name: 'Militar Destaque do Mês',
    type: medalTypes.MELHOR_MES,
    icon: '🏆',
    description: 'Reconhecimento como o melhor militar do mês.',
    color: '#FFD700',
    criteria: 'Eleito pelo comando como destaque do mês.'
  },
];

export const getMedalById = (id) => medals.find(m => m.id === id);
export const getMedalsByType = (type) => medals.filter(m => m.type === type);
