import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proctorService } from '../../../services/proctorService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { supabase } from '../../../supabaseClient';
import { 
  LiveKitRoom, 
  VideoTrack, 
  AudioTrack,
  useTracks,
  useParticipants,
  RoomAudioRenderer
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { MdArrowBack, MdCheck, MdClose, MdWarning, MdPause, MdPlayArrow, MdVideocamOff, MdScreenShare, MdFullscreen } from 'react-icons/md';

const serverUrl = 'wss://your-livekit-server.livekit.cloud'; // In a real scenario, this would be env var

function ParticipantTile({ livekitParticipant, dbParticipant, onApprove, onReject, onPause, onInvalidate, onExpand }) {
  // Unconditional hook calls
  const allCameraTracks = useTracks([Track.Source.Camera]);
  const allScreenTracks = useTracks([Track.Source.ScreenShare]);

  const cameraTrack = livekitParticipant ? allCameraTracks.find(t => t.participant.identity === livekitParticipant.identity) : null;
  const screenTrack = livekitParticipant ? allScreenTracks.find(t => t.participant.identity === livekitParticipant.identity) : null;

  return (
    <div className="mil-card p-3 border border-gray-800 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400">
              {dbParticipant?.student?.nome?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{dbParticipant?.student?.nome || livekitParticipant?.identity || 'Aluno'}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{dbParticipant?.student?.patente}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
          dbParticipant?.status === 'waiting_approval' ? 'bg-orange-500/20 text-orange-400' :
          dbParticipant?.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
          dbParticipant?.status === 'taking_exam' ? 'bg-green-500/20 text-green-400' :
          dbParticipant?.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
          dbParticipant?.status === 'submitted' ? 'bg-purple-500/20 text-purple-400' :
          dbParticipant?.status === 'terminated' ? 'bg-red-500/20 text-red-400' :
          dbParticipant?.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-800 text-gray-400'
        }`}>
          {dbParticipant?.status === 'waiting_approval' ? 'Aguardando' :
           dbParticipant?.status === 'waiting_devices' ? 'Config. Dispositivos' :
           dbParticipant?.status === 'approved' ? 'Aprovado' :
           dbParticipant?.status === 'taking_exam' ? 'Em Prova' :
           dbParticipant?.status === 'paused' ? 'Pausado' :
           dbParticipant?.status === 'submitted' ? 'Entregou' :
           dbParticipant?.status === 'terminated' ? 'Invalidado' :
           dbParticipant?.status === 'rejected' ? 'Rejeitado' :
           dbParticipant?.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 h-32 bg-black rounded-lg overflow-hidden group">
        <div 
          className="relative border-r border-gray-800 flex items-center justify-center bg-gray-900 group/cam cursor-pointer transition-colors hover:bg-gray-800"
          onClick={() => onExpand(dbParticipant.student_id, 'camera')}
        >
          {cameraTrack?.publication?.track ? (
            <VideoTrack trackRef={cameraTrack} className="w-full h-full object-cover" />
          ) : (
            <MdVideocamOff className="text-gray-700 text-2xl" />
          )}
          <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white">Câmera</div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cam:opacity-100 flex items-center justify-center transition-opacity">
            <MdFullscreen className="text-white text-3xl drop-shadow-lg" />
          </div>
        </div>
        <div 
          className="relative flex items-center justify-center bg-gray-900 group/screen cursor-pointer transition-colors hover:bg-gray-800"
          onClick={() => onExpand(dbParticipant.student_id, 'screen')}
        >
          {screenTrack?.publication?.track ? (
            <VideoTrack trackRef={screenTrack} className="w-full h-full object-cover" />
          ) : (
            <MdScreenShare className="text-gray-700 text-2xl opacity-50" />
          )}
          <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white">Tela</div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/screen:opacity-100 flex items-center justify-center transition-opacity">
            <MdFullscreen className="text-white text-3xl drop-shadow-lg" />
          </div>
        </div>
      </div>

      {dbParticipant?.status === 'waiting_approval' && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => onApprove(dbParticipant.id)} className="flex-1 bg-green-500/20 text-green-500 hover:bg-green-500/30 p-2 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors">
            <MdCheck /> Aprovar
          </button>
          <button onClick={() => onReject(dbParticipant.id)} className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 p-2 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors">
            <MdClose /> Rejeitar
          </button>
        </div>
      )}

      {(dbParticipant?.status === 'taking_exam' || dbParticipant?.status === 'approved') && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => onPause(dbParticipant.id, true)} className="flex-1 border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 p-2 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors">
            <MdPause /> Pausar
          </button>
          <button onClick={() => onInvalidate(dbParticipant.id)} className="flex-1 border border-red-500/50 text-red-500 hover:bg-red-500/10 p-2 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors">
            <MdWarning /> Invalidar
          </button>
        </div>
      )}
      
      {dbParticipant?.status === 'paused' && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => onPause(dbParticipant.id, false)} className="flex-1 border border-green-500/50 text-green-500 hover:bg-green-500/10 p-2 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors">
            <MdPlayArrow /> Liberar
          </button>
          <button onClick={() => onInvalidate(dbParticipant.id)} className="flex-1 border border-red-500/50 text-red-500 hover:bg-red-500/10 p-2 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors">
            <MdWarning /> Invalidar
          </button>
        </div>
      )}
    </div>
  );
}

function RoomContent({ session, dbParticipants, onApprove, onReject, onPause, onInvalidate, onExpand }) {
  const livekitParticipants = useParticipants();
  
  // Filter out students who were rejected or whose attempts were invalidated
  const visibleParticipants = dbParticipants.filter(p => !['rejected', 'terminated'].includes(p.status));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {visibleParticipants.map(dbP => {
        const lkP = livekitParticipants.find(p => p.identity === dbP.student_id);
        return (
          <ParticipantTile 
            key={dbP.id} 
            livekitParticipant={lkP} 
            dbParticipant={dbP} 
            onApprove={onApprove}
            onReject={onReject}
            onPause={onPause}
            onInvalidate={onInvalidate}
            onExpand={onExpand}
          />
        );
      })}
      {visibleParticipants.length === 0 && (
        <div className="col-span-full py-20 text-center text-gray-500">
          Nenhum aluno na fila ou conectado no momento.
        </div>
      )}
    </div>
  );
}

function ExpandedVideoModal({ expandedVideo, onClose }) {
  const allCameraTracks = useTracks([Track.Source.Camera]);
  const allScreenTracks = useTracks([Track.Source.ScreenShare]);

  if (!expandedVideo) return null;

  const trackList = expandedVideo.type === 'camera' ? allCameraTracks : allScreenTracks;
  const track = trackList.find(t => t.participant.identity === expandedVideo.identity);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fadeIn">
      <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 z-50 transition-colors shadow-lg">
        <MdClose className="text-2xl" />
      </button>
      <div className="w-full h-full flex flex-col items-center justify-center">
        {track?.publication?.track ? (
          <VideoTrack trackRef={track} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-gray-800" />
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            {expandedVideo.type === 'camera' ? <MdVideocamOff className="text-6xl mb-4" /> : <MdScreenShare className="text-6xl mb-4 opacity-50" />}
            <p className="text-lg">Vídeo indisponível ou desconectado</p>
          </div>
        )}
        <div className="mt-4 px-4 py-2 bg-gray-900 rounded-full border border-gray-800 text-gray-300 text-sm font-bold tracking-widest uppercase">
          Visualizando {expandedVideo.type === 'camera' ? 'Câmera' : 'Tela'}
        </div>
      </div>
    </div>
  );
}

export default function ProctorSessionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [expandedVideo, setExpandedVideo] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [sessionData, participantsData, eventsData] = await Promise.all([
        proctorService.getSessionById(id),
        proctorService.getParticipants(id),
        proctorService.getEvents(id)
      ]);
      setSession(sessionData);
      setParticipants(participantsData);
      setEvents(eventsData);

      // Get LiveKit token for Instructor
      if (!token && user) {
        try {
          const t = await proctorService.getLivekitToken(sessionData.room_name, user.id, true);
          setToken(t);
        } catch (e) {
          console.error("LiveKit token error:", e);
        }
      }
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao carregar sessão", "erro");
    } finally {
      setLoading(false);
    }
  }, [id, user, token, sendNotification]);

  useEffect(() => {
    loadData();

    // Subscribe to DB changes
    const channel = supabase.channel(`proctor_session_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proctor_participants', filter: `session_id=eq.${id}` }, () => {
        loadData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'proctor_events', filter: `session_id=eq.${id}` }, (payload) => {
        setEvents(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, loadData]);

  const handleApprove = async (participantId) => {
    try {
      await proctorService.updateParticipantStatus(participantId, 'approved');
      proctorService.logEvent(session.id, participantId, 'student_approved', 'info');
      sendNotification("Aluno aprovado", "sucesso");
    } catch (e) {
      sendNotification("Erro ao aprovar", "erro");
    }
  };

  const handleReject = async (participantId) => {
    const reason = window.prompt("Motivo da rejeição:");
    if (reason === null) return;
    try {
      await proctorService.updateParticipantStatus(participantId, 'rejected', reason);
      proctorService.logEvent(session.id, participantId, 'student_rejected', 'warning', { reason });
      sendNotification("Aluno rejeitado", "sucesso");
    } catch (e) {
      sendNotification("Erro ao rejeitar", "erro");
    }
  };

  const handlePause = async (participantId, isPausing) => {
    try {
      await proctorService.updateParticipantStatus(participantId, isPausing ? 'paused' : 'taking_exam');
      proctorService.logEvent(session.id, participantId, isPausing ? 'exam_paused' : 'exam_resumed', 'warning');
      sendNotification(`Prova ${isPausing ? 'pausada' : 'liberada'}`, "sucesso");
    } catch (e) {
      sendNotification("Erro ao alterar status da prova", "erro");
    }
  };

  const handleInvalidate = async (participantId) => {
    if (!window.confirm("Tem certeza que deseja invalidar a tentativa deste aluno? A prova será encerrada com nota zero.")) return;
    try {
      await proctorService.updateParticipantStatus(participantId, 'terminated');
      proctorService.logEvent(session.id, participantId, 'attempt_invalidated', 'critical');
      sendNotification("Tentativa invalidada", "sucesso");
    } catch (e) {
      sendNotification("Erro ao invalidar", "erro");
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="spinner"></div></div>;
  if (!session) return <div className="p-8 text-center">Sessão não encontrada.</div>;

  return (
    <div className="flex h-screen bg-black overflow-hidden animate-fadeIn">
      {/* Left Main Content - Video Grid */}
      <div className="flex-1 flex flex-col relative">
        <div className="bg-[#0a0a0a] border-b border-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/provas/supervisao')} className="text-gray-400 hover:text-white">
              <MdArrowBack className="text-2xl" />
            </button>
            <div>
              <h1 className="font-bold text-white leading-tight">{session.title}</h1>
              <p className="text-xs text-gold uppercase tracking-widest">{session.provas?.titulo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded bg-gray-900 border border-gray-800 text-xs flex flex-col items-center">
              <span className="text-gray-500">Aguardando</span>
              <span className="font-bold text-orange-400">{participants.filter(p => p.status === 'waiting_approval').length}</span>
            </div>
            <div className="px-3 py-1 rounded bg-gray-900 border border-gray-800 text-xs flex flex-col items-center">
              <span className="text-gray-500">Conectados</span>
              <span className="font-bold text-green-400">{participants.filter(p => ['connected', 'taking_exam', 'paused'].includes(p.status)).length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {token ? (
            <LiveKitRoom
              video={false}
              audio={false}
              token={token}
              serverUrl={import.meta.env.VITE_LIVEKIT_URL}
              connect={true}
            >
              <RoomContent 
                session={session} 
                dbParticipants={participants} 
                onApprove={handleApprove}
                onReject={handleReject}
                onPause={handlePause}
                onInvalidate={handleInvalidate}
                onExpand={(identity, type) => setExpandedVideo({ identity, type })}
              />
              <ExpandedVideoModal expandedVideo={expandedVideo} onClose={() => setExpandedVideo(null)} />
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            <RoomContent 
              session={session} 
              dbParticipants={participants} 
              onApprove={handleApprove}
              onReject={handleReject}
              onPause={handlePause}
              onInvalidate={handleInvalidate}
              onExpand={() => {}}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Events Log */}
      <div className="w-80 border-l border-gray-800 bg-[#0a0a0a] flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-bold text-white text-sm uppercase tracking-widest">Histórico de Eventos</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {events.map(event => {
            const eventTranslations = {
              'tab_hidden': 'Aluno saiu da aba da prova',
              'tab_visible': 'Aluno voltou para a aba da prova',
              'student_approved': 'Aluno autorizado a entrar',
              'student_rejected': 'Entrada do aluno rejeitada',
              'exam_paused': 'Prova pausada pelo instrutor',
              'exam_resumed': 'Prova retomada pelo instrutor',
              'exam_invalidated': 'Prova invalidada',
              'exam_started': 'Aluno iniciou a prova',
              'exam_submitted': 'Aluno finalizou a prova',
              'camera_muted': 'Câmera desativada',
              'camera_unmuted': 'Câmera ativada',
              'screen_unshared': 'Compartilhamento de tela interrompido',
              'screen_shared': 'Compartilhamento de tela iniciado'
            };
            const translatedEvent = eventTranslations[event.event_type] || event.event_type.replace(/_/g, ' ');

            return (
              <div key={event.id} className={`text-xs p-2 rounded border-l-2 ${
                event.severity === 'critical' ? 'border-red-500 bg-red-500/10 text-red-200' :
                event.severity === 'warning' ? 'border-orange-500 bg-orange-500/10 text-orange-200' :
                'border-blue-500 bg-blue-500/10 text-blue-200'
              }`}>
                <div className="flex justify-between text-[9px] opacity-60 mb-1">
                  <span>{new Date(event.created_at).toLocaleTimeString()}</span>
                  {event.participant?.student?.nome && <span>{event.participant.student.nome}</span>}
                </div>
                <p className="font-medium">{translatedEvent}</p>
                {event.metadata?.reason && <p className="opacity-80 mt-1 italic">"{event.metadata.reason}"</p>}
              </div>
            );
          })}
          {events.length === 0 && (
            <p className="text-gray-500 text-xs text-center">Nenhum evento registrado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
