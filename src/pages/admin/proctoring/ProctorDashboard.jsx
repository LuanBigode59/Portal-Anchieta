import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proctorService } from '../../../services/proctorService';
import { examService } from '../../../services/examService';
import { courseService } from '../../../services/courseService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { MdAdd, MdVideocam, MdVisibility, MdPlayArrow, MdStop, MdDelete } from 'react-icons/md';

export default function ProctorDashboard() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const navigate = useNavigate();

  // New Session Form State
  const [formData, setFormData] = useState({
    course_id: '',
    exam_id: '',
    title: '',
    max_participants: 50,
    require_camera: true,
    require_microphone: true,
    require_screen_share: true,
    disconnect_tolerance_seconds: 30
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, coursesData] = await Promise.all([
        proctorService.getSessions(),
        courseService.getCourses()
      ]);
      setSessions(sessionsData);
      setCourses(coursesData);
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao carregar sessões de supervisão", "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (courseId) => {
    setFormData({ ...formData, course_id: courseId, exam_id: '' });
    if (courseId) {
      try {
        const examsData = await examService.getExamsByCourse(courseId);
        setExams(examsData);
      } catch (err) {
        console.error(err);
      }
    } else {
      setExams([]);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!formData.exam_id) return sendNotification("Selecione uma prova", "erro");

    try {
      const roomName = `proctor-${formData.exam_id}-${Date.now()}`;
      
      const newSession = await proctorService.createSession({
        ...formData,
        instructor_id: user.id,
        room_name: roomName,
        status: 'open',
        starts_at: new Date().toISOString()
      });

      sendNotification("Sessão criada com sucesso", "sucesso");
      setShowModal(false);
      navigate(`/admin/provas/supervisao/${newSession.id}`);
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao criar sessão", "erro");
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      await proctorService.updateSessionStatus(id, newStatus);
      sendNotification(`Sessão ${newStatus === 'open' ? 'aberta' : 'fechada'} com sucesso`, "sucesso");
      loadData();
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao alterar status da sessão", "erro");
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta sessão permanentemente? O histórico e todos os acessos serão perdidos.")) return;
    try {
      await proctorService.deleteSession(id);
      sendNotification("Sessão excluída com sucesso", "sucesso");
      loadData();
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao excluir sessão", "erro");
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="spinner"></div></div>;

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MdVideocam className="text-gold" /> Supervisão de Provas
          </h1>
          <p className="text-gray-400 text-sm">Gerencie salas de avaliação com monitoramento em tempo real</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2">
          <MdAdd /> Nova Sessão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map(session => (
          <div key={session.id} className="mil-card p-5 border border-gray-800 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${session.status === 'open' ? 'bg-green-500/20 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                  {session.status === 'open' ? 'Aberta' : 'Fechada'}
                </span>
                <h3 className="font-bold text-lg text-white mt-2">{session.title}</h3>
                <p className="text-xs text-gold uppercase tracking-widest">{session.provas?.titulo}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 flex-grow">
              <p className="text-sm text-gray-400 flex justify-between">
                <span>Instrutor:</span> 
                <span className="text-white">{session.instructor?.nome}</span>
              </p>
              <p className="text-sm text-gray-400 flex justify-between">
                <span>Curso:</span> 
                <span className="text-white truncate max-w-[150px]">{session.cursos?.nome}</span>
              </p>
              <p className="text-sm text-gray-400 flex justify-between">
                <span>Criada em:</span> 
                <span className="text-white">{new Date(session.created_at).toLocaleDateString()}</span>
              </p>
            </div>

            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => navigate(`/admin/provas/supervisao/${session.id}`)}
                className="flex-1 bg-mil-black border border-gray-700 hover:border-gold text-white p-2 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <MdVisibility /> Acessar Sala
              </button>
              <button 
                onClick={() => handleStatusChange(session.id, session.status)}
                className={`px-3 border rounded-lg flex items-center justify-center transition-colors ${
                  session.status === 'open' 
                    ? 'border-red-500/50 text-red-500 hover:bg-red-500/10' 
                    : 'border-green-500/50 text-green-500 hover:bg-green-500/10'
                }`}
                title={session.status === 'open' ? 'Fechar Sessão' : 'Abrir Sessão'}
              >
                {session.status === 'open' ? <MdStop /> : <MdPlayArrow />}
              </button>
              <button 
                onClick={() => handleDeleteSession(session.id)}
                className="px-3 border rounded-lg flex items-center justify-center transition-colors border-red-500/50 text-red-500 hover:bg-red-500/10"
                title="Excluir Sessão"
              >
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="col-span-full text-center py-12 bg-mil-black border border-gray-800 rounded-xl">
            <MdVideocam className="text-4xl text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">Nenhuma sessão de supervisão encontrada.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Nova Sessão de Supervisão</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Título da Sessão</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="mil-input w-full"
                  placeholder="Ex: Prova Final - Turma A"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Curso</label>
                <select 
                  required
                  value={formData.course_id}
                  onChange={e => handleCourseChange(e.target.value)}
                  className="mil-input w-full"
                >
                  <option value="">Selecione um curso...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Prova</label>
                <select 
                  required
                  value={formData.exam_id}
                  onChange={e => setFormData({...formData, exam_id: e.target.value})}
                  className="mil-input w-full"
                  disabled={!formData.course_id}
                >
                  <option value="">Selecione a prova...</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.titulo}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Máx. Participantes</label>
                  <input 
                    type="number" 
                    required
                    min="1" max="100"
                    value={formData.max_participants}
                    onChange={e => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                    className="mil-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tolerância Queda (seg)</label>
                  <input 
                    type="number" 
                    required
                    min="5" max="300"
                    value={formData.disconnect_tolerance_seconds}
                    onChange={e => setFormData({...formData, disconnect_tolerance_seconds: parseInt(e.target.value)})}
                    className="mil-input w-full"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.require_camera} onChange={e => setFormData({...formData, require_camera: e.target.checked})} className="accent-gold" />
                  <span className="text-sm text-gray-300">Exigir Câmera</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.require_microphone} onChange={e => setFormData({...formData, require_microphone: e.target.checked})} className="accent-gold" />
                  <span className="text-sm text-gray-300">Exigir Microfone</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.require_screen_share} onChange={e => setFormData({...formData, require_screen_share: e.target.checked})} className="accent-gold" />
                  <span className="text-sm text-gray-300">Exigir Tela Compartilhada</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 btn-gold">Criar Sessão</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
