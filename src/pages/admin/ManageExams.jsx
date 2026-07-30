import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdQuiz, MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdAddCircleOutline, MdCheckCircle, MdRefresh } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { examService } from '../../services/examService';
import { courseService } from '../../services/courseService';

export default function ManageExams() {
  const { sendNotification } = useNotifications();
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('provas');
  const [blockedUsers, setBlockedUsers] = useState([]);

  const [formData, setFormData] = useState({
    curso_id: '',
    titulo: '',
    descricao: '',
    tempo_minutos: 60,
    tentativas_permitidas: 3,
    nota_aprovacao: 70,
    status: true,
    perguntas: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [examsData, coursesData, blockedData] = await Promise.all([
        examService.getExams(),
        courseService.getCourses(),
        examService.getBlockedUsers()
      ]);
      setExams(examsData);
      setCourses(coursesData);
      setBlockedUsers(blockedData);
    } catch (err) {
      sendNotification("Erro ao carregar banco de provas", 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (exam = null) => {
    if (exam) {
      setEditingId(exam.id);
      setFormData({
        curso_id: exam.curso_id || '',
        titulo: exam.titulo || '',
        descricao: exam.descricao || '',
        tempo_minutos: exam.tempo_minutos || 60,
        tentativas_permitidas: exam.tentativas_permitidas || 3,
        nota_aprovacao: exam.nota_aprovacao || 70,
        status: exam.status,
        perguntas: exam.perguntas || []
      });
    } else {
      setEditingId(null);
      setFormData({
        curso_id: '', titulo: '', descricao: '', tempo_minutos: 60,
        tentativas_permitidas: 3, nota_aprovacao: 70, status: true,
        perguntas: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Funções para gerenciar perguntas do JSON
  const addQuestion = () => {
    setFormData({
      ...formData,
      perguntas: [
        ...formData.perguntas,
        {
          tipo: 'alternativas',
          pergunta: 'Nova Pergunta',
          alternativas: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
          corretaIndex: 0,
          respostaCorretaTexto: ''
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newPerguntas = [...formData.perguntas];
    newPerguntas.splice(index, 1);
    setFormData({ ...formData, perguntas: newPerguntas });
  };

  const handleQuestionChange = (index, field, value) => {
    const newPerguntas = [...formData.perguntas];
    newPerguntas[index][field] = value;
    setFormData({ ...formData, perguntas: newPerguntas });
  };

  const handleAlternativeChange = (qIndex, aIndex, value) => {
    const newPerguntas = [...formData.perguntas];
    newPerguntas[qIndex].alternativas[aIndex] = value;
    setFormData({ ...formData, perguntas: newPerguntas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.curso_id) {
      sendNotification("Selecione um curso para vincular à prova.", "aviso");
      return;
    }
    
    try {
      if (editingId) {
        await examService.updateExam(editingId, formData);
        sendNotification("Prova atualizada com sucesso!", 'sucesso');
      } else {
        await examService.createExam(formData);
        sendNotification("Prova criada com sucesso!", 'sucesso');
      }
      closeModal();
      loadData();
    } catch (err) {
      sendNotification(err.message, 'erro');
    }
  };

  const handleDelete = async (id, titulo) => {
    if (window.confirm(`Tem certeza que deseja apagar a prova "${titulo}"?`)) {
      try {
        await examService.deleteExam(id);
        sendNotification("Prova deletada.", 'sucesso');
        loadData();
      } catch (err) {
        sendNotification(err.message, 'erro');
      }
    }
  };

  const handleUnblock = async (resultadoId, militarNome) => {
    if (window.confirm(`Tem certeza que deseja liberar ${militarNome}? Isso apagará a última tentativa reprovada dele.`)) {
      try {
        await examService.unblockUser(resultadoId);
        sendNotification("Militar liberado com sucesso!", 'sucesso');
        loadData();
      } catch (err) {
        sendNotification("Erro ao liberar militar.", 'erro');
      }
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Topbar title="GERENCIAR PROVAS" subtitle="Banco de Questões e Avaliações" />
        {activeTab === 'provas' && (
          <button 
            onClick={() => openModal()}
            className="btn-green self-start sm:self-auto flex items-center justify-center gap-2"
          >
            <MdAdd className="text-xl" /> Nova Prova
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-gray-800 mb-6 relative">
        <button 
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'provas' ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          onClick={() => setActiveTab('provas')}
        >
          Banco de Provas
        </button>
        <button 
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bloqueados' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          onClick={() => setActiveTab('bloqueados')}
        >
          Bloqueios Recentes
          {blockedUsers.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{blockedUsers.length}</span>
          )}
        </button>
        {activeTab === 'bloqueados' && (
          <button 
            onClick={loadData}
            className="absolute right-0 bottom-2 flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <MdRefresh className="text-lg" /> Atualizar
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : activeTab === 'provas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map(exam => (
            <div key={exam.id} className="hero-card flex flex-col p-0 overflow-hidden">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-black text-gray-100 truncate pr-2">{exam.titulo}</h3>
                  <span className={`badge-${exam.status ? 'green' : 'danger'} !text-[9px] !px-2 !py-0.5`}>
                    {exam.status ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-[10px] text-army-green-light font-bold mb-2 uppercase tracking-widest">{exam.cursos?.nome || 'Curso Deletado'}</p>
                <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-gray-400">
                  <div className="bg-[#111] p-2 rounded-lg border border-gray-800 flex flex-col">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px] mb-1">Questões</span>
                    <span className="font-bold text-gray-200">{exam.perguntas?.length || 0}</span>
                  </div>
                  <div className="bg-[#111] p-2 rounded-lg border border-gray-800 flex flex-col">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px] mb-1">Mínimo p/ Aprovar</span>
                    <span className="font-bold text-gold">{exam.nota_aprovacao} pts</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-800 bg-[#0d0d0d] grid grid-cols-2 divide-x divide-gray-800">
                <button 
                  onClick={() => openModal(exam)}
                  className="p-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:bg-blue-500/10 flex justify-center gap-1 items-center transition-colors"
                >
                  <MdEdit /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(exam.id, exam.titulo)}
                  className="p-3 text-[10px] font-bold text-danger-light uppercase tracking-widest hover:bg-danger/10 flex justify-center gap-1 items-center transition-colors"
                >
                  <MdDelete /> Excluir
                </button>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-600">
              <MdQuiz className="text-5xl mx-auto mb-3 text-gray-700" />
              <p>Nenhuma prova cadastrada no banco.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          {blockedUsers.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <MdCheckCircle className="text-5xl mx-auto mb-3 text-gray-600" />
              <p>Nenhum militar bloqueado por cooldown ou anti-fraude no momento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0a] border-b border-gray-800">
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Militar</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Prova</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nota</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {blockedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-200">{user.profiles?.nome}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">{user.profiles?.patente}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-300">{user.provas?.titulo}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-red-500">{user.nota}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleUnblock(user.id, user.profiles?.nome)}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black border border-green-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                          Liberar Agora
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Criar/Editar Prova */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-mil-dark z-20">
              <h2 className="text-lg font-black text-white flex items-center gap-2"><MdQuiz className="text-gold" /> {editingId ? 'Editar Prova' : 'Montar Nova Prova'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <MdClose className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Curso Vinculado *</label>
                  <select name="curso_id" value={formData.curso_id} onChange={handleInputChange} required className="mil-select">
                    <option value="">Selecione o curso para vincular esta prova...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Título da Prova *</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} required className="mil-input" placeholder="Ex: Prova Final - CDC" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tempo Máximo (Minutos) *</label>
                  <input type="number" name="tempo_minutos" value={formData.tempo_minutos} onChange={handleInputChange} required className="mil-input" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nota Mínima (%) para Aprovar *</label>
                  <input type="number" name="nota_aprovacao" value={formData.nota_aprovacao} onChange={handleInputChange} required min="0" max="100" className="mil-input" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tentativas Permitidas *</label>
                  <input type="number" name="tentativas_permitidas" value={formData.tentativas_permitidas} onChange={handleInputChange} required min="1" className="mil-input" />
                </div>
                
                <div className="flex items-center gap-3 bg-mil-black/50 p-4 rounded-lg border border-gray-800">
                  <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} className="w-4 h-4 rounded border-gray-700 text-army-green focus:ring-army-green bg-[#111]" id="status-checkbox" />
                  <label htmlFor="status-checkbox" className="text-sm font-bold text-gray-300 uppercase tracking-widest cursor-pointer">
                    Prova Ativa e Liberada
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
                  <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest">Banco de Questões</h3>
                  <button type="button" onClick={addQuestion} className="btn-secondary !text-[10px] flex items-center gap-1">
                    <MdAddCircleOutline className="text-base" /> Adicionar Pergunta
                  </button>
                </div>

                {formData.perguntas.length === 0 ? (
                  <div className="text-center py-10 bg-mil-black/30 rounded-xl border border-dashed border-gray-800">
                    <p className="text-xs text-gray-500">Nenhuma pergunta adicionada.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.perguntas.map((q, qIndex) => (
                      <div key={qIndex} className="bg-mil-black border border-gray-800 rounded-xl p-4 relative animate-fadeIn">
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-gray-600 hover:text-danger transition-colors">
                          <MdDelete className="text-lg" />
                        </button>
                        
                        <div className="mb-4 pr-8">
                          <label className="block text-[10px] font-bold text-gold uppercase tracking-widest mb-1.5">Pergunta {qIndex + 1}</label>
                          <textarea 
                            value={q.pergunta} 
                            onChange={(e) => handleQuestionChange(qIndex, 'pergunta', e.target.value)}
                            className="mil-textarea min-h-[60px]"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo de Resposta</label>
                          <select 
                            value={q.tipo || 'alternativas'} 
                            onChange={(e) => handleQuestionChange(qIndex, 'tipo', e.target.value)}
                            className="mil-select"
                          >
                            <option value="alternativas">Múltipla Escolha (Alternativas)</option>
                            <option value="texto">Resposta em Texto</option>
                          </select>
                        </div>

                        {(!q.tipo || q.tipo === 'alternativas') ? (
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Alternativas (Marque a Correta)</label>
                            {q.alternativas?.map((alt, aIndex) => (
                              <div key={aIndex} className={`flex items-center gap-3 p-2 rounded-lg border ${q.corretaIndex === aIndex ? 'bg-army-green/10 border-army-green/50' : 'bg-[#0a0a0a] border-gray-800'}`}>
                                <input 
                                  type="radio" 
                                  name={`correta-${qIndex}`} 
                                  checked={q.corretaIndex === aIndex}
                                  onChange={() => handleQuestionChange(qIndex, 'corretaIndex', aIndex)}
                                  className="text-army-green focus:ring-army-green"
                                  required={!q.tipo || q.tipo === 'alternativas'}
                                />
                                <input 
                                  type="text" 
                                  value={alt} 
                                  onChange={(e) => handleAlternativeChange(qIndex, aIndex, e.target.value)}
                                  className="flex-1 bg-transparent border-none text-xs text-gray-300 focus:ring-0 px-2"
                                  placeholder={`Alternativa ${['A', 'B', 'C', 'D'][aIndex]}`}
                                  required={!q.tipo || q.tipo === 'alternativas'}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resposta Correta Esperada</label>
                            <input 
                              type="text" 
                              value={q.respostaCorretaTexto || ''} 
                              onChange={(e) => handleQuestionChange(qIndex, 'respostaCorretaTexto', e.target.value)}
                              className="mil-input"
                              placeholder="Digite a resposta correta..."
                              required={q.tipo === 'texto'}
                            />
                            <p className="text-[10px] text-gray-500">A resposta do aluno deve ser exatamente igual (ignorando maiúsculas/minúsculas) para ser considerada correta.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-mil-dark pb-2 border-t border-gray-800 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary !text-xs">Cancelar</button>
                <button type="submit" className="btn-green flex items-center gap-2 !text-xs"><MdSave /> Salvar Prova Completa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
