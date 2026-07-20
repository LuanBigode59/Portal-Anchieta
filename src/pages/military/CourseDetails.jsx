import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { examService } from '../../services/examService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getCourseIcon } from '../admin/ManageCourses';
import {
  MdArrowBack,
  MdPlayCircle,
  MdLock,
  MdCheckCircle,
  MdPlayArrow,
  MdVolumeUp,
  MdFullscreen,
  MdMoreVert,
  MdFolderOpen,
  MdMenuBook,
  MdQuiz,
  MdPictureAsPdf,
  MdSlideshow,
  MdWarning
} from 'react-icons/md';

// Fallback: gera módulos placeholder se não houver módulos no banco
function generateFallbackModules(qtd) {
  const count = Math.max(1, qtd || 1);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    titulo: `Módulo ${i + 1}`,
    descricao: i === 0 ? 'Conteúdo do módulo em breve.' : null,
    video_url: null,
    ordem: i + 1,
  }));
}

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const courseData = await courseService.getCourseById(id);
        setCourse(courseData);

        // Busca módulos reais do banco
        let courseModules = [];
        try {
          courseModules = await courseService.getModulesByCourse(id);
        } catch (e) {
          console.warn('Tabela modulos ainda não existe, usando fallback');
        }

        // Se não houver módulos no banco, gera placeholders
        if (courseModules.length === 0) {
          courseModules = generateFallbackModules(courseData.qtd_modulos);
        }
        setModules(courseModules);
        if (courseModules.length > 0) {
          setActiveModuleId(courseModules[0].id);
        }

        const courseExams = await examService.getExamsByCourse(id);
        setExams(courseExams);

        if (user && user.id) {
          const attemptsMap = {};
          for (let exam of courseExams) {
            const result = await examService.getAttempts(user.id, exam.id);
            attemptsMap[exam.id] = result;
          }
          setAttempts(attemptsMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user]);

  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[0];

  const handleMarkComplete = () => {
    if (activeModuleId && !completedModules.includes(activeModuleId)) {
      setCompletedModules([...completedModules, activeModuleId]);
    }
  };

  // Verifica se um módulo está desbloqueado
  const isModuleUnlocked = (mod) => {
    return true; // Todos os módulos sempre liberados
  };

  const progress = modules.length > 0
    ? Math.round((completedModules.length / modules.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-gray-500">Curso não encontrado.</div>
    );
  }

  const CourseIcon = getCourseIcon(course.icone);

  return (
    <div className="animate-fadeIn pb-10">
      {/* Voltar */}
      <button
        onClick={() => navigate('/militar/cursos')}
        className="flex items-center gap-2 text-gray-500 hover:text-gold text-sm mb-6 transition-colors group"
      >
        <MdArrowBack className="group-hover:-translate-x-1 transition-transform" /> Voltar aos Cursos
      </button>

      {/* ===== CABEÇALHO DO CURSO ===== */}
      <div
        className="bg-mil-dark border border-mil-border rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row justify-between items-end gap-6 relative overflow-hidden bg-cover bg-center min-h-[250px] md:min-h-[300px]"
        style={{
          backgroundImage: course.imagem_url
            ? `linear-gradient(to top, rgba(13, 17, 23, 1) 0%, rgba(13, 17, 23, 0.5) 50%, rgba(13, 17, 23, 0.1) 100%), url(${course.imagem_url})`
            : 'none'
        }}
      >
        {/* Efeito decorativo (caso não tenha banner) */}
        {!course.imagem_url && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-army-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col justify-end h-full w-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border border-gold/50 text-gold bg-gold/10 uppercase">
              {course.categoria || 'GERAL'}
            </span>
            <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border border-mil-border-light text-gray-400 bg-mil-card/50 uppercase">
              {course.qtd_modulos || 1} Módulos
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-100 tracking-wide mb-2 drop-shadow-md">
            {course.nome}
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed max-w-2xl drop-shadow-md">
            {course.descricao}
          </p>
        </div>

        {/* Progresso Geral */}
        <div className="relative z-10 bg-mil-black/80 backdrop-blur-sm border border-mil-border/50 p-5 rounded-xl min-w-[200px] flex-shrink-0">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2.5 tracking-widest uppercase">
            <span>Progresso Geral</span>
            <span className="text-gold">{progress}%</span>
          </div>
          <div className="w-full bg-mil-card rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-army-green to-army-green-light h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ===== ÁREA PRINCIPAL: CRONOGRAMA + CONTEÚDO ===== */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SIDEBAR — Cronograma de Módulos */}
        <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0">
          <div className="flex items-center gap-2 text-gold mb-4 px-1">
            <MdFolderOpen className="text-lg" />
            <h3 className="text-[11px] font-black tracking-[0.2em] uppercase">
              Cronograma
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {modules.map((mod) => {
              const unlocked = isModuleUnlocked(mod);
              const isActive = activeModuleId === mod.id && unlocked;
              const isCompleted = completedModules.includes(mod.id);

              return (
                <button
                  key={mod.id}
                  onClick={() => unlocked && setActiveModuleId(mod.id)}
                  disabled={!unlocked}
                  className={`text-left flex flex-col p-4 rounded-xl border transition-all duration-300 ${isActive
                      ? 'border-army-green/60 bg-army-green-dark/30 shadow-[0_0_20px_rgba(45,90,30,0.15)]'
                      : !unlocked
                        ? 'border-mil-border/40 bg-mil-black/50 opacity-50 cursor-not-allowed'
                        : 'border-mil-border bg-mil-dark hover:border-mil-border-light cursor-pointer'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {!unlocked ? (
                      <MdLock className="text-gray-600 text-sm" />
                    ) : isCompleted ? (
                      <MdCheckCircle className="text-green-500 text-sm" />
                    ) : (
                      <MdPlayCircle
                        className={`text-sm ${isActive ? 'text-army-green-light' : 'text-gray-600'}`}
                      />
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-army-green-light' : 'text-gray-600'
                        }`}
                    >
                      Módulo {mod.ordem || modules.indexOf(mod) + 1}
                    </span>
                  </div>
                  <span
                    className={`text-sm leading-snug ${isActive ? 'text-white font-semibold' : 'text-gray-400'
                      }`}
                  >
                    {mod.titulo}
                  </span>
                </button>
              );
            })}
          </div>

          {/* MATERIAL DE APOIO SIDEBAR */}
          {(course.pdf_url || course.slides_url) && (
            <div className="mt-8 border-t border-mil-border pt-6">
              <div className="flex items-center gap-2 text-gold mb-4 px-1">
                <MdMenuBook className="text-lg" />
                <h3 className="text-[11px] font-black tracking-[0.2em] uppercase">
                  Material de Apoio
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {course.pdf_url && (
                  <button
                    onClick={() => setActiveModuleId('pdf')}
                    className={`text-left flex flex-col p-4 rounded-xl border transition-all duration-300 ${activeModuleId === 'pdf'
                        ? 'border-army-green/60 bg-army-green-dark/30 shadow-[0_0_20px_rgba(45,90,30,0.15)]'
                        : 'border-mil-border bg-mil-dark hover:border-mil-border-light cursor-pointer'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <MdPictureAsPdf className={`text-sm ${activeModuleId === 'pdf' ? 'text-army-green-light' : 'text-gray-600'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${activeModuleId === 'pdf' ? 'text-army-green-light' : 'text-gray-600'}`}>
                        Apostila PDF
                      </span>
                    </div>
                    <span className={`text-sm leading-snug ${activeModuleId === 'pdf' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                      Material do Curso
                    </span>
                  </button>
                )}
                {course.slides_url && (
                  <button
                    onClick={() => setActiveModuleId('slides')}
                    className={`text-left flex flex-col p-4 rounded-xl border transition-all duration-300 ${activeModuleId === 'slides'
                        ? 'border-army-green/60 bg-army-green-dark/30 shadow-[0_0_20px_rgba(45,90,30,0.15)]'
                        : 'border-mil-border bg-mil-dark hover:border-mil-border-light cursor-pointer'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <MdSlideshow className={`text-sm ${activeModuleId === 'slides' ? 'text-army-green-light' : 'text-gray-600'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${activeModuleId === 'slides' ? 'text-army-green-light' : 'text-gray-600'}`}>
                        Apresentação
                      </span>
                    </div>
                    <span className={`text-sm leading-snug ${activeModuleId === 'slides' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                      Slides de Apoio
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CONTEÚDO DO MÓDULO SELECIONADO */}
        {activeModuleId === 'pdf' ? (
          <div className="flex-1 bg-mil-dark border border-mil-border rounded-2xl overflow-hidden flex flex-col min-h-[70vh]">
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-mil-border/50">
              <h2 className="text-xl md:text-2xl font-black text-gray-100 flex items-center gap-3">
                <MdPictureAsPdf className="text-red-500" />
                Apostila do Curso
              </h2>
            </div>
            <iframe src={course.pdf_url} className="w-full flex-1 border-0 bg-white" title="Visualizador PDF"></iframe>
          </div>
        ) : activeModuleId === 'slides' ? (
          <div className="flex-1 bg-mil-dark border border-mil-border rounded-2xl overflow-hidden flex flex-col min-h-[70vh]">
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-mil-border/50">
              <h2 className="text-xl md:text-2xl font-black text-gray-100 flex items-center gap-3">
                <MdSlideshow className="text-orange-500" />
                Apresentação de Slides
              </h2>
            </div>
            <iframe src={course.slides_url} className="w-full flex-1 border-0 bg-white" title="Visualizador Slides"></iframe>
          </div>
        ) : activeModule ? (
          <div className="flex-1 bg-mil-dark border border-mil-border rounded-2xl overflow-hidden flex flex-col">
            {/* Topo do módulo */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-mil-border/50">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-army-green-light flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 bg-army-green-light rounded-full inline-block animate-pulse" />
                  Conteúdo da Instrução
                </span>
                <h2 className="text-xl md:text-2xl font-black text-gray-100">
                  {activeModule.titulo}
                </h2>
              </div>
              <span
                className={`text-[10px] font-bold tracking-wider px-3 py-1.5 rounded border uppercase whitespace-nowrap ${completedModules.includes(activeModuleId)
                    ? 'border-green-700/50 text-green-400 bg-green-900/10'
                    : isModuleUnlocked(activeModule)
                      ? 'border-gold/50 text-gold bg-gold/10'
                      : 'border-red-800/50 text-red-400 bg-red-900/10'
                  }`}
              >
                {completedModules.includes(activeModuleId)
                  ? 'CONCLUÍDO'
                  : isModuleUnlocked(activeModule)
                    ? 'EM ANDAMENTO'
                    : 'BLOQUEADO'}
              </span>
            </div>

            {/* Video Player */}
            {activeModule.video_url ? (
              <div className="relative aspect-video bg-black w-full flex flex-col justify-center items-center overflow-hidden">
                {activeModule.video_url.includes('youtube.com') || activeModule.video_url.includes('youtu.be') ? (
                  <iframe
                    className="w-full h-full"
                    src={activeModule.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-contain"
                    src={activeModule.video_url}
                  >
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                )}
              </div>
            ) : (
              <div className="relative aspect-video bg-mil-black w-full flex flex-col items-center justify-center border-b border-mil-border/50">
                <MdPlayCircle className="text-5xl text-gray-700 mb-3" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nenhum vídeo disponível para esta aula</p>
              </div>
            )}

            {/* Material de Apoio */}
            <div className="p-6 md:p-8 flex-grow">
              <div className="border-l-[3px] border-army-green pl-4 mb-5">
                <h3 className="text-lg font-black text-gray-100 tracking-wide flex items-center gap-2">
                  <MdMenuBook className="text-army-green-light" />
                  Material de Apoio
                </h3>
              </div>
              {activeModule.descricao ? (
                <div className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {activeModule.descricao}
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">
                  Material ainda não disponível para este módulo.
                </p>
              )}
            </div>

            {/* Rodapé — Botão de conclusão */}
            <div className="p-6 bg-mil-black/60 border-t border-mil-border/50 flex justify-end items-center">
              {completedModules.includes(activeModuleId) ? (
                <span className="flex items-center gap-2 text-green-400 text-sm font-bold">
                  <MdCheckCircle className="text-lg" />
                  Módulo Concluído
                </span>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={!isModuleUnlocked(activeModule)}
                  className="bg-gradient-to-b from-army-green-light to-army-green text-white text-sm font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_14px_rgba(45,90,30,0.4)] hover:shadow-[0_6px_20px_rgba(74,140,52,0.6)] hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                >
                  <MdCheckCircle className="text-lg" />
                  Marcar como Concluído
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* ===== AVALIAÇÕES DO CURSO ===== */}
      {exams.length > 0 && (
        <div className="mt-8 mil-card !p-0 overflow-hidden border border-mil-border">
          <div className="flex items-center justify-between p-4 border-b border-mil-border bg-mil-dark">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-widest flex items-center gap-2">
              <MdQuiz className="text-gold" /> Avaliações do Curso
            </h3>
          </div>
          <div className="bg-red-500/10 border-b border-red-500/20 p-4">
            <div className="flex items-start gap-3">
              <MdWarning className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-1">Aviso: Sistema Anti-Cheat</h4>
                <p className="text-xs text-red-300/80 leading-relaxed">
                  As provas deste curso possuem sistema de monitoramento. Ao iniciar a prova, você não poderá sair da tela, trocar de aba ou minimizar a janela. Caso faça isso, a prova será anulada imediatamente com nota 0 e você perderá uma tentativa.
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-mil-border bg-mil-black/50">
            {exams.map((exam) => {
              const examAttempts = attempts[exam.id] || [];
              const passed = examAttempts.some((a) => a.aprovado);
              const maxAttempts = exam.tentativas_permitidas;
              const attemptsLeft = maxAttempts - examAttempts.length;
              const isBlockedByAttempts = !passed && attemptsLeft <= 0;
              
              // Cooldown de 1 hora
              const lastAttempt = examAttempts[examAttempts.length - 1];
              let isCooldown = false;
              let cooldownMin = 0;
              
              if (!passed && lastAttempt) {
                const localBlockStr = localStorage.getItem(`exam_block_${exam.id}`);
                const localBlockTime = localBlockStr ? parseInt(localBlockStr, 10) : 0;
                
                const attemptTime = new Date(lastAttempt.created_at || Date.now()).getTime();
                const mostRecentBlock = Math.max(attemptTime, localBlockTime);
                
                const diffMs = Date.now() - mostRecentBlock;
                const cooldownMs = 60 * 60 * 1000; // 1 hora
                if (diffMs < cooldownMs) {
                  isCooldown = true;
                  cooldownMin = Math.ceil((cooldownMs - diffMs) / 60000);
                }
              }

              const isBlocked = isBlockedByAttempts || isCooldown;

              return (
                <div
                  key={exam.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-bold text-gray-200 group-hover:text-gold transition-colors">
                        {exam.titulo}
                      </p>
                      {passed && (
                        <MdCheckCircle className="text-green-500 text-lg" title="Aprovado" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {exam.tempo_minutos} min • {exam.perguntas?.length || 0} questões • Mínimo:{' '}
                      {exam.nota_aprovacao} pts
                    </p>
                    <div className="flex gap-2">
                      {examAttempts.map((att, idx) => (
                        <span
                          key={idx}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${att.aprovado
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                            }`}
                        >
                          T{idx + 1}: {att.nota}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    {passed ? (
                      <span className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">
                        Aprovado
                      </span>
                    ) : isBlockedByAttempts ? (
                      <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
                        Esgotado
                      </span>
                    ) : isCooldown ? (
                      <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">
                        Aguarde {cooldownMin} min
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                        {attemptsLeft} tentativa(s) restante(s)
                      </span>
                    )}

                    <button
                      onClick={() => navigate(`/militar/provas/${exam.id}`)}
                      disabled={passed || isBlocked}
                      className={`btn-gold !py-2 !px-6 !text-[10px] ${passed || isBlocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                        }`}
                    >
                      {passed ? 'Ver Resultado' : isCooldown ? 'Em Espera' : 'Iniciar Prova'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
