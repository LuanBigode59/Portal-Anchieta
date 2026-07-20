import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { examService } from '../../services/examService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { signatureService } from '../../services/signatureService';
import { cargoLabels } from '../../data/ranks';
import CertificateTemplate from '../../components/certificates/CertificateTemplate';
import { downloadCertificateAsPDF } from '../../utils/certificateGenerator';
import { MdTimer, MdCheckCircle, MdCancel, MdSend, MdArrowBack, MdDownload, MdCardMembership } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';

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
  const [downloading, setDownloading] = useState(false);
  const [showCertPreview, setShowCertPreview] = useState(false);
  const timerRef = useRef(null);
  const certRef = useRef(null);


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
      } catch (err) {
        console.error(err);
        sendNotification("Erro ao carregar prova.", "erro");
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [id, user, navigate, sendNotification]);

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

  const handleSelect = (qIndex, aIndex) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qIndex]: aIndex }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    exam.perguntas.forEach((q, index) => {
      if (answers[index] === q.corretaIndex) correctCount++;
    });
    return Math.round((correctCount / exam.perguntas.length) * 100);
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();
    if (result) return;
    
    if (!isAutoSubmit && Object.keys(answers).length < exam.perguntas.length) {
      if (!window.confirm("Você não respondeu todas as perguntas. Deseja enviar mesmo assim? As não respondidas serão consideradas erradas.")) {
        return;
      }
    }

    setIsSubmitting(true);
    clearInterval(timerRef.current);

    const score = calculateScore();
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
        sendNotification(`Parabéns! Você foi aprovado com nota ${score}. Seu certificado foi enviado para assinatura do Comando Geral.`, 'sucesso');
      } else {
        sendNotification(`Você reprovou com nota ${score}. Mínimo necessário: ${exam.nota_aprovacao}.`, 'erro');
      }
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao processar prova.", 'erro');
    } finally {
      setIsSubmitting(false);
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
      <button onClick={() => navigate(`/militar/cursos/${exam.curso_id}`)} className="flex items-center gap-2 text-gray-500 hover:text-gold text-sm mb-6 transition-colors">
        <MdArrowBack /> Voltar ao Curso
      </button>

      {/* Cabeçalho da Prova */}
      <div className="hero-card p-6 mb-8 border border-gray-800 bg-[#0a0a0a]">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">{exam.titulo}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">{exam.cursos?.nome}</p>
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
            <div className="mt-4 space-y-3">
              <div className="inline-block bg-mil-black border border-gold/30 p-4 rounded-xl text-left">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">🏅 Certificado Emitido</p>
                <p className="text-sm font-mono text-gray-300">Cód: {certificate.codigo_verificacao}</p>
                <p className="text-xs text-gray-500 mt-1">Válido no Portal de Verificação do 2º BP CHOQUE</p>
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => setShowCertPreview(true)}
                  className="btn-secondary !text-xs flex items-center gap-1.5"
                >
                  <MdCardMembership /> Visualizar Certificado
                </button>
                <button
                  onClick={async () => {
                    if (!certRef.current) { setShowCertPreview(true); return; }
                    setDownloading(true);
                    try {
                      await downloadCertificateAsPDF(certRef.current, `Certificado_${exam?.cursos?.nome || 'curso'}`);
                      sendNotification('PDF baixado!', 'sucesso');
                    } catch(e) { sendNotification('Erro ao gerar PDF', 'erro'); }
                    finally { setDownloading(false); }
                  }}
                  disabled={downloading}
                  className="btn-gold !text-xs flex items-center gap-1.5"
                >
                  {downloading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <MdDownload />}
                  Baixar PDF
                </button>
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
                {q.alternativas.map((alt, aIndex) => {
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
                })}
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

      {/* ===== CERTIFICATE PREVIEW MODAL ===== */}
      {showCertPreview && certificate && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="flex items-center justify-between w-full max-w-5xl mb-4 bg-mil-dark border border-gray-800 rounded-xl px-5 py-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Certificado de Conclusão</h2>
              <p className="text-[10px] text-gray-500 font-mono">{certificate.codigo_verificacao}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  setDownloading(true);
                  try {
                    await downloadCertificateAsPDF(certRef.current, `Certificado_${exam?.cursos?.nome || 'curso'}`);
                    sendNotification('PDF baixado!', 'sucesso');
                  } catch(e) { sendNotification('Erro ao gerar PDF', 'erro'); }
                  finally { setDownloading(false); }
                }}
                disabled={downloading}
                className="btn-gold !py-2 !px-4 !text-xs flex items-center gap-1.5"
              >
                {downloading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <MdDownload />}
                Baixar PDF
              </button>
              <button onClick={() => setShowCertPreview(false)} className="text-gray-400 hover:text-white p-2 transition-colors">
                <MdCancel className="text-2xl" />
              </button>
            </div>
          </div>
          <div className="overflow-auto w-full flex justify-center">
            <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: '-184px' }}>
              <CertificateTemplate
                ref={certRef}
                militarNome={user?.nome}
                militarPatente={cargoLabels?.[user?.cargo] || user?.cargo}
                cursoNome={exam?.cursos?.nome}
                cargaHoraria={exam?.cursos?.carga_horaria || '—'}
                nota={result?.nota}
                instrutor={exam?.cursos?.instrutor || 'Instrutor Responsável'}
                data={certificate.data_emissao ? new Date(certificate.data_emissao).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
                codigo={certificate.codigo_verificacao}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
