import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { useNotifications } from '../../contexts/NotificationContext';
import { galleryService } from '../../services/galleryService';
import { MdImage, MdSave, MdDelete, MdAddPhotoAlternate } from 'react-icons/md';

export default function ManageGallery() {
  const { sendNotification } = useNotifications();
  
  const [stats, setStats] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStats, setSavingStats] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, imagesData] = await Promise.all([
        galleryService.getStats(),
        galleryService.getImages()
      ]);
      setStats(statsData);
      setImages(imagesData);
    } catch (error) {
      console.error(error);
      sendNotification("Erro ao carregar dados da galeria.", 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatChange = (id, value) => {
    setStats(prev => prev.map(s => s.id === id ? { ...s, count: parseInt(value) || 0 } : s));
  };

  const handleSaveStats = async () => {
    try {
      setSavingStats(true);
      await Promise.all(stats.map(s => galleryService.updateStat(s.id, s.count)));
      sendNotification("Estatísticas salvas com sucesso!", 'sucesso');
    } catch (error) {
      console.error(error);
      sendNotification("Erro ao salvar estatísticas.", 'erro');
    } finally {
      setSavingStats(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      sendNotification("A imagem deve ter no máximo 5MB.", 'erro');
      return;
    }

    try {
      setUploading(true);
      await galleryService.uploadImage(file);
      sendNotification("Imagem enviada com sucesso!", 'sucesso');
      
      // Reload images
      const imagesData = await galleryService.getImages();
      setImages(imagesData);
    } catch (error) {
      console.error(error);
      sendNotification("Erro ao enviar imagem.", 'erro');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteImage = async (id, url) => {
    if (!window.confirm("Tem certeza que deseja apagar esta imagem?")) return;
    
    try {
      await galleryService.deleteImage(id, url);
      sendNotification("Imagem apagada com sucesso!", 'sucesso');
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      console.error(error);
      sendNotification("Erro ao apagar imagem.", 'erro');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedItem] = newImages.splice(sourceIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);
    
    setImages(newImages);
    setHasUnsavedOrder(true);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      await galleryService.updateImageOrder(images);
      sendNotification("Ordem das imagens salva com sucesso!", 'sucesso');
      setHasUnsavedOrder(false);
    } catch (error) {
      console.error(error);
      sendNotification("Erro ao salvar ordem.", 'erro');
    } finally {
      setSavingOrder(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="GERENCIAR GALERIA" subtitle="Estatísticas e Imagens" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna 1: Estatísticas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="mil-card bg-mil-black/50">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <div className="p-3 rounded-xl bg-gold/10 text-gold">
                <MdImage className="text-2xl" />
              </div>
              <h2 className="text-xl font-black text-gray-100 uppercase tracking-widest">Estatísticas</h2>
            </div>

            <div className="space-y-4">
              {stats.map(stat => (
                <div key={stat.id}>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {stat.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stat.count}
                    onChange={(e) => handleStatChange(stat.id, e.target.value)}
                    className="mil-input"
                  />
                </div>
              ))}

              <button
                onClick={handleSaveStats}
                disabled={savingStats}
                className="btn-gold w-full flex justify-center items-center gap-2 mt-4"
              >
                {savingStats ? <div className="spinner w-4 h-4 border-2" /> : <MdSave className="text-xl" />}
                {savingStats ? 'Salvando...' : 'Salvar Números'}
              </button>
            </div>
          </div>
        </div>

        {/* Coluna 2: Galeria de Imagens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mil-card bg-mil-black/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-800 pb-4">
              <h2 className="text-xl font-black text-gray-100 uppercase tracking-widest">Imagens da Galeria</h2>
              
              <div className="flex gap-2">
                {hasUnsavedOrder && (
                  <button
                    onClick={handleSaveOrder}
                    disabled={savingOrder}
                    className="btn-gold flex items-center justify-center gap-2 px-4 py-2"
                  >
                    {savingOrder ? <div className="spinner w-4 h-4 border-2" /> : <MdSave />}
                    Salvar Ordem
                  </button>
                )}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button 
                    disabled={uploading}
                    className="btn-primary flex items-center justify-center gap-2 pointer-events-none px-4 py-2"
                  >
                    {uploading ? (
                      <><div className="spinner w-4 h-4 border-2" /> Enviando...</>
                    ) : (
                      <><MdAddPhotoAlternate className="text-xl" /> Adicionar Foto</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                Nenhuma imagem enviada para a galeria.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div 
                    key={img.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-move ${
                      draggedIndex === index ? 'border-gold scale-105 shadow-gold-lg opacity-80 z-10' : 'border-gray-800 hover:border-gold/50'
                    }`}
                  >
                    <img src={img.url} alt="Galeria" className="w-full h-full object-cover pointer-events-none" />
                    
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        onClick={() => handleDeleteImage(img.id, img.url)}
                        className="p-3 rounded-full bg-danger/20 text-danger hover:bg-danger hover:text-white transition-colors"
                        title="Apagar Imagem"
                      >
                        <MdDelete className="text-2xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
