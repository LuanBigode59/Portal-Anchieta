import { getRankById, ranks } from '../data/ranks';

export const SCORE_WEIGHTS = {
  curso: 15,
  operacao: 5,
  mesServico: 2, // Em vez de ano, vamos somar 2 pts por mês ativo
  elogio: 10,
  condecoracao: 25,
  advertencia: -30,
};

// Exigência de pontuação para alcançar a próxima patente
const RANK_THRESHOLDS = {
  'aluno': 50,
  'soldado': 150,
  'cabo': 300,
  'cabo_sargento': 500,
  'subtenente': 750,
  'tenente': 1000,
  'capitao': 1500,
  'major': 2000,
  'tenente_coronel': 3000,
  'coronel': Infinity, // Patente máxima, não promove por pontos
};

// Retorna a próxima patente no plano de carreira militar do Batalhão
export const getNextRank = (currentRankId) => {
  const currentIndex = ranks.findIndex(r => r.id === currentRankId);
  if (currentIndex === -1 || currentIndex === 0) return null; // Não há patente acima ou erro
  return ranks[currentIndex - 1]; // O array `ranks` geralmente está ordenado do maior (Coronel) pro menor (Soldado).
};

export const calculateMilitaryScore = (user) => {
  if (!user) return 0;

  let totalScore = 0;

  // 1. Cursos
  const cursosCount = user.cursos ? user.cursos.length : 0;
  totalScore += cursosCount * SCORE_WEIGHTS.curso;

  // 2. Operações
  const operacoesCount = user.operacoes ? user.operacoes.length : 0;
  totalScore += operacoesCount * SCORE_WEIGHTS.operacao;

  // 3. Elogios
  const elogiosCount = user.elogios ? user.elogios.length : 0;
  totalScore += elogiosCount * SCORE_WEIGHTS.elogio;

  // 4. Condecorações (Medalhas de mérito, etc)
  const condecoracoesCount = user.medalhas_concedidas ? user.medalhas_concedidas.length : 0;
  totalScore += condecoracoesCount * SCORE_WEIGHTS.condecoracao;

  // 5. Advertências (Pesam negativo)
  const advertenciasCount = user.advertencias ? user.advertencias.length : 0;
  totalScore += advertenciasCount * SCORE_WEIGHTS.advertencia;

  // 6. Tempo de Serviço
  if (user.data_ingresso) {
    const dataIngresso = new Date(user.data_ingresso);
    const hoje = new Date();
    const meses = (hoje.getFullYear() - dataIngresso.getFullYear()) * 12 + (hoje.getMonth() - dataIngresso.getMonth());
    if (meses > 0) {
      totalScore += meses * SCORE_WEIGHTS.mesServico;
    }
  }

  // Não pode ser menor que 0
  return Math.max(0, totalScore);
};

export const evaluatePromotion = (user) => {
  if (!user || !user.cargo) return null;

  const score = calculateMilitaryScore(user);
  const nextRank = getNextRank(user.cargo);

  if (!nextRank) {
    return {
      score,
      nextRank: null,
      eligible: false,
      percentage: 100,
      threshold: null,
    };
  }

  const threshold = RANK_THRESHOLDS[user.cargo] || Infinity;
  let percentage = (score / threshold) * 100;
  if (percentage > 100) percentage = 100;

  return {
    score,
    nextRank,
    eligible: score >= threshold,
    percentage: parseFloat(percentage.toFixed(1)),
    threshold,
  };
};
