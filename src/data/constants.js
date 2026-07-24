// ========== CONSTANTES DO SISTEMA — 2º BP CHOQUE ==========

export const APP_NAME = '2º BP CHOQUE Anchieta';
export const APP_FULL_NAME = '2º Batalhão de Polícia de Choque Anchieta';
export const APP_VERSION = 'v2.0.0';
export const APP_YEAR = '2026';

export const COMPANIES = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Comando'];

export const WARNING_TYPES = {
  VERBAL: { id: 'verbal', label: 'Verbal', severity: 1, color: '#f9a825', badge: 'badge-warn' },
  ESCRITA: { id: 'escrita', label: 'Escrita', severity: 2, color: '#e65100', badge: 'badge-warn' },
  GRAVE: { id: 'grave', label: 'Grave', severity: 3, color: '#c62828', badge: 'badge-danger' },
};

export const SCHEDULE_TYPES = {
  SERVICO: { id: 'servico', label: 'Serviço', color: '#4a8c34', icon: '🛡️' },
  FOLGA: { id: 'folga', label: 'Folga', color: '#6b7280', icon: '🏠' },
  OPERACAO: { id: 'operacao', label: 'Operação', color: '#c62828', icon: '⚔️' },
  PLANTAO: { id: 'plantao', label: 'Plantão', color: '#f9a825', icon: '🔔' },
  INSTRUTOR: { id: 'instrutor', label: 'Instrutor', color: '#2d5a1e', icon: '📚' },
};

export const REPORT_TYPES = {
  RSO: { id: 'rso', label: 'RSO — Relatório de Serviço Operacional' },
  RIP: { id: 'rip', label: 'RIP — Relatório de Informação Policial' },
  OCORRENCIA: { id: 'ocorrencia', label: 'Ocorrência' },
};

export const BULLETIN_TYPES = {
  BOLETIM: { id: 'boletim', label: 'Boletim Interno', icon: '📋', color: '#c9a84c' },
  PROMOCAO: { id: 'promocao', label: 'Promoção', icon: '⭐', color: '#FFD700' },
  ADVERTENCIA: { id: 'advertencia', label: 'Advertência', icon: '⚠️', color: '#c62828' },
  MUDANCA: { id: 'mudanca', label: 'Mudança', icon: '🔄', color: '#4a8c34' },
  ESCALA: { id: 'escala', label: 'Escala', icon: '📅', color: '#6b7280' },
  OPERACAO: { id: 'operacao', label: 'Operação', icon: '⚔️', color: '#8b1a1a' },
};

export const COURSE_CATEGORIES = [
  { id: 'formacao', label: 'Curso de Formação', color: '#c9a84c' },
  { id: 'choque_1', label: 'CHOQUE I', color: '#c62828' },
  { id: 'choque_2', label: 'CHOQUE II', color: '#8b1a1a' },
  { id: 'patrulhamento', label: 'Patrulhamento', color: '#4a8c34' },
  { id: 'abordagem', label: 'Abordagem', color: '#2d5a1e' },
  { id: 'cqb', label: 'CQB', color: '#6b7280' },
  { id: 'armamento', label: 'Armamento', color: '#DAA520' },
];

export const COURSE_ICONS = [
  { id: 'MdWarning', label: 'Atenção (Alerta)', icon: 'MdWarning' },
  { id: 'MdSchool', label: 'Geral (Escola)', icon: 'MdSchool' },
  { id: 'MdSecurity', label: 'Segurança (Escudo)', icon: 'MdSecurity' },
  { id: 'MdDirectionsCar', label: 'Patrulhamento (Viatura)', icon: 'MdDirectionsCar' },
  { id: 'MdSettingsInputAntenna', label: 'Comunicações (Rádio)', icon: 'MdSettingsInputAntenna' },
  { id: 'MdGroups', label: 'Formação/Choque (Grupo)', icon: 'MdGroups' },
  { id: 'MdMilitaryTech', label: 'Graduação (Medalha)', icon: 'MdMilitaryTech' },
  { id: 'MdRecordVoiceOver', label: 'Liderança (Pessoa falando)', icon: 'MdRecordVoiceOver' },
  { id: 'MdDescription', label: 'Relatório (Documento)', icon: 'MdDescription' },
  { id: 'MdGavel', label: 'Leis/Códigos (Martelo)', icon: 'MdGavel' },
];

export const ADMIN_ROLES = ['tenente_coronel', 'major'];
export const INSTRUCTOR_ROLES = ['tenente_coronel', 'major', 'capitao', 'instrutor'];
export const COMMAND_ROLES = ['tenente_coronel', 'major', 'capitao', 'primeiro_tenente'];

export const WHATSAPP_LINK = 'https://wa.me/group-link';

export const NOTIFICATION_TYPES = {
  CURSO: { id: 'curso', label: 'Curso Pendente', icon: '📚' },
  ADVERTENCIA: { id: 'advertencia', label: 'Nova Advertência', icon: '⚠️' },
  PROMOCAO: { id: 'promocao', label: 'Nova Promoção', icon: '⭐' },
  COMUNICADO: { id: 'comunicado', label: 'Novo Comunicado', icon: '📢' },
  PROVA: { id: 'prova', label: 'Prova Disponível', icon: '📝' },
  OPERACAO: { id: 'operacao', label: 'Nova Operação', icon: '⚔️' },
};
