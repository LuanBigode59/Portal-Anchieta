import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Topbar from '../../components/layout/Topbar';
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

      {/* ===== CERTIFICATE MODAL ===== */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn p-4">
          <div className="flex flex-col items-center gap-4 w-full max-w-md bg-mil-dark border border-gray-800 rounded-xl p-6 relative">
             <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
              >
                <MdClose className="text-xl" />
              </button>
              
              <MdCardMembership className="text-6xl text-gold mb-2" />
              <h2 className="text-xl font-black text-white uppercase tracking-widest text-center">
                  {selectedCert.cursos?.nome}
              </h2>
              <p className="text-center text-sm text-gray-400 mt-2">
                 O seu certificado foi enviado no grupo do WhatsApp oficial do <strong>2º BPChq Anchieta</strong>.
              </p>
          </div>
        </div>
      )}
    </div>
  );
}
