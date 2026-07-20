import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { signatureService } from '../../services/signatureService';
import { ranks, cargoLabels, cargoBadgeClass } from '../../data/ranks';
import { MdStar, MdArrowUpward, MdCheckCircle, MdErrorOutline, MdSend, MdDoneAll, MdBlock } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { evaluatePromotion } from '../../utils/promotionLogic';
import { getRankById } from '../../data/ranks';

export default function ManagePromotions() {
  const { user: currentUser, userRankLevel } = useAuth();
  const [users, setUsers] = useState([]);
  const [evaluatedUsers, setEvaluatedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState('Atingiu os critérios matemáticos de elegibilidade por tempo de serviço e mérito.');
  
  const { sendNotification } = useNotifications();

  // Verifica se o usuário atual é o Comando Geral (Tenente Coronel ou Coronel)
  const isComandoGeral = ['tenente_coronel', 'coronel'].includes(currentUser?.cargo);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      // Avaliar todos os usuários com o novo motor
      const evaluated = data.map(u => ({
        ...u,
        evaluation: evaluatePromotion(u)
      })).filter(u => u.evaluation && u.evaluation.nextRank); // Ocultar quem já é Coronel (topo)

      // Ordenar por elegibilidade (elegíveis primeiro) e depois por percentual/score
      evaluated.sort((a, b) => {
        if (a.evaluation.eligible !== b.evaluation.eligible) {
          return a.evaluation.eligible ? -1 : 1;
        }
        return b.evaluation.percentage - a.evaluation.percentage;
      });

      setEvaluatedUsers(evaluated);
    } catch (err) { 
      console.error(err); 
      sendNotification("Erro ao buscar militares", "erro");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAction = (user) => {
    const targetRankLvl = getRankById(user.patente)?.level || 0;
    const nextRankLvl = getRankById(user.evaluation.nextRank.id)?.level || 0;
    
    if (userRankLevel <= targetRankLvl || userRankLevel <= nextRankLvl) {
      sendNotification("Você não tem nível hierárquico suficiente para promover este militar.", "erro");
      return;
    }
    
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      const targetRank = selectedUser.evaluation.nextRank;

      if (isComandoGeral) {
        // APROVAÇÃO DIRETA: Atualiza cargo e registra histórico
        await userService.updateUser(selectedUser.id, { cargo: targetRank.id });
        await userService.registerAction(selectedUser.id, 'Promoção', {
          descricao: `Promovido a ${targetRank.name} por mérito e atingimento de metas. Motivo/Parecer: ${reason}`
        });
        sendNotification(`${selectedUser.nome} foi promovido para ${targetRank.name} com sucesso!`, "sucesso");
      } else {
        // ENVIAR PARA APROVAÇÃO: Cria documento de assinatura
        const payload = {
          tipo: 'promocao',
          titulo: `Recomendação de Promoção: ${selectedUser.nome}`,
          dados: {
            target_militar_id: selectedUser.id,
            target_militar_nome: selectedUser.nome,
            patente_atual: cargoLabels[selectedUser.cargo] || selectedUser.patente,
            nova_patente: `${targetRank.insignia} ${targetRank.name}`,
            nova_patente_id: targetRank.id,
            score_atingido: selectedUser.evaluation.score,
            motivo: reason
          }
        };
        await signatureService.createDocument(payload);
        sendNotification("Recomendação de promoção enviada ao Comando Geral!", "sucesso");
      }
      
      setShowModal(false);
      loadUsers(); // Recarrega lista
    } catch (err) {
      sendNotification(err.message, "erro");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  const eligiblesCount = evaluatedUsers.filter(u => u.evaluation.eligible).length;

  return (
    <div className="animate-fadeIn pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <MdStar className="text-gold" /> Sistema Inteligente de Promoções
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">
          Avaliação Automática de Mérito, Cursos e Operações
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-gray-800 p-5 rounded-xl">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Avaliado</p>
          <p className="text-3xl font-black text-gray-200">{evaluatedUsers.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-army-green/30 p-5 rounded-xl shadow-[0_0_15px_rgba(74,140,52,0.1)]">
          <p className="text-[10px] text-army-green uppercase tracking-widest font-bold mb-1">Elegíveis (Meta Atingida)</p>
          <p className="text-3xl font-black text-army-green-light">{eligiblesCount}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-gold/30 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gold uppercase tracking-widest font-bold mb-1">Autoridade Logada</p>
            <p className="text-lg font-black text-white">{isComandoGeral ? 'COMANDO GERAL' : 'OFICIAL SUPERIOR'}</p>
          </div>
          <MdStar className="text-4xl text-gold/20" />
        </div>
      </div>

      <div className="space-y-4">
        {evaluatedUsers.map((user, i) => {
          const evalData = user.evaluation;
          const isEligible = evalData.eligible;

          return (
            <div key={user.id} className={`bg-[#0a0a0a] p-5 flex flex-col lg:flex-row lg:items-center gap-6 border rounded-xl shadow-lg transition-all ${isEligible ? 'border-army-green/50 bg-[#0a0f0a]' : 'border-gray-800 opacity-80'}`} style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}>
              
              {/* Info do Militar */}
              <div className="flex items-center gap-4 lg:w-1/3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 border ${isEligible ? 'bg-gradient-to-br from-army-green-dark to-army-green border-army-green-light/50 shadow-[0_0_15px_rgba(74,140,52,0.3)]' : 'bg-[#111] border-gray-700'}`}>
                  {user.nome?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-100 uppercase tracking-widest">{user.nome}</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">{cargoLabels[user.cargo] || user.patente}</p>
                </div>
              </div>

              {/* Progressão */}
              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <MdArrowUpward className={isEligible ? 'text-army-green-light' : 'text-gray-600'} />
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Próxima: <span className="text-white">{evalData.nextRank?.name}</span></span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-black ${isEligible ? 'text-army-green-light' : 'text-gray-300'}`}>{evalData.score} <span className="text-[10px] text-gray-500 font-normal">/ {evalData.threshold} pts</span></span>
                  </div>
                </div>
                
                {/* Barra de progresso */}
                <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden border border-gray-800">
                  <div 
                    className={`h-full transition-all duration-1000 ${isEligible ? 'bg-army-green shadow-[0_0_10px_#4a8c34]' : 'bg-gray-600'}`}
                    style={{ width: `${evalData.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isEligible ? 'text-army-green-light' : 'text-red-500'}`}>
                    {isEligible ? <><MdCheckCircle className="inline mr-1"/> Elegível</> : <><MdErrorOutline className="inline mr-1"/> Não Elegível</>}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">{evalData.percentage}% concluído</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-[#0f120f] border-t border-gray-800 p-4">
                {isEligible ? (
                  userRankLevel > (getRankById(evalData.nextRank.id)?.level || 0) ? (
                    <button onClick={() => openAction(user)} className="btn-green w-full flex items-center justify-center gap-2 py-3 shadow-[0_0_15px_rgba(74,140,52,0.3)] hover:shadow-[0_0_25px_rgba(74,140,52,0.5)]">
                      <MdDoneAll className="text-xl" /> ASSINAR PROMOÇÃO AGORA
                    </button>
                  ) : (
                    <button disabled className="btn-steel w-full flex items-center justify-center gap-2 py-3 opacity-50 cursor-not-allowed">
                      <MdBlock className="text-xl" /> HIERARQUIA INSUFICIENTE
                    </button>
                  )
                ) : (
                  userRankLevel > (getRankById(evalData.nextRank.id)?.level || 0) ? (
                    <button onClick={() => openAction(user)} className="btn-gold w-full flex items-center justify-center gap-2 opacity-80 hover:opacity-100">
                      <MdArrowUpward className="text-xl" /> FORÇAR PROMOÇÃO MANUAL
                    </button>
                  ) : (
                    <button disabled className="btn-steel w-full flex items-center justify-center gap-2 opacity-30 cursor-not-allowed">
                      <MdBlock className="text-xl" /> HIERARQUIA INSUFICIENTE
                    </button>
                  )
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal de Ação */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeInUp">
            
            <div className={`p-6 border-b ${isComandoGeral ? 'bg-gold/10 border-gold/30' : 'bg-army-green/10 border-army-green/30'}`}>
              <h2 className={`text-lg font-black uppercase tracking-widest flex items-center gap-2 ${isComandoGeral ? 'text-gold' : 'text-army-green-light'}`}>
                {isComandoGeral ? <MdDoneAll /> : <MdSend />}
                {isComandoGeral ? 'Aprovação Final' : 'Recomendar Promoção'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">Militar: {selectedUser.nome}</p>
            </div>

            <form onSubmit={handleAction} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Próxima Patente</label>
                <div className="p-3 bg-[#111] border border-gray-800 rounded text-gray-300 font-bold flex items-center gap-2">
                  <MdArrowUpward className="text-army-green-light" />
                  {selectedUser.evaluation.nextRank?.name}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Motivo / Parecer Técnico</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#111] border border-gray-800 p-3 rounded text-sm text-gray-300 outline-none focus:border-army-green/50 min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-[#111] border border-gray-800 text-gray-400 rounded text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-3 text-black rounded text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isComandoGeral ? 'bg-gold hover:bg-gold-light' : 'bg-army-green-light hover:bg-army-green'
                  }`}
                >
                  {isComandoGeral ? 'Aprovar Agora' : 'Enviar Documento'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
