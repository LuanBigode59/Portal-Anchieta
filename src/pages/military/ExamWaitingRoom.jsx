import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proctorService } from '../../services/proctorService';
import { examService } from '../../services/examService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import DeviceTest from '../../components/proctoring/DeviceTest';
import { supabase } from '../../supabaseClient';
import { MdCheckCircle, MdWarning, MdArrowBack, MdHourglassEmpty, MdCancel } from 'react-icons/md';

export default function ExamWaitingRoom() {
  const { id } = useParams(); // exam_id
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  const [exam, setExam] = useState(null);
  const [session, setSession] = useState(null);
  const [participation, setParticipation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadData();
  }, [id, user]);

  const loadData = async () => {
    try {
      const examData = await examService.getExamById(id);
      setExam(examData);

      const sessionData = await proctorService.getActiveSessionForExam(id);
      setSession(sessionData);

      if (sessionData && user) {
        const partData = await proctorService.getMyParticipation(sessionData.id, user.id);
        setParticipation(partData);
      }
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao carregar dados", "erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || !user) return;

    // Subscribe to participation updates
    const channel = supabase.channel(`my_participation_${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'proctor_participants', 
        filter: `session_id=eq.${session.id}` 
      }, (payload) => {
        if (payload.new.student_id === user.id) {
          setParticipation(payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, user]);

  const handleRequestEntry = async () => {
    try {
      if (!participation) {
        const newPart = await proctorService.requestEntry(session.id, user.id);
        await proctorService.updateMyStatus(newPart.id, 'waiting_approval');
        setParticipation({ ...newPart, status: 'waiting_approval' });
      } else {
        await proctorService.updateMyStatus(participation.id, 'waiting_approval');
        setParticipation({ ...participation, status: 'waiting_approval' });
      }
      sendNotification("Solicitação enviada. Aguarde o instrutor.", "sucesso");
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao solicitar entrada", "erro");
    }
  };

  const handleStartExam = async () => {
    if (participation?.status === 'approved' || participation?.status === 'taking_exam') {
      try {
        if (participation.status === 'approved') {
          await proctorService.updateMyStatus(participation.id, 'taking_exam');
        }
      } catch (e) {
        console.warn("Could not update status:", e);
      }
      navigate(`/militar/provas/${id}`);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="spinner"></div></div>;
  if (!exam) return <div className="text-center p-8">Prova não encontrada.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      <button onClick={() => navigate(`/militar/cursos/${exam.curso_id}`)} className="flex items-center gap-2 text-gray-500 hover:text-gold text-sm mb-6 transition-colors">
        <MdArrowBack /> Voltar ao Curso
      </button>

      <div className="hero-card p-6 mb-8 border border-gray-800 bg-[#0a0a0a]">
        <h1 className="text-2xl font-black text-white mb-1">{exam.titulo}</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-4">{exam.cursos?.nome}</p>
        
        <div className="bg-mil-black p-4 rounded-lg border border-gray-800">
          <h2 className="text-gold font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
            <MdWarning className="text-lg" /> Avaliação Supervisionada
          </h2>
          <p className="text-sm text-gray-300">
            Esta prova exige supervisão em tempo real. Você precisará de uma câmera, microfone e deverá compartilhar sua tela.
          </p>
        </div>
      </div>

      {!session ? (
        <div className="text-center py-12 bg-[#111] border border-gray-800 rounded-xl">
          <MdCancel className="text-4xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma sessão disponível</h3>
          <p className="text-gray-400">Nenhuma sessão de avaliação está aberta neste momento. Aguarde o instrutor iniciar a sessão.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center p-4 bg-mil-black border border-gray-800 rounded-lg">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sessão Ativa</p>
              <p className="text-white font-bold">{session.title}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Status da sua solicitação</p>
              <p className={`font-bold ${
                !participation || participation.status === 'waiting_devices' ? 'text-gray-400' :
                participation.status === 'waiting_approval' ? 'text-orange-500' :
                (participation.status === 'approved' || participation.status === 'taking_exam') ? 'text-green-500' :
                participation.status === 'paused' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {!participation || participation.status === 'waiting_devices' ? 'Não Iniciada' :
                 participation.status === 'waiting_approval' ? 'Aguardando Instrutor' :
                 participation.status === 'approved' ? 'Aprovado' :
                 participation.status === 'taking_exam' ? 'Em Prova' :
                 participation.status === 'paused' ? 'Prova Pausada' :
                 participation.status === 'rejected' ? 'Rejeitado' :
                 participation.status === 'terminated' ? 'Invalidado' :
                 participation.status}
              </p>
            </div>
          </div>

          {(!participation || participation.status === 'waiting_devices') && (
            <>
              <DeviceTest 
                requireCamera={session.require_camera}
                requireMicrophone={session.require_microphone}
                requireScreenShare={session.require_screen_share}
                onTestComplete={setIsReady}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleRequestEntry}
                  disabled={!isReady}
                  className={`btn-gold !py-3 !px-8 ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Solicitar Autorização para Iniciar
                </button>
              </div>
            </>
          )}

          {participation?.status === 'waiting_approval' && (
            <div className="text-center py-16 bg-[#111] border border-gray-800 rounded-xl">
              <div className="spinner mb-6 mx-auto"></div>
              <h3 className="text-xl font-bold text-white mb-2">Aguardando Autorização</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Sua solicitação foi enviada. O instrutor está verificando sua conexão e em breve liberará sua entrada. Por favor, aguarde nesta tela.
              </p>
            </div>
          )}

          {participation?.status === 'rejected' && (
            <div className="text-center py-12 bg-red-500/10 border border-red-500/30 rounded-xl">
              <MdCancel className="text-5xl text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-500 mb-2">Solicitação Rejeitada</h3>
              <p className="text-red-200/70 max-w-md mx-auto">
                O instrutor rejeitou sua entrada. 
                {participation.rejection_reason && <span className="block mt-2 bg-black/30 p-2 rounded italic">"{participation.rejection_reason}"</span>}
              </p>
              <button onClick={() => setParticipation({...participation, status: 'waiting_devices'})} className="mt-6 btn-gold text-sm">
                Tentar Novamente
              </button>
            </div>
          )}

          {(participation?.status === 'approved' || participation?.status === 'taking_exam') && (
            <div className="text-center py-16 bg-green-500/10 border border-green-500/30 rounded-xl">
              <MdCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-green-500 mb-2">Autorização Concedida!</h3>
              <p className="text-green-200/70 max-w-md mx-auto mb-8">
                O instrutor liberou o seu acesso à prova. Ao clicar em Iniciar, a prova será aberta e o monitoramento continuará ativo.
              </p>
              <button 
                onClick={handleStartExam} 
                className="btn-gold !py-4 !px-12 text-lg animate-pulse hover:animate-none shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                {participation?.status === 'taking_exam' ? 'Continuar Prova' : 'Iniciar Prova Agora'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
