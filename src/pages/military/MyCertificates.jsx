import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Topbar from '../../components/layout/Topbar';
import CertificateTemplate from '../../components/certificates/CertificateTemplate';
import { downloadCertificateAsPDF } from '../../utils/certificateGenerator';
import { examService } from '../../services/examService';
import { useNotifications } from '../../contexts/NotificationContext';
import { cargoLabels } from '../../data/ranks';
import {
  MdCardMembership, MdDownload, MdSearch, MdClose, MdVerified,
  MdSchool, MdCalendarToday, MdAccessTime, MdStar
} from 'react-icons/md';

export default function MyCertificates() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await examService.getCertificatesByUser(user.id);
        setCertificates(data);
      } catch (err) {
        console.error(err);
        sendNotification('Erro ao carregar certificados', 'erro');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleDownload = async () => {
    if (!certRef.current || !selectedCert) return;
    setDownloading(true);
    try {
      const nomeSanitized = (selectedCert.cursos?.nome || 'curso').replace(/[^a-zA-Z0-9]/g, '_');
      await downloadCertificateAsPDF(certRef.current, `Certificado_${nomeSanitized}`);
      sendNotification('PDF baixado com sucesso!', 'sucesso');
    } catch (err) {
      console.error(err);
      sendNotification('Erro ao gerar PDF: ' + err.message, 'erro');
    } finally {
      setDownloading(false);
    }
  };

  const certData = selectedCert ? {
    militarNome: user?.nome || '',
    militarPatente: cargoLabels[user?.cargo] || user?.cargo || '',
    cursoNome: selectedCert.cursos?.nome || 'Curso',
    cargaHoraria: selectedCert.cursos?.carga_horaria || '',
    nota: selectedCert.nota,
    instrutor: selectedCert.cursos?.instrutor || 'Instrutor',
    data: selectedCert.data_emissao
      ? new Date(selectedCert.data_emissao).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR'),
    codigo: selectedCert.codigo_verificacao,
  } : null;

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Topbar
          title="MEUS CERTIFICADOS"
          subtitle="Certificados de cursos concluídos"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-gray-800 rounded-xl bg-mil-black/20">
          <MdCardMembership className="text-5xl text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">Nenhum certificado emitido ainda.</p>
          <p className="text-gray-700 text-xs mt-1">Conclua um curso para receber seu certificado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map(cert => (
            <div
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className="group hero-card p-5 border border-gray-800 hover:border-gold/40 cursor-pointer transition-all hover:shadow-gold/10 hover:shadow-lg"
            >
              {/* Gold top bar */}
              <div className="h-1 bg-gradient-to-r from-gold/60 via-gold to-gold/60 rounded-full mb-4" />

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  <MdCardMembership className="text-gold text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gold uppercase tracking-widest mb-0.5">Certificado</p>
                  <h3 className="text-sm font-black text-white leading-tight line-clamp-2 group-hover:text-gold transition-colors">
                    {cert.cursos?.nome || 'Curso'}
                  </h3>
                </div>
              </div>

              <div className="space-y-1.5 text-[10px] text-gray-500">
                {cert.cursos?.carga_horaria && (
                  <div className="flex items-center gap-1.5">
                    <MdAccessTime className="text-xs" />
                    <span>Carga Horária: <span className="text-gray-300">{cert.cursos.carga_horaria}</span></span>
                  </div>
                )}
                {cert.nota && (
                  <div className="flex items-center gap-1.5">
                    <MdStar className="text-xs text-gold" />
                    <span>Nota: <span className="text-gold font-bold">{cert.nota}/100</span></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MdCalendarToday className="text-xs" />
                  <span>
                    {cert.data_emissao
                      ? new Date(cert.data_emissao).toLocaleDateString('pt-BR')
                      : 'Data de emissão'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-[9px] font-mono text-gray-600 truncate max-w-[120px]">
                  {cert.codigo_verificacao}
                </span>
                <div className="flex items-center gap-1 text-[9px] text-army-green-light font-bold">
                  <MdVerified className="text-xs" /> Verificado
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== CERTIFICATE PREVIEW MODAL ===== */}
      {selectedCert && certData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn p-4">
          <div className="flex flex-col items-center gap-4 w-full max-w-5xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between w-full bg-mil-dark border border-gray-800 rounded-xl px-5 py-3">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  {selectedCert.cursos?.nome}
                </h2>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{selectedCert.codigo_verificacao}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-gold !py-2 !px-4 !text-[11px] flex items-center gap-1.5"
                >
                  {downloading
                    ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    : <MdDownload className="text-base" />}
                  {downloading ? 'Gerando...' : 'Baixar PDF'}
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="text-gray-500 hover:text-white transition-colors p-2"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Certificate Preview — scrollable on small screens */}
            <div className="overflow-auto w-full rounded-xl shadow-2xl shadow-gold/10 flex justify-center">
              <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: '-184px' }}>
                <CertificateTemplate ref={certRef} {...certData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
