import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import {
  MdSchool, MdAdd, MdEdit, MdDelete, MdClose, MdSave,
  MdWarning, MdSecurity, MdDirectionsCar, MdSettingsInputAntenna,
  MdGroups, MdMilitaryTech, MdRecordVoiceOver, MdDescription, MdGavel,
  MdViewModule, MdArrowUpward, MdArrowDownward, MdMenuBook
} from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { courseService } from '../../services/courseService';
import { COURSE_ICONS, COURSE_CATEGORIES } from '../../data/constants';

// Mapa de ícones para renderizar dinamicamente pelo nome
const ICON_MAP = {
  MdWarning,
  MdSchool,
  MdSecurity,
  MdDirectionsCar,
  MdSettingsInputAntenna,
  MdGroups,
  MdMilitaryTech,
  MdRecordVoiceOver,
  MdDescription,
  MdGavel,
};

// Helper para pegar o componente de ícone pelo nome
export function getCourseIcon(iconName) {
  return ICON_MAP[iconName] || MdSchool;
}

export default function ManageCourses() {
  const { sendNotification } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // === Estado para módulos ===
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ titulo: '', descricao: '', video_url: '' });
  const [moduleFile, setModuleFile] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [courseFiles, setCourseFiles] = useState({ imagem: null, video: null, pdf: null, slides: null });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    carga_horaria: 0,
    instrutor: '',
    imagem_url: '',
    video_url: '',
    pdf_url: '',
    slides_url: '',
    icone: 'MdSchool',
    qtd_modulos: 1,
    categoria: '',
    nota_minima: 0,
    status: true
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (err) {
      sendNotification("Erro ao carregar cursos", 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openModal = (course = null) => {
    if (course) {
      setEditingId(course.id);
      setFormData({
        nome: course.nome,
        descricao: course.descricao || '',
        carga_horaria: course.carga_horaria || 0,
        instrutor: course.instrutor || '',
        imagem_url: course.imagem_url || '',
        video_url: course.video_url || '',
        pdf_url: course.pdf_url || '',
        slides_url: course.slides_url || '',
        icone: course.icone || 'MdSchool',
        qtd_modulos: course.qtd_modulos || 1,
        categoria: course.categoria || '',
        nota_minima: course.nota_minima || 0,
        status: course.status
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '', descricao: '', carga_horaria: 0, instrutor: '',
        imagem_url: '', video_url: '', pdf_url: '', slides_url: '',
        icone: 'MdSchool', qtd_modulos: 1, categoria: '', nota_minima: 0, status: true
      });
    }
    setCourseFiles({ imagem: null, video: null, pdf: null, slides: null });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setCourseFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const dataToSend = {
        ...formData,
        carga_horaria: Number(formData.carga_horaria),
        qtd_modulos: Number(formData.qtd_modulos),
        nota_minima: Number(formData.nota_minima),
      };

      if (courseFiles.imagem) {
        dataToSend.imagem_url = await courseService.uploadFile(courseFiles.imagem, 'capas');
      }
      if (courseFiles.video) {
        dataToSend.video_url = await courseService.uploadFile(courseFiles.video, 'videos');
      }
      if (courseFiles.pdf) {
        dataToSend.pdf_url = await courseService.uploadFile(courseFiles.pdf, 'pdfs');
      }
      if (courseFiles.slides) {
        dataToSend.slides_url = await courseService.uploadFile(courseFiles.slides, 'slides');
      }

      if (editingId) {
        await courseService.updateCourse(editingId, dataToSend);
        sendNotification("Curso atualizado com sucesso!", 'sucesso');
      } else {
        await courseService.createCourse(dataToSend);
        sendNotification("Curso criado com sucesso!", 'sucesso');
      }
      closeModal();
      loadCourses();
    } catch (err) {
      sendNotification(err.message, 'erro');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, nome, imageUrl, videoUrl, pdfUrl, slidesUrl) => {
    if (window.confirm(`Tem certeza que deseja apagar o curso ${nome}? Provas e certificados associados poderão ser afetados.`)) {
      try {
        await courseService.deleteCourse(id);
        
        // Cleanup storage files if they exist
        if (imageUrl) await courseService.deleteFileByUrl(imageUrl);
        if (videoUrl) await courseService.deleteFileByUrl(videoUrl);
        if (pdfUrl) await courseService.deleteFileByUrl(pdfUrl);
        if (slidesUrl) await courseService.deleteFileByUrl(slidesUrl);

        sendNotification("Curso deletado.", 'sucesso');
        loadCourses();
      } catch (err) {
        sendNotification(err.message, 'erro');
      }
    }
  };

  // Renderiza o ícone selecionado do curso
  const renderCourseIcon = (iconName) => {
    const IconComponent = getCourseIcon(iconName);
    return <IconComponent />;
  };

  // ========== FUNÇÕES DE MÓDULOS ==========

  const openModulesModal = async (course) => {
    setSelectedCourse(course);
    setIsModulesModalOpen(true);
    setEditingModule(null);
    setModuleForm({ titulo: '', descricao: '', video_url: '' });
    setModuleFile(null);
    await loadModules(course.id);
  };

  const closeModulesModal = () => {
    setIsModulesModalOpen(false);
    setSelectedCourse(null);
    setModules([]);
    setEditingModule(null);
    setModuleFile(null);
  };

  const loadModules = async (cursoId) => {
    setModulesLoading(true);
    try {
      const data = await courseService.getModulesByCourse(cursoId);
      setModules(data);
    } catch (err) {
      sendNotification('Erro ao carregar módulos', 'erro');
    } finally {
      setModulesLoading(false);
    }
  };

  const handleModuleFormChange = (e) => {
    setModuleForm({ ...moduleForm, [e.target.name]: e.target.value });
  };

  const handleModuleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setModuleFile(e.target.files[0]);
    }
  };

  const handleSaveModule = async () => {
    if (!moduleForm.titulo.trim()) {
      sendNotification('O título do módulo é obrigatório', 'erro');
      return;
    }
    setIsUploading(true);
    try {
      let finalVideoUrl = moduleForm.video_url;
      if (moduleFile) {
        finalVideoUrl = await courseService.uploadFile(moduleFile, 'videos_modulos');
      }
      if (editingModule) {
        await courseService.updateModule(editingModule.id, {
          titulo: moduleForm.titulo,
          descricao: moduleForm.descricao,
          video_url: finalVideoUrl,
        });
        sendNotification('Módulo atualizado!', 'sucesso');
      } else {
        await courseService.createModule({
          curso_id: selectedCourse.id,
          titulo: moduleForm.titulo,
          descricao: moduleForm.descricao,
          video_url: finalVideoUrl,
          ordem: modules.length + 1,
        });
        sendNotification('Módulo adicionado!', 'sucesso');
      }
      setEditingModule(null);
      setModuleForm({ titulo: '', descricao: '', video_url: '' });
      setModuleFile(null);
      await loadModules(selectedCourse.id);
      // Atualiza qtd_modulos do curso
      const updatedModules = await courseService.getModulesByCourse(selectedCourse.id);
      await courseService.updateCourse(selectedCourse.id, { qtd_modulos: updatedModules.length });
      loadCourses();
    } catch (err) {
      sendNotification(err.message, 'erro');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditModule = (mod) => {
    setEditingModule(mod);
    setModuleForm({ titulo: mod.titulo, descricao: mod.descricao || '', video_url: mod.video_url || '' });
    setModuleFile(null);
  };

  const handleDeleteModule = async (mod) => {
    if (!window.confirm('Excluir este módulo?')) return;
    try {
      await courseService.deleteModule(mod.id);
      if (mod.video_url) {
        await courseService.deleteFileByUrl(mod.video_url);
      }
      sendNotification('Módulo excluído.', 'sucesso');
      await loadModules(selectedCourse.id);
      const updatedModules = await courseService.getModulesByCourse(selectedCourse.id);
      await courseService.updateCourse(selectedCourse.id, { qtd_modulos: updatedModules.length });
      loadCourses();
    } catch (err) {
      sendNotification(err.message, 'erro');
    }
  };

  const handleMoveModule = async (mod, direction) => {
    const idx = modules.findIndex(m => m.id === mod.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= modules.length) return;
    try {
      const other = modules[swapIdx];
      await courseService.updateModule(mod.id, { ordem: other.ordem });
      await courseService.updateModule(other.id, { ordem: mod.ordem });
      await loadModules(selectedCourse.id);
    } catch (err) {
      sendNotification(err.message, 'erro');
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Topbar title="GERENCIAR CURSOS" subtitle="Criar e Editar Cursos de Instrução" />
        <button 
          onClick={() => openModal()}
          className="btn-green self-start sm:self-auto flex items-center justify-center gap-2"
        >
          <MdAdd className="text-xl" /> Novo Curso
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course => {
            const IconComp = getCourseIcon(course.icone);
            return (
              <div key={course.id} className="hero-card flex flex-col p-0 overflow-hidden">
                {course.imagem_url ? (
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${course.imagem_url})` }} />
                ) : (
                  <div className="h-32 bg-mil-dark border-b border-gray-800 flex items-center justify-center">
                    <IconComp className="text-4xl text-army-green-light" />
                  </div>
                )}
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-army-green/10 border border-army-green/20 flex items-center justify-center text-army-green-light text-sm">
                        <IconComp />
                      </div>
                      <h3 className="text-sm font-black text-gray-100 truncate pr-2">{course.nome}</h3>
                    </div>
                    <span className={`badge-${course.status ? 'green' : 'danger'} !text-[9px] !px-2 !py-0.5`}>
                      {course.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mb-3">{course.descricao}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono flex-wrap">
                    <span>{course.carga_horaria}h</span>
                    <span className="text-mil-border">•</span>
                    <span>{course.qtd_modulos || 1} módulo(s)</span>
                    <span className="text-mil-border">•</span>
                    <span>{course.instrutor || 'Sem instrutor'}</span>
                  </div>
                </div>
                <div className="border-t border-gray-800 bg-[#0d0d0d] grid grid-cols-3 divide-x divide-gray-800">
                  <button 
                    onClick={() => openModal(course)}
                    className="p-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:bg-blue-500/10 flex justify-center gap-1 items-center transition-colors"
                  >
                    <MdEdit /> Editar
                  </button>
                  <button 
                    onClick={() => openModulesModal(course)}
                    className="p-3 text-[10px] font-bold text-army-green-light uppercase tracking-widest hover:bg-army-green/10 flex justify-center gap-1 items-center transition-colors"
                  >
                    <MdViewModule /> Módulos
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id, course.nome, course.imagem_url, course.video_url, course.pdf_url, course.slides_url)}
                    className="p-3 text-[10px] font-bold text-danger-light uppercase tracking-widest hover:bg-danger/10 flex justify-center gap-1 items-center transition-colors"
                  >
                    <MdDelete /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
          {courses.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-600">
              <MdSchool className="text-5xl mx-auto mb-3 text-gray-700" />
              <p>Nenhum curso cadastrado ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-mil-dark z-10">
              <h2 className="text-lg font-black text-white">{editingId ? 'Editar Curso' : 'Novo Curso'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <MdClose className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome do Curso *</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className="mil-input" />
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descrição</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleChange} className="mil-textarea" rows="3" />
                </div>

                {/* Ícone do Curso */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ícone do Curso</label>
                  <div className="relative">
                    <select
                      name="icone"
                      value={formData.icone}
                      onChange={handleChange}
                      className="mil-input !pr-10 appearance-none cursor-pointer"
                    >
                      {COURSE_ICONS.map(icon => (
                        <option key={icon.id} value={icon.id}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-army-green-light text-lg pointer-events-none">
                      {renderCourseIcon(formData.icone)}
                    </div>
                  </div>
                </div>

                {/* Quantidade de Módulos */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Qtd. de Módulos *</label>
                  <input
                    type="number"
                    name="qtd_modulos"
                    value={formData.qtd_modulos}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    required
                    className="mil-input"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Categoria</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="mil-input appearance-none cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {COURSE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Nota Mínima */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nota Mínima</label>
                  <input type="number" name="nota_minima" value={formData.nota_minima} onChange={handleChange} min="0" max="100" className="mil-input" />
                </div>

                {/* Carga Horária */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Carga Horária (h) *</label>
                  <input type="number" name="carga_horaria" value={formData.carga_horaria} onChange={handleChange} required className="mil-input" />
                </div>

                {/* Instrutor */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Instrutor</label>
                  <input type="text" name="instrutor" value={formData.instrutor} onChange={handleChange} className="mil-input" />
                </div>

                {/* Preview do Ícone */}
                <div className="md:col-span-2 bg-mil-black/50 border border-mil-border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-army-green/10 border border-army-green/20 flex items-center justify-center text-army-green-light text-2xl">
                    {renderCourseIcon(formData.icone)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-300">Preview do Card</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Ícone: {COURSE_ICONS.find(i => i.id === formData.icone)?.label || 'Geral'} — {formData.qtd_modulos || 1} módulo(s)
                    </p>
                  </div>
                </div>

                {/* Arquivos e URLs */}
                <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-800">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <MdViewModule className="text-army-green-light" /> Arquivos e Links
                  </h3>
                  
                  {/* Capa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fazer Upload da Imagem de Capa</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'imagem')} className="mil-input file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-army-green/20 file:text-army-green-light hover:file:bg-army-green/30 cursor-pointer" />
                      {courseFiles.imagem && <p className="text-[10px] text-army-green mt-1 truncate">Selecionado: {courseFiles.imagem.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ou URL da Imagem (Capa)</label>
                      <input type="url" name="imagem_url" value={formData.imagem_url} onChange={handleChange} className="mil-input" placeholder="https://..." />
                    </div>
                  </div>



                  {/* PDF */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fazer Upload do PDF (Material)</label>
                      <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'pdf')} className="mil-input file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-army-green/20 file:text-army-green-light hover:file:bg-army-green/30 cursor-pointer" />
                      {courseFiles.pdf && <p className="text-[10px] text-army-green mt-1 truncate">Selecionado: {courseFiles.pdf.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ou URL do PDF (Google Drive/etc)</label>
                      <input type="url" name="pdf_url" value={formData.pdf_url} onChange={handleChange} className="mil-input" placeholder="https://..." />
                    </div>
                  </div>

                  {/* Slides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fazer Upload dos Slides</label>
                      <input type="file" accept=".pdf,.ppt,.pptx" onChange={(e) => handleFileChange(e, 'slides')} className="mil-input file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-army-green/20 file:text-army-green-light hover:file:bg-army-green/30 cursor-pointer" />
                      {courseFiles.slides && <p className="text-[10px] text-army-green mt-1 truncate">Selecionado: {courseFiles.slides.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ou URL dos Slides</label>
                      <input type="url" name="slides_url" value={formData.slides_url} onChange={handleChange} className="mil-input" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2 flex items-center gap-3 bg-mil-black/50 p-4 rounded-lg border border-gray-800">
                  <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} className="w-4 h-4 rounded border-gray-700 text-army-green focus:ring-army-green bg-[#111]" id="status-checkbox" />
                  <label htmlFor="status-checkbox" className="text-sm font-bold text-gray-300 uppercase tracking-widest cursor-pointer">
                    Curso Ativo e Visível
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-mil-dark pb-2">
                <button type="button" onClick={closeModal} className="btn-secondary !text-xs" disabled={isUploading}>Cancelar</button>
                <button type="submit" disabled={isUploading} className="btn-green flex items-center gap-2 !text-xs">
                  {isUploading ? <><span className="spinner w-4 h-4" /> Salvando...</> : <><MdSave /> Salvar Curso</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL DE MÓDULOS ===== */}
      {isModulesModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mil-dark border border-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-mil-dark z-10">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <MdViewModule className="text-army-green-light" /> Módulos
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{selectedCourse.nome}</p>
              </div>
              <button onClick={closeModulesModal} className="text-gray-500 hover:text-white transition-colors">
                <MdClose className="text-2xl" />
              </button>
            </div>

            <div className="p-5">
              {/* Formulário de Adicionar/Editar Módulo */}
              <div className="bg-mil-black/50 border border-mil-border rounded-xl p-4 mb-6">
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MdMenuBook className="text-gold" />
                  {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Título do Módulo *</label>
                    <input
                      type="text"
                      name="titulo"
                      value={moduleForm.titulo}
                      onChange={handleModuleFormChange}
                      placeholder="Ex: Módulo 1 – Fundamentos"
                      className="mil-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Material de Apoio / Descrição</label>
                    <textarea
                      name="descricao"
                      value={moduleForm.descricao}
                      onChange={handleModuleFormChange}
                      placeholder="Texto que aparecerá como material de apoio do módulo..."
                      className="mil-textarea"
                      rows="4"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fazer Upload de Vídeo da Aula</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleModuleFileChange}
                        className="mil-input file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-army-green/20 file:text-army-green-light hover:file:bg-army-green/30 cursor-pointer"
                      />
                      {moduleFile && <p className="text-[10px] text-army-green mt-1 truncate">Selecionado: {moduleFile.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ou URL do Vídeo (Aula)</label>
                      <input
                        type="url"
                        name="video_url"
                        value={moduleForm.video_url}
                        onChange={handleModuleFormChange}
                        placeholder="https://..."
                        className="mil-input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveModule}
                      disabled={isUploading}
                      className="btn-green flex items-center gap-2 !text-xs"
                    >
                      {isUploading ? <><span className="spinner w-4 h-4" /> Salvando...</> : <><MdSave /> {editingModule ? 'Salvar Alteração' : 'Adicionar Módulo'}</>}
                    </button>
                    {editingModule && (
                      <button
                        type="button"
                        onClick={() => { setEditingModule(null); setModuleForm({ titulo: '', descricao: '', video_url: '' }); setModuleFile(null); }}
                        className="btn-secondary !text-xs"
                        disabled={isUploading}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de Módulos */}
              <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MdViewModule className="text-army-green-light" />
                Módulos Cadastrados ({modules.length})
              </h3>

              {modulesLoading ? (
                <div className="flex justify-center py-10"><div className="spinner" /></div>
              ) : modules.length === 0 ? (
                <div className="text-center py-10 text-gray-600 bg-mil-black/30 rounded-xl border border-mil-border">
                  <MdViewModule className="text-3xl mx-auto mb-2 text-gray-700" />
                  <p className="text-xs">Nenhum módulo cadastrado. Adicione o primeiro acima.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {modules.map((mod, idx) => (
                    <div
                      key={mod.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        editingModule?.id === mod.id
                          ? 'border-army-green/50 bg-army-green-dark/20'
                          : 'border-mil-border bg-mil-card/50 hover:border-mil-border-light'
                      }`}
                    >
                      {/* Ordem */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveModule(mod, 'up')}
                          disabled={idx === 0}
                          className="text-gray-600 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <MdArrowUpward className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleMoveModule(mod, 'down')}
                          disabled={idx === modules.length - 1}
                          className="text-gray-600 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <MdArrowDownward className="text-sm" />
                        </button>
                      </div>

                      {/* Número */}
                      <div className="w-8 h-8 rounded-lg bg-army-green/10 border border-army-green/20 flex items-center justify-center text-army-green-light text-xs font-black flex-shrink-0">
                        {idx + 1}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-200 truncate">{mod.titulo}</p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {mod.descricao ? mod.descricao.substring(0, 80) + '...' : 'Sem descrição'}
                          {mod.video_url && ' • 🎥 Vídeo'}
                        </p>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditModule(mod)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <MdEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod)}
                          className="p-2 text-danger-light hover:bg-danger/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <MdDelete className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-800 flex justify-end sticky bottom-0 bg-mil-dark">
              <button type="button" onClick={closeModulesModal} className="btn-secondary !text-xs">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
