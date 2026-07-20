import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { examService } from '../../services/examService';
import { useAuth } from '../../contexts/AuthContext';
import { MdQuiz, MdAccessTime, MdArrowForward } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Exams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { sendNotification } = useNotifications();

  useEffect(() => {
    async function fetch() {
      try {
        const data = await examService.getExams();
        // Exibir apenas provas ativas
        setExams(data.filter(e => e.status));
      } catch (err) {
        console.error(err);
        sendNotification("Erro ao buscar avaliações.", "erro");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [sendNotification]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <Topbar title="PROVAS" subtitle="Sistema de Avaliação" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exams.map((exam, i) => (
          <div
            key={exam.id}
            className="hero-card p-6 cursor-pointer group hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
            onClick={() => navigate(`/militar/provas/${exam.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xl group-hover:scale-110 transition-transform">
                <MdQuiz />
              </div>
              <span className="badge-green !text-[9px]">Disponível</span>
            </div>
            <h3 className="text-base font-black text-gray-100 mb-1 group-hover:text-gold transition-colors">{exam.titulo}</h3>
            <p className="text-xs text-army-green-light font-bold mb-2 uppercase tracking-widest">{exam.cursos?.nome || 'Curso associado'}</p>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{exam.descricao || 'Sem descrição'}</p>
            <div className="flex items-center justify-between text-[10px] text-gray-600 pt-3 border-t border-mil-border">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><MdAccessTime /> {exam.tempo_minutos} min</span>
                <span>{exam.perguntas?.length || 0} questões</span>
                <span>Máx. {exam.tentativas_permitidas} tentativa(s)</span>
              </div>
              <MdArrowForward className="group-hover:text-gold transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {exams.length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <MdQuiz className="text-5xl mx-auto mb-3 text-gray-700" />
          <p>Nenhuma prova disponível no momento.</p>
        </div>
      )}
    </div>
  );
}
