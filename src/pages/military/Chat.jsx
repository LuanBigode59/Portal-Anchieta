import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Topbar from '../../components/layout/Topbar';
import { supabase } from '../../supabaseClient';
import { chatService } from '../../services/chatService';
import { 
  MdSend, MdChat, MdTag, MdPerson, MdSearch, MdPushPin, 
  MdReply, MdEdit, MdDelete, MdAttachFile, MdCheck, MdClose, MdFileDownload, MdCircle
} from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Chat() {
  const { user, userRankLevel } = useAuth();
  const { sendNotification } = useNotifications();

  // Canais são as companhias
  const channels = [
    { id: 'Comando', label: 'comando', icon: <MdTag /> },
    { id: 'Equipe Guardião', label: 'equipe guardião', icon: <MdTag /> },
    { id: 'Rocam', label: 'rocam', icon: <MdTag /> },
    { id: 'Operacional', label: 'operacional', icon: <MdTag /> }
  ];

  // Filtragem de canais com base na companhia
  const allowedChannels = channels.filter(c => {
    if (!user) return false;
    // Quem ta na companhia Comando tem acesso a todos
    if (user.companhia === 'Comando' || user.companhia === 'QG / Comando') return true;
    // Os outros só acessam a sua própria companhia
    return user.companhia === c.id;
  });

  const [currentChannel, setCurrentChannel] = useState(
    user?.companhia === 'QG / Comando' ? 'Comando' : (user?.companhia || 'Comando')
  );

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Attachments
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState('image'); // image, video, pdf
  const [showAttachInput, setShowAttachInput] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Editing, Replying, Pinning
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Members sidebar
  const [members, setMembers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const chatEndRef = useRef(null);

  // Garantir que o canal atual seja válido
  useEffect(() => {
    if (allowedChannels.length > 0 && !allowedChannels.find(c => c.id === currentChannel)) {
      setCurrentChannel(allowedChannels[0].id);
    }
  }, [allowedChannels, currentChannel]);

  // Load Messages & Members
  const loadChatData = async () => {
    try {
      const msgs = await chatService.getMessages(currentChannel);
      setMessages(msgs);
      const userList = await chatService.getActiveUsers();
      setMembers(userList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!currentChannel) return;
    
    loadChatData();

    // Rastrear presença
    if (user) {
      chatService.setOnlineStatus(user.id, true, currentChannel);
    }

    // Supabase Realtime para Mensagens do Chat
    const chatChannel = supabase.channel(`chat_messages_${currentChannel}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new;
            if (newMsg.canal === currentChannel) {
              setMessages(prev => {
                // Avoid duplicates
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
          }
        }
      )
      .subscribe();

    // Supabase Realtime para Status de Digitando / Online
    const presenceChannel = supabase.channel(`chat_presence_${currentChannel}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updatedUser = payload.new;
          // Atualizar lista de membros
          setMembers(prev => prev.map(m => m.id === updatedUser.id ? { ...m, ...updatedUser } : m));

          // Verificar se está digitando no canal atual
          if (updatedUser.typing_channel === currentChannel && updatedUser.id !== user.id) {
            setTypingUser(updatedUser.nome);
          } else if (updatedUser.id !== user.id) {
            setTypingUser(null);
          }
        }
      )
      .subscribe();

    // Desconectar / Ficar offline ao sair
    return () => {
      if (user) {
        chatService.setOnlineStatus(user.id, false, null);
      }
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentChannel, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mensagem Digitando...
  const handleTyping = () => {
    if (user) {
      chatService.setTypingStatus(user.id, currentChannel);
      // Limpa status após 3 segundos sem digitar
      setTimeout(() => {
        chatService.setTypingStatus(user.id, null);
      }, 3000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachmentUrl.trim()) return;

    try {
      const msgData = {
        canal: currentChannel,
        user_id: user.id,
        user_nome: user.nome,
        user_cargo: user.cargo,
        content: newMessage.trim(),
        reply_to_id: replyingTo ? replyingTo.id : null,
        attachments: attachmentUrl.trim() ? [{ url: attachmentUrl.trim(), type: attachmentType }] : [],
        pinned: false,
        edited: false,
        deleted: false
      };

      const sentMsg = await chatService.sendMessage(msgData);
      
      // Adiciona localmente para garantir que apareça imediatamente
      setMessages(prev => {
        if (prev.find(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });

      setNewMessage('');
      setAttachmentUrl('');
      setShowAttachInput(false);
      setReplyingTo(null);
    } catch (err) {
      console.error("Erro ao enviar mensagem no chat:", err);
      sendNotification("Erro ao enviar mensagem.", "erro");
    }
  };

  const startEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditContent(msg.content);
  };

  const saveEdit = async (id) => {
    try {
      await chatService.updateMessage(id, editContent);
      // Atualiza a tela imediatamente
      setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editContent, edited: true } : m));
      setEditingMsgId(null);
      setEditContent('');
    } catch (err) {
      sendNotification("Erro ao editar mensagem.", "erro");
    }
  };

  const deleteMsg = async (id) => {
    if (window.confirm("Deseja deletar esta mensagem?")) {
      try {
        await chatService.deleteMessage(id);
        // Atualiza a tela imediatamente sem precisar recarregar o chat
        setMessages(prev => prev.map(m => m.id === id ? { ...m, deleted: true } : m));
      } catch (err) {
        sendNotification("Erro ao apagar mensagem.", "erro");
      }
    }
  };

  const togglePin = async (msg) => {
    try {
      await chatService.pinMessage(msg.id, !msg.pinned);
      sendNotification(msg.pinned ? "Mensagem desfixada" : "Mensagem fixada no topo!", "sucesso");
    } catch (err) {
      sendNotification("Erro ao fixar mensagem.", "erro");
    }
  };


  // Filtro de Busca + Pinned
  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase()) || m.user_nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPin = showPinnedOnly ? m.pinned : true;
    const notDeleted = !m.deleted;
    return matchesSearch && matchesPin && notDeleted;
  });

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fadeIn pb-4">
      <Topbar title="CENTRAL DE COMUNICAÇÕES" subtitle="Chat militar unificado" />

      {/* Main Grid Layout */}
      <div className="flex-1 bg-mil-black rounded-2xl border border-gray-800 flex overflow-hidden shadow-2xl">
        
        {/* 1. Sidebar de Canais */}
        <div className="w-60 bg-[#070707] border-r border-gray-800 flex flex-col p-4 flex-shrink-0">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Canais de Voz e Texto</span>
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {allowedChannels.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setCurrentChannel(c.id);
                  setShowPinnedOnly(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  currentChannel === c.id 
                    ? 'bg-army-green/20 text-army-green-light border border-army-green/30' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <span className="text-sm">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Chat Feed Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] min-w-0">
          
          {/* Header do Canal */}
          <div className="h-14 border-b border-gray-800 px-5 flex items-center justify-between bg-[#0e0e0e]/50">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest">
              <MdTag className="text-gold" /> {currentChannel}
            </div>
            
            {/* Search & Pinned Filters */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar..." 
                  className="bg-[#070707] border border-gray-800 text-[10px] text-gray-300 rounded-lg pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-gold/30 focus:border-gold/30"
                />
              </div>

              <button 
                onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                className={`p-2 rounded-lg border transition-all ${showPinnedOnly ? 'bg-gold/20 text-gold border-gold/40' : 'bg-transparent text-gray-400 border-gray-800 hover:text-white'}`}
                title="Mensagens Fixadas"
              >
                <MdPushPin />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {filteredMessages.map(msg => {
              const isMe = msg.user_id === user?.id;
              
              return (
                <div key={msg.id} className={`flex gap-3 group animate-fadeIn ${isMe ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-mil-dark border border-gray-800 flex items-center justify-center text-gray-300 font-bold flex-shrink-0">
                    {msg.user_nome.charAt(0)}
                  </div>

                  <div className={`max-w-[75%] ${isMe ? 'text-right' : ''}`}>
                    {/* Meta info */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap" style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <span className="text-xs font-bold text-gray-200">{msg.user_nome}</span>
                      <span className="text-[8px] bg-army-green/10 text-army-green-light px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">{msg.user_cargo}</span>
                      <span className="text-[9px] text-gray-600 font-mono">{new Date(msg.created_at).toLocaleTimeString('pt-BR')}</span>
                      {msg.pinned && <MdPushPin className="text-gold text-xs" title="Mensagem Fixada" />}
                    </div>

                    {/* Resposta indicador */}
                    {msg.reply_to_id && (
                      <div className="text-[10px] text-gray-600 italic mb-1 flex items-center gap-1" style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <MdReply /> respondendo a uma mensagem
                      </div>
                    )}

                    {/* Conteúdo */}
                    <div className="relative group/content inline-block">
                      {editingMsgId === msg.id ? (
                        <div className="flex gap-2 mt-1">
                          <input 
                            type="text" 
                            value={editContent} 
                            onChange={e => setEditContent(e.target.value)}
                            className="mil-input !py-1 !text-xs" 
                          />
                          <button onClick={() => saveEdit(msg.id)} className="btn-green !p-2"><MdCheck /></button>
                          <button onClick={() => setEditingMsgId(null)} className="btn-secondary !p-2"><MdClose /></button>
                        </div>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe ? 'bg-army-green text-white rounded-tr-none' : 'bg-mil-dark border border-gray-800 text-gray-300 rounded-tl-none'
                        }`}>
                          {msg.content}
                          
                          {/* Anexos */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 border-t border-gray-800/50 pt-2 space-y-2">
                              {msg.attachments.map((att, idx) => (
                                <div key={idx} className="max-w-xs">
                                  {att.type === 'image' && (
                                    <a href={att.url} target="_blank" rel="noreferrer">
                                      <img src={att.url} alt="anexo" className="rounded-lg max-h-40 object-cover border border-gray-800" />
                                    </a>
                                  )}
                                  {att.type === 'video' && (
                                    <video src={att.url} controls className="rounded-lg max-h-40 object-cover border border-gray-800" />
                                  )}
                                  {att.type === 'pdf' && (
                                    <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#111] p-2 rounded-lg border border-gray-800 text-gold hover:text-gold-light">
                                      <MdAttachFile /> <span className="text-[10px] truncate">Documento PDF</span>
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ações Hover */}
                      {!editingMsgId && (
                        <div className={`absolute top-0 opacity-0 group-hover/content:opacity-100 flex gap-1 bg-[#111] border border-gray-800 p-1 rounded-lg shadow-lg transition-opacity ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                          <button onClick={() => setReplyingTo(msg)} className="p-1.5 text-gray-400 hover:text-gold text-sm" title="Responder"><MdReply /></button>
                          {isMe && <button onClick={() => startEdit(msg)} className="p-1.5 text-gray-400 hover:text-blue-400 text-sm" title="Editar"><MdEdit /></button>}
                          {(isMe || userRankLevel >= 13) && <button onClick={() => deleteMsg(msg.id)} className="p-1.5 text-gray-400 hover:text-red-500 text-sm" title="Apagar"><MdDelete /></button>}
                          {userRankLevel >= 10 && <button onClick={() => togglePin(msg)} className="p-1.5 text-gray-400 hover:text-gold text-sm" title="Fixar"><MdPushPin /></button>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Digitando Status */}
          {typingUser && (
            <div className="px-6 py-1 text-[10px] text-gray-500 italic">
              {typingUser} está digitando...
            </div>
          )}

          {/* Replying indicator */}
          {replyingTo && (
            <div className="px-6 py-2 bg-gold/5 border-t border-gold/20 flex justify-between items-center text-[10px] text-gray-300">
              <span>Respondendo a <strong>{replyingTo.user_nome}</strong></span>
              <button onClick={() => setReplyingTo(null)} className="text-red-500 font-bold"><MdClose /></button>
            </div>
          )}

          {/* Attachments Input */}
          {showAttachInput && (
            <div className="px-6 py-4 bg-mil-black/90 border-t border-gray-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-1.5"><MdAttachFile /> Anexar Mídia (Link)</span>
                <button onClick={() => setShowAttachInput(false)} className="text-gray-500 hover:text-white">×</button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="url" 
                  value={attachmentUrl}
                  onChange={e => setAttachmentUrl(e.target.value)}
                  className="mil-input flex-1 !text-xs" 
                  placeholder="Insira o link da Imagem, Vídeo ou PDF..." 
                />
                <select 
                  value={attachmentType}
                  onChange={e => setAttachmentType(e.target.value)}
                  className="mil-select sm:w-40 !text-xs"
                >
                  <option value="image">Imagem</option>
                  <option value="video">Vídeo</option>
                  <option value="pdf">Documento PDF</option>
                </select>
              </div>
            </div>
          )}

          {/* Chat Send Input */}
          <div className="p-4 border-t border-gray-800 bg-[#0e0e0e]/50">
            <form onSubmit={handleSend} className="flex gap-3">
              <button 
                type="button"
                onClick={() => setShowAttachInput(!showAttachInput)}
                className="bg-[#111] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white px-3.5 rounded-lg transition-colors flex items-center justify-center"
              >
                <MdAttachFile className="text-lg" />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={e => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={`Conversar em #${currentChannel}...`}
                className="mil-input flex-1"
              />
              <button type="submit" className="btn-green flex items-center justify-center !px-5 shadow-glow-green">
                <MdSend className="text-lg" />
              </button>
            </form>
          </div>
        </div>

        {/* 3. Sidebar de Membros Online */}
        <div className="w-56 bg-[#070707] border-l border-gray-800 flex flex-col p-4 flex-shrink-0">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Militares Ativos</span>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {members.filter(m => {
              if (m.status === 'Exonerado') return false;
              const isComando = m.companhia === 'Comando' || m.companhia === 'QG / Comando';
              if (isComando) return true; // Comando can see all channels
              return m.companhia === currentChannel; // Others only see their own channel
            }).map(member => (
              <div key={member.id} className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-mil-dark border border-gray-800 flex items-center justify-center text-xs text-gray-300 font-bold">
                    {member.nome.charAt(0)}
                  </div>
                  <MdCircle 
                    className={`absolute -bottom-1 -right-1 text-xs stroke-[#070707] stroke-2 ${
                      member.online ? 'text-green-500' : 'text-gray-600'
                    }`} 
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-200 truncate">{member.nome}</p>
                  <p className="text-[9px] text-gold font-mono truncate">{member.patente || member.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
