import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar';
import { courseService } from '../../services/courseService';
import { MdSchool, MdAccessTime, MdViewModule, MdPlayArrow } from 'react-icons/md';
import { getCourseIcon } from '../admin/ManageCourses';

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await courseService.getActiveCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;
  }

  return (
    <div className="animate-fadeIn">
      <Topbar title="CURSOS" subtitle="Centro de Instrução e Formação" />

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((course, i) => {
          const IconComp = getCourseIcon(course.icone);
          const modulos = course.qtd_modulos || 0;
          const horas = course.carga_horaria || 0;

          return (
            <div
              key={course.id}
              className="bg-[#0d1117] border border-[#1c2533] rounded-2xl flex flex-col overflow-hidden animate-fadeInUp group relative bg-cover bg-center"
              style={{ 
                animationDelay: `${i * 0.05}s`, 
                animationFillMode: 'both',
                backgroundImage: course.imagem_url 
                  ? `linear-gradient(to bottom, rgba(13, 17, 23, 0.8), rgba(13, 17, 23, 1)), url(${course.imagem_url})` 
                  : 'none'
              }}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Conteúdo do Card */}
              <div className="p-6 flex-1 flex flex-col relative z-10">
                {/* Topo: Ícone + Badges */}
                <div className="flex items-start justify-between mb-5">
                  {/* Ícone */}
                  <div className="w-12 h-12 rounded-xl border border-army-green-light/40 bg-army-green/10 flex items-center justify-center text-army-green-light text-2xl shadow-[0_0_15px_rgba(45,120,40,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(45,120,40,0.3)] transition-all duration-300">
                    <IconComp />
                  </div>

                  {/* Badges empilhados */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-[3px] rounded border border-[#2a4a3a] text-[#5ba870] bg-[#0d1f15]">
                      Disponível
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-[3px] rounded border border-[#4a4020] text-gold bg-[#1a1608]">
                      Básico
                    </span>
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-[15px] font-black text-gray-100 mb-2 leading-snug">
                  {course.nome}
                </h3>

                {/* Descrição */}
                <p className="text-[11px] text-gray-500 leading-relaxed mb-5 line-clamp-2 flex-grow">
                  {course.descricao}
                </p>

                {/* Pills de Info */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 bg-[#151d28] border border-[#1c2533] rounded-full px-3 py-1">
                    <MdAccessTime className="text-gold text-xs" />
                    {horas}h
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 bg-[#151d28] border border-[#1c2533] rounded-full px-3 py-1">
                    <MdViewModule className="text-gray-500 text-xs" />
                    {modulos} Módulos
                  </span>
                </div>

                {/* Progresso */}
                <div className="mb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Progresso
                    </span>
                    <span className="text-[10px] font-bold text-gold">
                      0%
                    </span>
                  </div>
                  <div className="w-full bg-[#1c2533] rounded-full h-1">
                    <div className="bg-army-green-light h-1 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>

              {/* Botão Acessar Curso */}
              <button
                onClick={() => navigate(`/militar/cursos/${course.id}`)}
                className="w-full py-4 bg-gradient-to-r from-army-green to-army-green-light border-t border-army-green-light/30 text-[12px] font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:from-army-green-light hover:to-green-500 hover:shadow-[0_0_20px_rgba(45,120,40,0.4)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative z-10"
              >
                <MdPlayArrow className="text-base" />
                Acessar Curso
              </button>
            </div>
          );
        })}
      </div>

      {/* Estado vazio */}
      {courses.length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <MdSchool className="text-5xl mx-auto mb-3 text-gray-700" />
          <p className="font-medium">Nenhum curso disponível no momento.</p>
        </div>
      )}
    </div>
  );
}
