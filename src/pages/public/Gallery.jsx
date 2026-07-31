import { useState, useEffect } from 'react';
import { galleryService } from '../../services/galleryService';

export default function Gallery() {
  const [categories, setCategories] = useState([
    { id: 'operacoes', label: 'Operações', count: 0 },
    { id: 'treinamentos', label: 'Treinamentos', count: 0 },
    { id: 'eventos', label: 'Eventos', count: 0 },
    { id: 'formatura', label: 'Formatura', count: 0 },
  ]);
  const [imagePaths, setImagePaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, imagesData] = await Promise.all([
          galleryService.getStats(),
          galleryService.getImages()
        ]);
        
        if (statsData && statsData.length > 0) {
          setCategories(statsData);
        }
        
        if (imagesData) {
          setImagePaths(imagesData.map(img => img.url));
        }
      } catch (error) {
        console.error("Erro ao carregar dados da galeria:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <img src="/logos/logo.png" alt="Logo Choque" className="w-20 h-20 mx-auto object-contain mb-6 drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]" />
          <p className="text-gold text-xs tracking-[6px] uppercase font-bold mb-3">Memórias</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            <span className="text-gold-gradient">Galeria</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Registros fotográficos e audiovisuais das operações, treinamentos e eventos do 2º BP Choque.
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {categories.map((cat, i) => (
            <button key={i} className="hero-card p-5 text-center group hover:-translate-y-1 transition-all duration-300">
              <p className="text-2xl font-black text-gold mb-1">{cat.count}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{cat.label}</p>
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {imagePaths.length > 0 ? imagePaths.map((src, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-gradient-to-br from-mil-card to-mil-dark border border-gray-800 overflow-hidden group cursor-pointer hover:border-gold/30 hover:shadow-gold-lg transition-all duration-500"
              >
                <img src={src} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                Nenhuma imagem na galeria.
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            Mais imagens disponíveis na área militar após login.
          </p>
        </div>
      </div>
    </div>
  );
}
