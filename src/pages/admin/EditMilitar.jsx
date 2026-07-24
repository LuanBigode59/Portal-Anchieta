import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { userService } from '../../services/userService';
import { useNotifications } from '../../contexts/NotificationContext';
import { MdArrowBack, MdSave, MdDelete, MdAdd } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { getRankById, ranks } from '../../data/ranks';
import { courseService } from '../../services/courseService';
import { medalService } from '../../services/medalService';

function VisualListEditor({ label, value, onChange, fields }) {
  const [newItem, setNewItem] = useState(
    fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {})
  );

  const handleAdd = () => {
    // verifica se pelo menos um campo não-data foi preenchido
    const hasValue = fields.some(f => f.type !== 'date' && newItem[f.key]?.trim() !== '');
    if (!hasValue) return;

    // garante que se a data estiver vazia, pegue a de hoje
    const itemToAdd = { ...newItem };
    fields.forEach(f => {
      if (f.type === 'date' && !itemToAdd[f.key]) {
        itemToAdd[f.key] = new Date().toISOString().split('T')[0];
      }
    });

    onChange([...(value || []), { ...itemToAdd, _id: crypto.randomUUID() }]);
    setNewItem(fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}));
  };

  const handleRemove = (index) => {
    if(!window.confirm("Deseja realmente remover este registro?")) return;
    const newArr = [...(value || [])];
    newArr.splice(index, 1);
    onChange(newArr);
  };

  return (
    <div className="mb-6 p-4 border border-gray-800 rounded-xl bg-mil-black/30">
      <h4 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-3">{label}</h4>
      
      {/* Existing items */}
      <div className="space-y-2 mb-4">
        {(value || []).map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 bg-mil-dark p-3 rounded-lg border border-gray-800 text-xs transition-colors hover:border-gray-700">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key} className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold">{f.label}</span>
                  <span className="text-gray-300 break-words">{item[f.key] || '-'}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => handleRemove(idx)} className="text-danger hover:text-danger-light p-1">
              <MdDelete className="text-lg" />
            </button>
          </div>
        ))}
        {!(value && value.length > 0) && <p className="text-xs text-gray-500 italic">Nenhum registro encontrado.</p>}
      </div>

      {/* Add new item */}
      <div className="border-t border-gray-800 pt-4">
        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Adicionar Novo Registro</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {fields.map(f => (
            f.type === 'select' ? (
              <select
                key={f.key}
                className="mil-select !text-xs !py-2"
                value={newItem[f.key] || ''}
                onChange={e => setNewItem({...newItem, [f.key]: e.target.value})}
              >
                <option value="">Selecione...</option>
                {f.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input 
                key={f.key}
                type={f.type || 'text'}
                placeholder={f.label}
                className="mil-input !text-xs !py-2"
                value={newItem[f.key] || ''}
                onChange={e => setNewItem({...newItem, [f.key]: e.target.value})}
              />
            )
          ))}
        </div>
        <button type="button" onClick={handleAdd} className="btn-gold !text-[10px] !py-2 px-3 flex items-center gap-1 w-full justify-center">
          <MdAdd className="text-sm" /> Adicionar
        </button>
      </div>
    </div>
  );
}

export default function EditMilitar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sendNotification } = useNotifications();

  const { user, userRankLevel } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableMedals, setAvailableMedals] = useState([]);
  const [targetRankLvl, setTargetRankLvl] = useState(0);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    patente: '',
    companhia: '',
    discord: '',
    observacoes: '',
    status: '',
    cursos: [],
    advertencias: [],
    elogios: [],
    promocoes: [],
    condecoracoes: [],
    historico: [],
    foto_url: ''
  });

  useEffect(() => {
    async function loadMilitar() {
      try {
        const [militar, coursesData, medalsData] = await Promise.all([
          userService.getUserById(id),
          courseService.getCourses(),
          medalService.getMedals()
        ]);
        
        const extraMedals = [
          'Cruz de Sangue',
          'Cruz do Mérito Policial',
          'Valor Militar',
          'Láurea de 1º Grau',
          'Láurea de 2º Grau',
          'Láurea de 3º Grau',
          'Láurea de 4º Grau',
          'Láurea de 5º Grau'
        ];
        
        setAvailableCourses(coursesData.map(c => c.nome));
        const allMedals = [...new Set([...medalsData.map(m => m.name), ...extraMedals])];
        setAvailableMedals(allMedals);

        if (militar) {
          const tLevel = getRankById(militar.patente)?.level || 0;
          setTargetRankLvl(tLevel);

          if (userRankLevel <= tLevel && !(user?.cpf === '25256' && user?.id === militar.id)) {
            sendNotification("Acesso negado: você não pode editar a ficha de um militar de patente superior ou igual à sua.", "erro");
            navigate('/admin/policiais');
            return;
          }

          setFormData({
            nome: militar.nome || '',
            cpf: militar.cpf || '',
            patente: militar.patente || '',
            companhia: militar.companhia || '',
            discord: militar.discord || '',
            observacoes: militar.observacoes || '',
            status: militar.status || 'Ativo',
            cursos: militar.cursos || [],
            advertencias: militar.advertencias || [],
            elogios: militar.elogios || [],
            promocoes: militar.promocoes || [],
            condecoracoes: militar.condecoracoes || [],
            historico: militar.historico || [],
            foto_url: militar.foto_url || ''
          });
        }
      } catch (err) {
        sendNotification("Erro ao carregar dados do militar.", 'erro');
      } finally {
        setLoading(false);
      }
    }
    loadMilitar();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUser(id, formData);
      sendNotification(`Ficha de ${formData.nome} atualizada com sucesso!`, 'sucesso');
      navigate(`/admin/policiais/${id}`);
    } catch (err) {
      sendNotification(err.message, 'erro');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/admin/policiais')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-mil-black border border-gray-800 text-gray-400 hover:text-gold hover:border-gold/30 transition-colors"
        >
          <MdArrowBack className="text-xl" />
        </button>
        <Topbar title="EDITAR FICHA" subtitle="Atualizar Dados do Militar" />
      </div>

      <div className="mil-card max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome de RP</label>
              <input 
                type="text" 
                required
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="mil-input" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Matrícula (Imutável)</label>
              <input 
                type="text" 
                disabled
                value={formData.cpf}
                className="mil-input opacity-50 cursor-not-allowed" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Patente</label>
              <select 
                value={formData.patente}
                onChange={e => setFormData({...formData, patente: e.target.value})}
                className="mil-select"
              >
                {ranks.map(r => (
                  <option 
                    key={r.id} 
                    value={r.id} 
                    disabled={r.level >= userRankLevel}
                  >
                    {r.insignia} {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Companhia</label>
              <select 
                value={formData.companhia}
                onChange={e => setFormData({...formData, companhia: e.target.value})}
                className="mil-select"
              >
                <option>Comando</option>
                <option>Equipe Guardião</option>
                <option>Rocam</option>
                <option>Operacional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status Administrativo</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="mil-select"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Exonerado">Exonerado / Demitido</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">WhatsApp</label>
              <input 
                type="tel" 
                value={formData.discord}
                onChange={e => setFormData({...formData, discord: e.target.value})}
                className="mil-input"
                placeholder="Ex: (11) 99999-9999" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">URL da Foto de Perfil</label>
            <input 
              type="text" 
              value={formData.foto_url}
              onChange={e => setFormData({...formData, foto_url: e.target.value})}
              className="mil-input" 
              placeholder="https://imgur.com/..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Observações (Visível para Oficiais)</label>
            <textarea 
              value={formData.observacoes}
              onChange={e => setFormData({...formData, observacoes: e.target.value})}
              className="mil-textarea" 
              rows={4} 
            />
          </div>

          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-gold font-black text-sm uppercase tracking-widest mb-4">Carreira, Condecorações e Histórico</h3>
            <p className="text-xs text-gray-400 mb-6">Utilize os painéis abaixo para adicionar ou remover registros oficiais do militar. As alterações só serão aplicadas quando você clicar em "Salvar Alterações".</p>
            
            <VisualListEditor 
              label="Cursos de Formação" 
              value={formData.cursos} 
              onChange={v => setFormData({...formData, cursos: v})} 
              fields={[
                { key: 'nome', label: 'Nome do Curso / Especialização', type: 'select', options: availableCourses },
                { key: 'data', label: 'Data de Conclusão', type: 'date' }
              ]}
            />

            <VisualListEditor 
              label="Condecorações (Medalhas)" 
              value={formData.condecoracoes} 
              onChange={v => setFormData({...formData, condecoracoes: v})} 
              fields={[
                { key: 'nome', label: 'Nome da Medalha/Condecoração', type: 'select', options: availableMedals },
                { key: 'data', label: 'Data de Recebimento', type: 'date' }
              ]}
            />

            <VisualListEditor 
              label="Elogios" 
              value={formData.elogios} 
              onChange={v => setFormData({...formData, elogios: v})} 
              fields={[
                { key: 'descricao', label: 'Motivo do Elogio' },
                { key: 'data', label: 'Data', type: 'date' }
              ]}
            />

            <VisualListEditor 
              label="Advertências" 
              value={formData.advertencias} 
              onChange={v => setFormData({...formData, advertencias: v})} 
              fields={[
                { key: 'tipo', label: 'Grau (Ex: VERBAL, ESCRITA, GRAVE)' },
                { key: 'motivo', label: 'Motivo' },
                { key: 'data', label: 'Data', type: 'date' }
              ]}
            />

            <VisualListEditor 
              label="Promoções" 
              value={formData.promocoes} 
              onChange={v => setFormData({...formData, promocoes: v})} 
              fields={[
                { key: 'patenteAnterior', label: 'Patente Anterior' },
                { key: 'novaPatente', label: 'Nova Patente' },
                { key: 'motivo', label: 'Motivo (Militarização, Antiguidade, etc)' },
                { key: 'data', label: 'Data', type: 'date' }
              ]}
            />

            <VisualListEditor 
              label="Histórico Geral (Ações, Provas, Relatórios, Operações)" 
              value={formData.historico} 
              onChange={v => setFormData({...formData, historico: v})} 
              fields={[
                { key: 'tipo', label: 'Tipo (Prova, Operação, Ingresso, etc)' },
                { key: 'descricao', label: 'Descrição Detalhada' },
                { key: 'data', label: 'Data', type: 'date' }
              ]}
            />

          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/admin/policiais')} className="btn-steel">Cancelar</button>
            <button type="submit" className="btn-green flex items-center gap-2">
              <MdSave className="text-xl" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
