import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Topbar from '../../components/layout/Topbar';
import { ranks, cargoLabels } from '../../data/ranks';
import {
  MdPeople, MdSchool, MdQuiz, MdAssignment, MdGavel, MdStar,
  MdCampaign, MdMilitaryTech, MdCalendarMonth, MdPersonAdd,
  MdDriveFileRenameOutline, MdCheckCircle, MdClose, MdSave,
  MdSecurity, MdDirectionsRun, MdHistory, MdTrendingUp, MdLockOpen
} from 'react-icons/md';
import { GiMedal, GiPoliceBadge } from 'react-icons/gi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';
import { signatureService } from '../../services/signatureService';
import { operationService } from '../../services/operationService';
import { pontoService } from '../../services/pontoService';

// ============ MODAL GENÉRICO ============
function ActionModal({ open, onClose, title, icon, children, onSubmit, submitLabel = 'Confirmar', submitClass = 'btn-green', hideSubmit = false }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box !max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-lg font-black text-gray-100 uppercase tracking-widest">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <MdClose size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          {!hideSubmit && (
            <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-800">
              <button type="button" onClick={onClose} className="btn-steel">Cancelar</button>
              <button type="submit" className={submitClass}>{submitLabel}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const openModal = (name) => setActiveModal(name);
  const closeModal = () => setActiveModal(null);

  const handleSubmit = (msg) => (e) => {
    e.preventDefault();
    sendNotification(msg, 'sucesso');
    closeModal();
  };

  // ===== REAL DATA STATES =====
  const [loadingStats, setLoadingStats] = useState(true);
  const [realStats, setRealStats] = useState({
    totalEfetivo: 0,
    emPatrulha: 0,
    emOperacoes: 0,
    emTreinamento: 0,
    totalCursos: 0,
    totalOperacoes: 0,
    promocoesPendentes: 0,
    advertenciasPendentes: 0,
    certificadosEmitidos: 0,
    docsPendentes: 0
  });
  const [pendingDocs, setPendingDocs] = useState([]);
  const [historyDocs, setHistoryDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // getUsers() already excludes exonerated users, so totalEfetivo = active only
        const users = await userService.getUsers();
        const courses = await courseService.getCourses();
        const ops = await operationService.getOperations();
        const pDocs = await signatureService.getPendingDocuments();
        const signedDocs = await signatureService.getSignedDocuments();
        const totalEmPatrulha = await pontoService.obterTotalEmPatrulha();
        
        setPendingDocs(pDocs);
        setHistoryDocs(signedDocs);
        
        const promocoes = pDocs.filter(d => d.tipo === 'promocao').length;
        const advertencias = pDocs.filter(d => d.tipo === 'advertencia').length;
        const certificados = signedDocs.filter(d => d.tipo === 'certificado').length;
        
        setRealStats({
          totalEfetivo: users.length,
          emPatrulha: totalEmPatrulha,
          emOperacoes: ops.filter(o => o.status === 'planejada').length * 10,
          emTreinamento: courses.length * 5,
          totalCursos: courses.length,
          totalOperacoes: ops.length,
          promocoesPendentes: promocoes,
          advertenciasPendentes: advertencias,
          certificadosEmitidos: certificados,
          docsPendentes: pDocs.length
        });

        // Set recent activities based on signed docs
        const recent = signedDocs.slice(0, 6).map((doc, idx) => {
           let icon = <MdCheckCircle className="text-gray-300" />;
           if (doc.tipo === 'promocao') icon = <MdStar className="text-gold" />;
           if (doc.tipo === 'certificado') icon = <MdSchool className="text-army-green-light" />;
           if (doc.tipo === 'advertencia') icon = <MdGavel className="text-danger-light" />;
           return {
             id: doc.id || idx,
             text: `Documento de ${doc.tipo} (${doc.titulo}) assinado.`,
             time: new Date(doc.assinatura_data || doc.data_criacao).toLocaleString('pt-BR'),
             icon
           }
        });
        setRecentActivities(recent.length > 0 ? recent : [
          { id: 1, text: 'Nenhuma atividade recente no sistema.', time: '', icon: <MdHistory className="text-gray-500" /> }
        ]);

      } catch (err) {
        console.error("Erro ao buscar dados reais", err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchData();
  }, []);

  // Modais de Criação
  const handleCreateDocument = async (e, tipo, titulo, dados) => {
    e.preventDefault();
    try {
      await signatureService.createDocument({ tipo, titulo, dados });
      sendNotification(`${titulo} enviado para assinatura do Comando.`, 'sucesso');
      setRealStats(prev => ({ ...prev, docsPendentes: prev.docsPendentes + 1 }));
      const newDocs = await signatureService.getPendingDocuments();
      const hDocs = await signatureService.getSignedDocuments();
      setPendingDocs(newDocs);
      setHistoryDocs(hDocs);
      closeModal();
    } catch (err) {
      console.error(err);
      sendNotification('Erro ao criar documento.', 'erro');
    }
  };

  const handleSignDocuments = async (e) => {
    e.preventDefault();
    if (selectedDocs.length === 0) {
      sendNotification('Selecione pelo menos um documento.', 'erro');
      return;
    }
    try {
      const { generatePDF } = await import('../../utils/documentGenerator');
      let count = 0;
      for (const docId of selectedDocs) {
        const signedDoc = await signatureService.signDocument(docId, user);
        generatePDF(signedDoc);
        count++;
      }
      sendNotification(`${count} documento(s) assinado(s) com sucesso!`, 'sucesso');
      setPendingDocs(prev => prev.filter(d => !selectedDocs.includes(d.id)));
      
      const newHistory = await signatureService.getSignedDocuments();
      setHistoryDocs(newHistory);
      
      setSelectedDocs([]);
      closeModal();
    } catch (err) {
      console.error(err);
      sendNotification(`Erro ao assinar: ${err.message}`, 'erro');
    }
  };

  const toggleDocSelection = (id) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  // ===== CARDS =====
  const allowedHighRanks = ['capitao', 'major', 'tenente_coronel'];
  const isHighRank = user?.patente && allowedHighRanks.includes(user.patente.toLowerCase());

  const restrictedLabels = [
    'Docs Pendentes',
    'Certificados Emitidos',
    'Promoções Pendentes',
    'Advertências Pendentes',
    'Em Treinamento'
  ];

  const statCards = [
    { label: 'Policiais Ativos', value: realStats.totalEfetivo, icon: <MdPeople />, color: 'text-army-green-light', border: 'border-army-green' },
    { label: 'Em Patrulha', value: realStats.emPatrulha, icon: <MdSecurity />, color: 'text-gold', border: 'border-gold' },
    { label: 'Em Operações', value: realStats.emOperacoes, icon: <MdMilitaryTech />, color: 'text-danger-light', border: 'border-danger' },
    { label: 'Em Treinamento', value: realStats.emTreinamento, icon: <MdDirectionsRun />, color: 'text-choque-yellow', border: 'border-choque-yellow' },
    { label: 'Total de Cursos', value: realStats.totalCursos, icon: <MdSchool />, color: 'text-gray-300', border: 'border-gray-500' },
    { label: 'Total de Operações', value: realStats.totalOperacoes, icon: <MdCampaign />, color: 'text-gold-light', border: 'border-gold-light' },
    { label: 'Promoções Pendentes', value: realStats.promocoesPendentes, icon: <MdStar />, color: 'text-warn-light', border: 'border-warn' },
    { label: 'Advertências Pendentes', value: realStats.advertenciasPendentes, icon: <MdGavel />, color: 'text-danger-light', border: 'border-danger' },
    { label: 'Certificados Emitidos', value: realStats.certificadosEmitidos, icon: <MdCheckCircle />, color: 'text-army-green-light', border: 'border-army-green' },
    { label: 'Docs Pendentes', value: realStats.docsPendentes, icon: <MdAssignment />, color: 'text-gold', border: 'border-gold' },
  ].filter(card => {
    if (restrictedLabels.includes(card.label)) return isHighRank;
    return true;
  });

  const calendarEvents = [
    { id: 1, date: '15/07', category: 'Escalas', title: 'Troca de Turno Alpha', color: 'bg-army-green' },
    { id: 2, date: '16/07', category: 'Treinamentos', title: 'Treinamento Tático de Choque', color: 'bg-choque-yellow text-mil-black' },
    { id: 3, date: '18/07', category: 'Operações', title: 'Operação Muro de Escudos', color: 'bg-danger' },
  ];

  const quickAccessButtons = [
    { label: 'Novo Boletim', icon: <MdCampaign />, color: 'text-gray-300', modal: 'boletim' },
    { label: 'Nova Operação', icon: <MdMilitaryTech />, color: 'text-danger-light', modal: 'operacao' },
    { label: 'Novo Curso', icon: <MdSchool />, color: 'text-army-green-light', modal: 'curso' },
    { label: 'Nova Prova', icon: <MdQuiz />, color: 'text-gold-light', modal: 'prova' },
    { label: 'Nova Advertência', icon: <MdGavel />, color: 'text-danger', modal: 'advertencia' },
    { label: 'Nova Promoção', icon: <MdStar />, color: 'text-gold', modal: 'promocao' },
    { label: 'Novo Certificado', icon: <GiMedal />, color: 'text-choque-yellow', modal: 'certificado' },
    { label: 'Assinar Documentos', icon: <MdDriveFileRenameOutline />, color: 'text-gray-200', modal: 'documentos' },
    { label: 'Histórico de Documentos', icon: <MdLockOpen />, color: 'text-gray-300', modal: 'historico_docs' },
    { label: 'Adicionar Militar', icon: <MdPersonAdd />, color: 'text-army-green-light', modal: 'militar' },
  ];

  const performanceData = [
    { name: 'Seg', ops: 2, treinos: 1 },
    { name: 'Ter', ops: 3, treinos: 2 },
    { name: 'Qua', ops: 1, treinos: 3 },
    { name: 'Qui', ops: 4, treinos: 1 },
    { name: 'Sex', ops: 5, treinos: 4 },
  ];

  const efetivoCompanhias = [
    { name: 'Comando', value: realStats.totalEfetivo > 0 ? realStats.totalEfetivo - 105 : 12 },
    { name: 'Equipe Guardião', value: 45 },
    { name: 'Rocam', value: 40 },
    { name: 'Operacional', value: 20 },
  ];

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="PORTAL ANCHIETA" subtitle={`Bem-vindo, ${user?.nome}`} />

      {/* Hero Central Command Card */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-mil-dark via-[#111] to-[#0a0a0a] p-6 sm:p-8 mb-8 shadow-[0_10px_40px_rgba(201,168,76,0.15)]">
        <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-20 pointer-events-none">
          <img src="/logos/logo.png" alt="Logo" className="w-32 h-32 sm:w-40 sm:h-40 object-contain" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#111] to-[#050505] border-2 border-gold flex items-center justify-center text-gold font-black text-4xl shadow-gold-lg flex-shrink-0 overflow-hidden">
            {user?.foto_url ? (
              <img src={user.foto_url} alt={user.nome} className="w-full h-full object-cover" />
            ) : (
              user?.nome?.charAt(0)
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-100 tracking-wide">{user?.nome}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 flex-wrap">
              <span className="badge-gold !text-xs !px-3 !py-1">{cargoLabels[user?.cargo] || user?.cargo?.replace('_', ' ').toUpperCase() || 'PORTAL ANCHIETA'}</span>
              <span className="badge-steel font-mono">ID: {user?.cpf}</span>
            </div>
            <p className="text-gold mt-3 font-mono text-sm uppercase tracking-widest">{cargoLabels[user?.patente] || user?.patente}</p>
          </div>
          <div className="hidden lg:block text-right self-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Unidade Operacional</p>
            <p className="text-army-green-light font-black text-lg tracking-wider mt-1">{user?.companhia}</p>
          </div>
        </div>
      </div>

      {/* 10 STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`mil-card flex flex-col justify-center border-t-2 ${card.border} !p-4 group hover:-translate-y-1 transition-all`}>
            <div className="flex items-start justify-between mb-2">
              <div className={`text-2xl ${card.color} opacity-80 group-hover:scale-110 transition-transform`}>{card.icon}</div>
              <p className="text-2xl sm:text-3xl font-black text-gray-100">{card.value}</p>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-bold leading-tight">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* GRÁFICOS (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mil-card">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdTrendingUp className="text-gold" /> Evolução Semanal
            </h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b1a1a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b1a1a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTreinos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a8c34" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4a8c34" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} />
                  <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="ops" stroke="#8b1a1a" fillOpacity={1} fill="url(#colorOps)" name="Operações" strokeWidth={2} />
                  <Area type="monotone" dataKey="treinos" stroke="#4a8c34" fillOpacity={1} fill="url(#colorTreinos)" name="Treinamentos" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mil-card">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MdPeople className="text-gold" /> Distribuição de Efetivo
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efetivoCompanhias} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#666" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#999" fontSize={11} width={80} />
                  <Tooltip cursor={{ fill: '#1a1a1a' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Bar dataKey="value" name="Policiais" radius={[0, 4, 4, 0]} barSize={24}>
                    {efetivoCompanhias.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4a8c34' : index === 1 ? '#c9a84c' : index === 2 ? '#8b1a1a' : '#555'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ATIVIDADE + CALENDÁRIO (1/3) */}
        <div className="space-y-6">
          <div className="mil-card h-[310px] overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2 pb-3 border-b border-gray-800 shrink-0">
              <MdHistory className="text-gold" /> Atividade Recente
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {recentActivities.map(a => (
                <div key={a.id} className="flex items-start gap-3 group cursor-default">
                  <div className="mt-1 bg-mil-black border border-gray-800 p-1.5 rounded-lg group-hover:border-gold/30 transition-colors">{a.icon}</div>
                  <div>
                    <p className="text-sm text-gray-300 leading-snug group-hover:text-gray-100 transition-colors">{a.text}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mil-card">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2 pb-3 border-b border-gray-800">
              <MdCalendarMonth className="text-gold" /> Calendário Militar
            </h3>
            <div className="space-y-3">
              {calendarEvents.map(evt => (
                <div key={evt.id} className="flex items-center gap-3 bg-mil-black/50 border border-gray-800 rounded-lg p-2.5">
                  <div className="text-center min-w-[45px] border-r border-gray-700 pr-3">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{evt.date.split('/')[1]}</p>
                    <p className="text-lg font-black text-gray-200 leading-none">{evt.date.split('/')[0]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-200 truncate">{evt.title}</p>
                    <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${evt.color}`}>{evt.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ACESSO RÁPIDO */}
      {user && ['capitao', 'major', 'tenente_coronel'].includes(user.cargo) && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Acesso Rápido / Ações de Comando</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {quickAccessButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => openModal(btn.modal)}
                className="bg-mil-card hover:bg-[#151515] border border-mil-border hover:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
              >
                <div className={`text-3xl mb-2 group-hover:scale-110 transition-transform ${btn.color}`}>{btn.icon}</div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-gold transition-colors">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========== MODAIS FUNCIONAIS ========== */}

      {/* Novo Boletim */}
      <ActionModal open={activeModal === 'boletim'} onClose={closeModal} title="Novo Boletim" icon={<MdCampaign className="text-2xl text-gold" />} onSubmit={(e) => handleCreateDocument(e, 'boletim', e.target.titulo.value, { categoria: e.target.categoria.value, conteudo: e.target.conteudo.value })} submitLabel="Publicar Boletim" submitClass="btn-gold">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Título do Boletim</label>
            <input type="text" name="titulo" className="mil-input" placeholder="Ex: Boletim Interno nº 045/2026" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Categoria</label>
            <select name="categoria" className="mil-select">
              <option>Comunicado Geral</option>
              <option>Ordem de Serviço</option>
              <option>Nota Informativa</option>
              <option>Escala Especial</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Conteúdo</label>
            <textarea name="conteudo" className="mil-textarea" placeholder="Redija o conteúdo do boletim..." rows={4} required />
          </div>
        </div>
      </ActionModal>

      {/* Nova Operação */}
      <ActionModal open={activeModal === 'operacao'} onClose={closeModal} title="Nova Operação" icon={<MdMilitaryTech className="text-2xl text-danger-light" />} onSubmit={(e) => handleCreateDocument(e, 'operacao', e.target.titulo.value, { data_inicio: e.target.data_inicio.value, data_fim: e.target.data_fim.value, local: e.target.local.value, briefing: e.target.briefing.value })} submitLabel="Iniciar Operação" submitClass="btn-danger">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome da Operação</label>
            <input type="text" name="titulo" className="mil-input" placeholder="Ex: Operação Sentinela" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data Início</label>
              <input type="date" name="data_inicio" className="mil-input" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Previsão de Término</label>
              <input type="date" name="data_fim" className="mil-input" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Local / Área</label>
            <input type="text" name="local" className="mil-input" placeholder="Ex: Zona Leste — Setor 4" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Briefing Operacional</label>
            <textarea name="briefing" className="mil-textarea" placeholder="Detalhes e objetivos da operação..." rows={3} />
          </div>
        </div>
      </ActionModal>

      {/* Novo Curso */}
      <ActionModal open={activeModal === 'curso'} onClose={closeModal} title="Novo Curso" icon={<MdSchool className="text-2xl text-army-green-light" />} onSubmit={(e) => handleCreateDocument(e, 'curso', e.target.titulo.value, { carga_horaria: e.target.carga_horaria.value, nota_minima: e.target.nota_minima.value, descricao: e.target.descricao.value })} submitLabel="Criar Curso" submitClass="btn-green">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome do Curso</label>
            <input type="text" name="titulo" className="mil-input" placeholder="Ex: Curso de Controle de Distúrbios Civis" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Carga Horária</label>
              <input type="number" name="carga_horaria" className="mil-input" placeholder="40" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nota Mínima</label>
              <input type="number" name="nota_minima" className="mil-input" placeholder="7.0" step="0.1" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descrição</label>
            <textarea name="descricao" className="mil-textarea" placeholder="Descrição do curso, pré-requisitos, etc." rows={3} />
          </div>
        </div>
      </ActionModal>

      {/* Nova Prova */}
      <ActionModal open={activeModal === 'prova'} onClose={closeModal} title="Nova Prova" icon={<MdQuiz className="text-2xl text-gold-light" />} onSubmit={(e) => handleCreateDocument(e, 'prova', e.target.titulo.value, { curso_vinculado: e.target.curso.value, questoes: e.target.questoes.value, tempo: e.target.tempo.value })} submitLabel="Criar Prova" submitClass="btn-gold">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Título da Prova</label>
            <input type="text" name="titulo" className="mil-input" placeholder="Ex: Prova de Conhecimentos Táticos" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Curso Vinculado</label>
            <select name="curso" className="mil-select">
              <option>Selecione o curso</option>
              <option>Curso de CDC</option>
              <option>Tiro Policial</option>
              <option>Operações Especiais</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nº de Questões</label>
              <input type="number" name="questoes" className="mil-input" placeholder="20" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tempo (min)</label>
              <input type="number" name="tempo" className="mil-input" placeholder="60" />
            </div>
          </div>
        </div>
      </ActionModal>

      {/* Nova Advertência */}
      <ActionModal open={activeModal === 'advertencia'} onClose={closeModal} title="Nova Advertência" icon={<MdGavel className="text-2xl text-danger-light" />} onSubmit={(e) => handleCreateDocument(e, 'advertencia', `Advertência - ${e.target.militar.value}`, { target_militar_id: e.target.militar.value, tipo_advertencia: e.target.tipo.value, motivo: e.target.motivo.value })} submitLabel="Registrar Advertência" submitClass="btn-danger">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Militar Advertido</label>
            <input type="text" name="militar" className="mil-input" placeholder="Nome ou ID do militar" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tipo</label>
            <select name="tipo" className="mil-select">
              <option>Advertência Verbal</option>
              <option>Advertência Escrita</option>
              <option>Repreensão</option>
              <option>Detenção</option>
              <option>Suspensão</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Motivo</label>
            <textarea name="motivo" className="mil-textarea" placeholder="Descreva o motivo detalhado da advertência..." rows={3} required />
          </div>
        </div>
      </ActionModal>

      {/* Nova Promoção */}
      <ActionModal open={activeModal === 'promocao'} onClose={closeModal} title="Nova Promoção" icon={<MdStar className="text-2xl text-gold" />} onSubmit={(e) => handleCreateDocument(e, 'promocao', `Promoção - ${e.target.militar.value}`, { target_militar_id: e.target.militar.value, nova_patente: e.target.patente.value, motivo: e.target.motivo.value })} submitLabel="Confirmar Promoção" submitClass="btn-gold">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Militar</label>
            <input type="text" name="militar" className="mil-input" placeholder="Nome ou ID do militar" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nova Patente</label>
            <select name="patente" className="mil-select">
              {ranks.map(r => <option key={r.id} value={r.id}>{r.insignia} {r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Motivo da Promoção</label>
            <textarea name="motivo" className="mil-textarea" placeholder="Mérito, tempo de serviço, aprovação em curso..." rows={3} required />
          </div>
        </div>
      </ActionModal>

      {/* Novo Certificado */}
      <ActionModal open={activeModal === 'certificado'} onClose={closeModal} title="Novo Certificado" icon={<GiMedal className="text-2xl text-choque-yellow" />} onSubmit={(e) => handleCreateDocument(e, 'certificado', `Certificado - ${e.target.militar.value}`, { target_militar_id: e.target.militar.value, curso_nome: e.target.curso.value, instrutor: e.target.instrutor.value, data: e.target.data.value })} submitLabel="Emitir Certificado" submitClass="btn-choque">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Militar</label>
            <input type="text" name="militar" className="mil-input" placeholder="Nome ou ID do militar" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Curso / Treinamento</label>
              <select name="curso" className="mil-select">
                <option>Curso de CDC</option>
                <option>Tiro Policial</option>
                <option>Operações Especiais</option>
                <option>Primeiros Socorros</option>
                <option>Direção Defensiva</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data de Conclusão</label>
              <input type="date" name="data" className="mil-input" required />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Instrutor Responsável</label>
            <input type="text" name="instrutor" className="mil-input" placeholder="Ex: Sargento Rocha" required />
          </div>
        </div>
      </ActionModal>

      {/* Assinar Documentos */}
      <ActionModal open={activeModal === 'documentos'} onClose={closeModal} title="Assinar Documentos" icon={<MdDriveFileRenameOutline className="text-2xl text-gray-200" />} onSubmit={handleSignDocuments} submitLabel="Assinar Selecionados" submitClass="btn-green">
        <div className="space-y-3">
          <p className="text-xs text-gray-400 mb-2">Selecione os documentos para assinatura digital:</p>
          {pendingDocs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-800 rounded-lg">Não há documentos pendentes.</p>
          ) : (
            pendingDocs.map(doc => {
              const autor = doc.dados?.autor_nome || (doc.tipo === 'certificado' ? doc.dados?.target_militar_nome : 'Sistema');
              return (
                <label key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-mil-black/50 border border-gray-800 hover:border-gold/30 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedDocs.includes(doc.id)} onChange={() => toggleDocSelection(doc.id)} className="w-4 h-4 accent-army-green rounded" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 font-bold uppercase">{doc.tipo}: {doc.titulo}</p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Criado em: {new Date(doc.data_criacao).toLocaleDateString('pt-BR')} 
                      <span className="text-gray-400 font-bold ml-1">por {autor}</span>
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </ActionModal>

      {/* Adicionar Militar */}
      <ActionModal open={activeModal === 'militar'} onClose={closeModal} title="Adicionar Militar" icon={<MdPersonAdd className="text-2xl text-army-green-light" />} onSubmit={handleSubmit('Militar adicionado com sucesso!')} submitLabel="Cadastrar Militar" submitClass="btn-green">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome Completo</label>
            <input type="text" className="mil-input" placeholder="Ex: João Pedro Silva" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Matrícula / ID</label>
              <input type="text" className="mil-input" placeholder="Ex: 25256" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Patente Inicial</label>
              <select className="mil-select">
                <option value="soldado_segunda">Soldado 2ª Classe PM</option>
                <option value="soldado_primeira">Soldado 1ª Classe PM</option>
                <option value="cabo">Cabo PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Companhia</label>
            <select className="mil-select">
              <option>Comando</option>
              <option>Equipe Guardião</option>
              <option>Rocam</option>
              <option>Operacional</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Discord ID (Opcional)</label>
            <input type="text" className="mil-input" placeholder="usuario#0000" />
          </div>
        </div>
      </ActionModal>

      {/* Histórico de Documentos */}
      <ActionModal open={activeModal === 'historico_docs'} onClose={closeModal} title="Histórico de Documentos" icon={<MdLockOpen className="text-2xl text-gray-200" />} hideSubmit={true}>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {historyDocs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-800 rounded-lg">Não há documentos assinados no histórico.</p>
          ) : (
            historyDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-mil-black/50 border border-gray-800 transition-colors">
                <div className="flex-1">
                  <p className="text-sm text-gray-200 font-bold uppercase">{doc.tipo}: {doc.titulo}</p>
                  <p className="text-[10px] text-gray-500 font-mono">Assinado em: {doc.assinatura_data ? new Date(doc.assinatura_data).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
                <button type="button" onClick={() => {
                  import('../../utils/documentGenerator').then(m => m.generatePDF(doc));
                }} className="btn-gold !py-1.5 !px-3 !text-[10px]">
                  Baixar PDF
                </button>
              </div>
            ))
          )}
        </div>
      </ActionModal>

    </div>
  );
}
