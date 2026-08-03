import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { examService } from '../../services/examService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { signatureService } from '../../services/signatureService';
import { supabase } from '../../supabaseClient';
import { cargoLabels } from '../../data/ranks';
import { MdTimer, MdCheckCircle, MdCancel, MdSend, MdArrowBack, MdVideocam } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { proctorService } from '../../services/proctorService';
import StudentView from '../../components/proctoring/StudentView';

export default function ExamViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [certificate, setCertificate] = useState(null);
  
  // Proctoring States
  const [session, setSession] = useState(null);
  const [participation, setParticipation] = useState(null);
  const [examToken, setExamToken] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef(null);
  const disconnectTimerRef = useRef(null);


  useEffect(() => {
    async function loadExam() {
      try {
        const examData = await examService.getExamById(id);
        setExam(examData);
        setTimeLeft(examData.tempo_minutos * 60);

        // Check if user already passed or exceeded attempts
        if (user && user.id) {
          const attempts = await examService.getAttempts(user.id, id);
          const passed = attempts.find(a => a.aprovado);

          if (passed) {
            setResult(passed);
            // Get certificate if exists
            const certs = await examService.getCertificatesByUser(user.id);
            const myCert = certs.find(c => c.curso_id === examData.curso_id);
            if (myCert) setCertificate(myCert);
          } else if (attempts.length >= examData.tentativas_permitidas) {
            sendNotification("Você excedeu o limite de tentativas para esta prova.", "erro");
            navigate(`/militar/cursos/${examData.curso_id}`);
          }
          }


        // Proctoring Check
        if (user && user.id) {
          const activeSession = await proctorService.getActiveSessionForExam(id);
          if (activeSession) {
            setSession(activeSession);
            const myPart = await proctorService.getMyParticipation(activeSession.id, user.id);
            setParticipation(myPart);

            if (!myPart || (myPart.status !== 'approved' && myPart.status !== 'taking_exam' && myPart.status !== 'paused')) {
              sendNotification("Você não tem autorização para realizar esta prova no momento.", "erro");
              navigate(`/militar/provas/${id}/espera`);
              return;
            }
            
            if (myPart.status === 'paused') {
              setIsPaused(true);
            }

            try {
              const token = await proctorService.getExamToken(myPart.id);
              setExamToken(token);
            } catch(e) {
              // Token service not available (local dev) - continue without it
              console.warn("Exam token unavailable (expected in local dev):", e.message);
            }
          }
        }
      } catch (err) {
        console.error(err);
        sendNotification("Erro ao carregar prova.", "erro");
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [id, user, navigate, sendNotification]);

  const hasNotified = useRef(false);

  // Broadcast exam start to admins
  useEffect(() => {
    if (!loading && exam && !result && user && !hasNotified.current) {
      hasNotified.current = true;

      // Create a unique channel for broadcasting or use a general one
      const channel = supabase.channel('exam-alerts');

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'exam_started',
            payload: {
              militarNome: user.nome,
              militarPatente: user.patente,
              provaTitulo: exam.titulo,
              timestamp: Date.now()
            }
          });
          // Unsubscribe after sending to avoid memory leaks
          setTimeout(() => supabase.removeChannel(channel), 2000);
        }
      });

      // Enviar notificação no Discord (Webhook Privado) via CORS proxy
      const webhookUrl = "https://corsproxy.io/?" + encodeURIComponent("https://discord.com/api/webhooks/1528989572518641716/LvONcKop1YTwG51KPbOHf-Qf6_MYxaspP5tuuMeGrkVjCblpB6ajMGAyyADLWOPd9KQn");
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 **ALERTA DE PROVA**\nO ${user.patente} **${user.nome}** acabou de INICIAR a prova **${exam.titulo}**! ⏰`
        })
      }).catch(err => console.error("Erro ao enviar webhook do discord", err));

    }
  }, [loading, exam, result, user]); // Only run when these states change and exam is ready

  // Timer Effect
  useEffect(() => {
    if (!loading && exam && !result && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(new Event('submit'), true); // Auto-submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [loading, exam, result, timeLeft]);

  // Subscribe to Proctor DB Changes
  useEffect(() => {
    if (!session || !participation || !user) return;

    const channel = supabase.channel(`exam_proctor_${participation.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'proctor_participants', 
        filter: `id=eq.${participation.id}` 
      }, (payload) => {
        const newStatus = payload.new.status;
        if (newStatus === 'paused') {
          setIsPaused(true);
          sendNotification("Sua prova foi pausada pelo instrutor.", "aviso");
        } else if (newStatus === 'taking_exam') {
          setIsPaused(false);
          sendNotification("Sua prova foi liberada pelo instrutor.", "sucesso");
        } else if (newStatus === 'terminated') {
          handleSubmit(null, true, true);
          sendNotification("Sua tentativa foi invalidada pelo instrutor.", "erro");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, participation, user]);

  // Anti-Cheat Effect
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        if (!loading && exam && !result && !isSubmitting) {
          if (session && participation) {
            proctorService.logEvent(session.id, participation.id, 'tab_hidden', 'warning');
            try {
              await proctorService.updateParticipantStatus(participation.id, 'paused');
            } catch (e) {
              console.error("Erro ao pausar prova no banco:", e);
            }
            setIsPaused(true);
            sendNotification("MODO ANTI-FRAUDE: Você saiu da aba. A prova foi pausada.", "erro");
          } else {
            try {
              await handleSubmit(null, true, true);
            } catch (e) {
              console.error("Erro ao salvar penalidade no banco:", e);
            }
            sendNotification("MODO ANTI-FRAUDE ATIVADO: Você saiu da página ou trocou de aba. Sua prova foi anulada.", "erro");
            navigate(`/militar/cursos/${exam.curso_id}`);
          }
        }
      } else {
        // Quando volta para a aba, busca o status atualizado no banco (caso o instrutor tenha liberado enquanto a aba estava oculta)
        if (session && participation && user && !result) {
          try {
            const currentPart = await proctorService.getMyParticipation(session.id, user.id);
            if (currentPart) {
              if (currentPart.status === 'taking_exam') {
                setIsPaused(false);
              } else if (currentPart.status === 'terminated') {
                handleSubmit(null, true, true);
                sendNotification("Sua tentativa foi invalidada pelo instrutor.", "erro");
              } else if (currentPart.status === 'paused') {
                setIsPaused(true);
              }
            }
          } catch (e) {
            console.error("Erro ao recuperar status da prova:", e);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, exam, result, isSubmitting, navigate, sendNotification, session, participation, user]);

  const handleSelect = (qIndex, aIndex) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qIndex]: aIndex }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    exam.perguntas.forEach((q, index) => {
      const userAnswer = answers[index];
      if (!q.tipo || q.tipo === 'alternativas') {
        if (userAnswer === q.corretaIndex) correctCount++;
      } else if (q.tipo === 'texto') {
        if (userAnswer && typeof userAnswer === 'string' && q.respostaCorretaTexto && userAnswer.trim().toLowerCase() === q.respostaCorretaTexto.trim().toLowerCase()) {
          correctCount++;
        }
      }
    });
    return Math.round((correctCount / exam.perguntas.length) * 100);
  };

  const handleSubmit = async (e, isAutoSubmit = false, isCheating = false) => {
    if (e) e.preventDefault();
    if (result) return;

    if (!isAutoSubmit && !isCheating && Object.keys(answers).length < exam.perguntas.length) {
      if (!window.confirm("Você não respondeu todas as perguntas. Deseja enviar mesmo assim? As não respondidas serão consideradas erradas.")) {
        return;
      }
    }

    setIsSubmitting(true);
    clearInterval(timerRef.current);

    const score = isCheating ? 0 : calculateScore();
    const isApproved = score >= exam.nota_aprovacao;

    try {
      const attempts = await examService.getAttempts(user.id, exam.id);
      const attemptCount = attempts.length + 1;

      const { resultado, certificado } = await examService.submitExam(
        user.id,
        exam.id,
        exam.curso_id,
        answers,
        score,
        isApproved,
        attemptCount
      );

      setResult(resultado);
      setCertificate(certificado);

      if (isApproved) {
        // Enviar para o banco de assinaturas oficiais do Comando
        await signatureService.createDocument({
          tipo: 'certificado',
          titulo: `Certificado de Curso: ${exam.cursos?.nome || 'Curso Concluído'}`,
          dados: {
            target_militar_id: user.id,
            target_militar_nome: user.nome,
            curso_nome: exam.cursos?.nome || 'Curso Concluído',
            curso_id: exam.curso_id,
            nota: score
          }
        });

        // Enviar webhook no Discord para os admins via CORS proxy
        const webhookUrl = "https://corsproxy.io/?" + encodeURIComponent("https://discord.com/api/webhooks/1528989572518641716/LvONcKop1YTwG51KPbOHf-Qf6_MYxaspP5tuuMeGrkVjCblpB6ajMGAyyADLWOPd9KQn");
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🎓 **CURSO CONCLUÍDO**\nO ${user.patente} **${user.nome}** acabou de CONCLUIR o curso **${exam.cursos?.nome || exam.titulo}**! Falta você entregar o certificado dele.`
          })
        }).catch(err => console.error("Erro ao enviar webhook do discord", err));

        sendNotification(`Parabéns! Você foi aprovado com nota ${score}. Seu certificado será enviado no grupo do WhatsApp oficial do 2º BPChq Anchieta.`, 'sucesso');
      } else {
        sendNotification(`Você reprovou com nota ${score}. Mínimo necessário: ${exam.nota_aprovacao}.`, 'erro');
      }
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao processar prova.", 'erro');
    } finally {
      setIsSubmitting(false);
      if (session && participation) {
        proctorService.updateParticipantStatus(participation.id, 'submitted');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="spinner" /></div>;
  if (!exam) return <div className="text-center py-20">Prova não encontrada.</div>;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fadeIn">
      {session && participation && (
        <StudentView 
          session={session} 
          participantId={participation.id} 
          onDisconnect={() => {
            if (!result) {
              proctorService.logEvent(session.id, participation.id, 'connection_lost', 'critical');
              proctorService.updateParticipantStatus(participation.id, 'paused');
              setIsPaused(true);
            }
          }}
        />
      )}

      {isPaused && !result ? (
        <div className="text-center py-20 bg-mil-black border border-orange-500/50 rounded-xl">
          <MdTimer className="text-6xl text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Prova Pausada</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Sua avaliação foi pausada pelo instrutor devido a uma irregularidade (ex: saída da aba, queda de conexão, câmera desligada). Aguarde a liberação.
          </p>
          <div className="spinner mx-auto border-orange-500" />
        </div>
      ) : (
        <>
          <button onClick={() => navigate(`/militar/cursos/${exam.curso_id}`)} className="flex items-center gap-2 text-gray-500 hover:text-gold text-sm mb-6 transition-colors">
            <MdArrowBack /> Voltar ao Curso
          </button>

      {/* Cabeçalho da Prova */}
      <div className="hero-card p-6 mb-8 border border-gray-800 bg-[#0a0a0a]">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">{exam.titulo}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">{exam.cursos?.nome}</p>
            {session && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold mt-2">
                <MdVideocam /> SUPERVISÃO ATIVA
              </span>
            )}
          </div>

          {!result && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${timeLeft < 300 ? 'bg-danger/20 border-danger animate-pulse' : 'bg-mil-black border-gray-800'}`}>
              <MdTimer className={`text-2xl ${timeLeft < 300 ? 'text-danger-light' : 'text-gold'}`} />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tempo Restante</span>
                <span className={`text-xl font-mono font-black ${timeLeft < 300 ? 'text-danger-light' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      {result && (
        <div className={`hero-card p-8 mb-8 text-center border ${result.aprovado ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
          <div className="flex justify-center mb-4">
            {result.aprovado ? <MdCheckCircle className="text-6xl text-green-500" /> : <MdCancel className="text-6xl text-red-500" />}
          </div>
          <h2 className={`text-3xl font-black mb-2 ${result.aprovado ? 'text-green-500' : 'text-red-500'}`}>
            {result.aprovado ? 'APROVADO!' : 'REPROVADO'}
          </h2>
          <p className="text-gray-400 mb-6">
            Sua nota foi <span className="text-white font-bold text-lg">{result.nota}</span> / 100
            (Mínimo: {exam.nota_aprovacao})
          </p>

          {result.aprovado && certificate && (
            <div className="mt-4 space-y-3 flex justify-center">
              <div className="inline-block bg-mil-black border border-gold/30 p-4 rounded-xl text-center w-full max-w-md">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-2">🏅 Curso Concluído</p>
                <p className="text-sm text-gray-300">
                  O seu certificado será enviado no grupo do WhatsApp oficial do <strong>2º BPChq Anchieta</strong> em breve.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questionário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {exam.perguntas.map((q, qIndex) => {
          const userAnswer = (result ? result.respostas_usuario?.[qIndex] : answers[qIndex]);
          const isCorrect = userAnswer === q.corretaIndex;

          return (
            <div key={qIndex} className="mil-card !p-0 overflow-hidden border border-gray-800">
              <div className="bg-[#111] p-4 border-b border-gray-800">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Questão {qIndex + 1}</span>
                <p className="text-sm text-gray-200 mt-2 font-medium">{q.pergunta}</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] space-y-2">
                {(!q.tipo || q.tipo === 'alternativas') ? (
                  q.alternativas.map((alt, aIndex) => {
                    const isSelected = userAnswer === aIndex;
                    let bgClass = "bg-[#111] border-gray-800 hover:border-gray-600";
                    let textClass = "text-gray-400";

                    if (result) {
                      // Modo Visualização de Correção
                      if (aIndex === q.corretaIndex) {
                        bgClass = "bg-green-500/20 border-green-500/50";
                        textClass = "text-green-400 font-bold";
                      } else if (isSelected) {
                        bgClass = "bg-red-500/20 border-red-500/50";
                        textClass = "text-red-400 font-bold";
                      }
                    } else if (isSelected) {
                      // Modo Respondendo
                      bgClass = "bg-army-green/20 border-army-green";
                      textClass = "text-white font-bold";
                    }

                    return (
                      <div
                        key={aIndex}
                        onClick={() => handleSelect(qIndex, aIndex)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${bgClass} ${result ? 'cursor-default' : ''}`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-army-green bg-army-green text-black' : 'border-gray-600'}`}>
                          {isSelected && !result && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                          {result && aIndex === q.corretaIndex && <MdCheckCircle className="text-green-500" />}
                          {result && isSelected && aIndex !== q.corretaIndex && <MdCancel className="text-red-500" />}
                        </div>
                        <span className={`text-sm ${textClass}`}>{alt}</span>
                      </div>
                    );
                  })
                ) : (
                  <div>
                    <input 
                      type="text"
                      value={userAnswer || ''}
                      onChange={(e) => handleSelect(qIndex, e.target.value)}
                      disabled={result !== null}
                      className={`mil-input w-full ${result ? (userAnswer?.trim().toLowerCase() === q.respostaCorretaTexto?.trim().toLowerCase() ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400') : ''}`}
                      placeholder="Digite sua resposta..."
                    />
                    {result && userAnswer?.trim().toLowerCase() !== q.respostaCorretaTexto?.trim().toLowerCase() && (
                      <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1"><MdCheckCircle /> Resposta correta: {q.respostaCorretaTexto}</p>
                    )}
                    {result && userAnswer?.trim().toLowerCase() === q.respostaCorretaTexto?.trim().toLowerCase() && (
                      <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1"><MdCheckCircle /> Resposta correta!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!result && (
          <div className="sticky bottom-4 z-10 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold !py-4 !px-8 shadow-[0_10px_30px_rgba(201,168,76,0.3)] flex items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <><MdSend className="text-xl" /> Finalizar e Corrigir</>
              )}
            </button>
          </div>
        )}
      </form>
        </>
      )}
    </div>
  );
}
