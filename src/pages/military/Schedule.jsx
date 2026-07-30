import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdCalendarMonth, MdChevronLeft, MdChevronRight, MdEdit, MdClose, MdSave, MdDelete } from 'react-icons/md';
import { SCHEDULE_TYPES } from '../../data/constants';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Schedule() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // State for schedule data from BD
  const [scheduleData, setScheduleData] = useState({});

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Permissões
  const canEdit = user?.patente && ['capitao', 'major', 'tenente_coronel'].includes(user.patente.toLowerCase().replace('-', '_'));

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [formData, setFormData] = useState({ type: 'servico', label: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, [currentMonth]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('escalas')
        .select('*')
        .gte('data', firstDay)
        .lte('data', lastDay);

      if (error) throw error;

      // Transform array into an object mapping days to events
      const newData = {};
      data.forEach(item => {
        // Fix timezone issue when parsing date
        const dateStr = item.data; // "YYYY-MM-DD"
        const day = parseInt(dateStr.split('-')[2], 10);
        
        // In case there are multiple, keep the first for simplicity in this view, 
        // or we could show all. We'll stick to 1 per day for UI simplicity.
        newData[day] = {
          id: item.id,
          type: item.tipo,
          label: item.descricao
        };
      });

      setScheduleData(newData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (day) => {
    if (!day || !canEdit) return;
    setSelectedDay(day);
    if (scheduleData[day]) {
      setFormData(scheduleData[day]);
    } else {
      setFormData({ type: 'servico', label: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Format date properly "YYYY-MM-DD"
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    try {
      if (formData.id) {
        // Update
        const { error } = await supabase
          .from('escalas')
          .update({
            tipo: formData.type,
            descricao: formData.label
          })
          .eq('id', formData.id);
        
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('escalas')
          .insert([{
            data: dateStr,
            tipo: formData.type,
            descricao: formData.label,
            created_by: user.id
          }]);
          
        if (error) throw error;
      }
      
      sendNotification('Escala salva com sucesso!', 'sucesso');
      setIsModalOpen(false);
      loadSchedules();
    } catch (error) {
      console.error(error);
      sendNotification('Erro ao salvar escala', 'erro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('escalas').delete().eq('id', formData.id);
      if (error) throw error;
      
      sendNotification('Escala removida!', 'sucesso');
      setIsModalOpen(false);
      loadSchedules();
    } catch (error) {
      console.error(error);
      sendNotification('Erro ao remover escala', 'erro');
    } finally {
      setSaving(false);
    }
  };

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="ESCALAS" subtitle="Escala de Serviço, Operações e Alertas Diários" />

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-3">
          {Object.values(SCHEDULE_TYPES).map(type => (
            <div key={type.id} className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
              <span>{type.icon} {type.label}</span>
            </div>
          ))}
        </div>
        {canEdit ? (
          <div className="text-xs text-gold flex items-center gap-1.5 font-bold uppercase tracking-widest bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/30">
            <MdEdit /> Modo Edição Ativo
          </div>
        ) : (
          <div className="text-xs text-gray-500 flex items-center gap-1.5 font-bold uppercase tracking-widest bg-gray-500/10 px-3 py-1.5 rounded-lg border border-gray-500/30">
             Somente Visualização
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="mil-card relative">
        {loading && (
          <div className="absolute inset-0 bg-mil-black/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
            <div className="spinner" />
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-mil-border">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-gold transition-colors">
            <MdChevronLeft size={24} />
          </button>
          <h3 className="text-lg font-black text-gray-100 uppercase tracking-wider capitalize">{monthName}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-gold transition-colors">
            <MdChevronRight size={24} />
          </button>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const schedule = day ? scheduleData[day] : null;
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const typeInfo = schedule ? SCHEDULE_TYPES[schedule.type.toUpperCase()] || {} : {};

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                className={`relative aspect-square sm:aspect-auto sm:h-24 p-1 sm:p-2 rounded-lg border transition-all ${
                  day === null ? 'border-transparent' :
                  isToday ? 'border-gold/50 bg-gold/5 shadow-[0_0_15px_rgba(201,168,76,0.1)]' :
                  schedule ? 'border-mil-border/80 bg-mil-dark hover:border-gold/30 cursor-pointer' :
                  `border-mil-border/30 hover:border-mil-border hover:bg-white/5 cursor-pointer`
                }`}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-start">
                      <p className={`text-xs sm:text-sm font-bold ${isToday ? 'text-gold' : 'text-gray-400'}`}>{day}</p>
                      {canEdit && !schedule && <MdEdit className="text-[10px] text-gray-600 opacity-0 hover:opacity-100 transition-opacity" />}
                    </div>
                    {schedule && (
                      <div className="mt-1">
                        <div className="w-full h-1 rounded-full" style={{ backgroundColor: typeInfo.color || '#4a8c34' }} />
                        <p className="text-[8px] sm:text-[10px] text-gray-500 mt-1 truncate hidden sm:block">{schedule.label}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming */}
      <div className="mil-card mt-6">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MdCalendarMonth className="text-gold" /> Próximos Compromissos deste Mês
        </h3>
        <div className="space-y-2">
          {Object.entries(scheduleData)
            .filter(([day]) => parseInt(day) >= new Date().getDate() || month > new Date().getMonth() || year > new Date().getFullYear())
            .slice(0, 5)
            .map(([day, sched]) => {
              const typeInfo = SCHEDULE_TYPES[sched.type.toUpperCase()] || {};
              return (
                <div key={day} className="flex items-center gap-4 p-3 rounded-lg bg-mil-black/40 border border-mil-border hover:border-gold/30 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black" style={{ backgroundColor: (typeInfo.color || '#4a8c34') + '20', color: typeInfo.color || '#4a8c34' }}>
                    {day}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-200">{sched.label}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{typeInfo.label || sched.type}</p>
                  </div>
                  <span className="text-lg">{typeInfo.icon || '📅'}</span>
                </div>
              );
          })}
          {Object.keys(scheduleData).length === 0 && !loading && (
             <p className="text-sm text-gray-500 italic p-4 text-center">Nenhum compromisso marcado para este mês.</p>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-mil-dark border border-mil-border rounded-2xl w-full max-w-md shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-mil-border">
              <h3 className="text-lg font-black text-gray-100 uppercase tracking-widest flex items-center gap-2">
                <MdEdit className="text-gold" /> 
                Escala - Dia {selectedDay} de {monthName}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Aviso / Escala</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="mil-input"
                  >
                    {Object.values(SCHEDULE_TYPES).map(t => (
                      <option key={t.id} value={t.id.toLowerCase()}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mensagem (Qualquer um pode ver)</label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    className="mil-input"
                    placeholder="Ex: Op. Sentinela, Reunião geral, etc..."
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-8">
                {formData.id ? (
                  <button type="button" onClick={handleDelete} disabled={saving} className="btn-danger flex items-center gap-2 text-xs">
                    <MdDelete /> Remover
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={saving} className="btn-secondary text-xs">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2 text-xs">
                    {saving ? 'Salvando...' : <><MdSave /> Salvar Escala</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
