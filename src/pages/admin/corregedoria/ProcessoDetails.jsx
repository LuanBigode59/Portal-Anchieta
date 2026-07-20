import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdGavel, MdPerson, MdAssignment, MdImage, MdVideocam,
  MdHistory, MdDownload, MdPictureAsPdf, MdOutlineAddBox
} from 'react-icons/md';

const mockProcesso = {
  id: 'IPM-2026/04',
  tipo: 'Inquérito Policial Militar',
  status: 'Em Investigação',
  dataAbertura: '2026-07-10',
  militar: 'Sd. Lucas Oliveira',
  denunciante: 'Anônimo',
  responsavel: 'Maj. Silva',
  descricao: 'Denúncia de conduta inadequada durante patrulhamento na Zona Norte. Foi reportado uso excessivo da força durante abordagem de rotina a veículo suspeito.',
  anexos: [
    { id: 1, name: 'B.O. 4452/2026.pdf', type: 'pdf', size: '2.4 MB' },
    { id: 2, name: 'Foto_Viatura_Danos.jpg', type: 'image', size: '1.1 MB' },
  ],
  videos: [
    { id: 1, name: 'Bodycam_Soldado.mp4', duration: '12:45' }
  ],
  movimentacoes: [
    { data: '2026-07-10 14:30', titulo: 'Abertura de IPM', desc: 'Processo instaurado pelo Comando Geral.', user: 'Cel. Luan' },
    { data: '2026-07-11 09:00', titulo: 'Designação de Responsável', desc: 'Major Silva designado para conduzir as investigações.', user: 'Sistema' },
    { data: '2026-07-13 16:45', titulo: 'Depoimento Anexado', desc: 'Depoimento do Sd. Lucas Oliveira colhido e anexado aos autos.', user: 'Maj. Silva' },
  ]
};

export default function ProcessoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('detalhes');

  return (
    <div className="animate-fadeIn pb-10 max-w-5xl mx-auto">
      
      {/* Botão voltar */}
      <button 
        onClick={() => navigate('/corregedoria/processos')}
        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors mb-6 text-xs font-bold uppercase tracking-widest"
      >
        <MdArrowBack className="text-lg" /> Voltar para Processos
      </button>

      {/* Header Processo */}
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MdGavel className="text-9xl text-red-500" />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white">{mockProcesso.id}</h1>
              <span className="bg-red-900/20 text-red-500 border border-red-900/50 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">
                {mockProcesso.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 font-bold">{mockProcesso.tipo}</p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded text-[10px] uppercase tracking-widest text-gray-300 hover:bg-[#111] hover:text-white transition-all">
              <MdPictureAsPdf className="text-lg text-red-400" /> Gerar PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-900 text-white rounded text-[10px] uppercase tracking-widest font-bold hover:bg-red-800 transition-all">
              Nova Movimentação
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        {[
          { id: 'detalhes', label: 'Autos do Processo', icon: <MdAssignment /> },
          { id: 'midias', label: 'Provas e Mídias', icon: <MdVideocam /> },
          { id: 'timeline', label: 'Linha do Tempo', icon: <MdHistory /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-red-500 text-red-500' 
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 min-h-[400px]">
        
        {/* DETALHES */}
        {activeTab === 'detalhes' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#111] border border-gray-800 rounded-lg">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Investigado</p>
                <p className="text-sm text-gray-200 font-bold flex items-center gap-2"><MdPerson className="text-gray-500" /> {mockProcesso.militar}</p>
              </div>
              <div className="p-4 bg-[#111] border border-gray-800 rounded-lg">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Denunciante</p>
                <p className="text-sm text-gray-200 font-bold">{mockProcesso.denunciante}</p>
              </div>
              <div className="p-4 bg-[#111] border border-gray-800 rounded-lg">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Responsável</p>
                <p className="text-sm text-gray-200 font-bold">{mockProcesso.responsavel}</p>
              </div>
              <div className="p-4 bg-[#111] border border-gray-800 rounded-lg">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Data de Abertura</p>
                <p className="text-sm text-gray-200 font-bold font-mono">{mockProcesso.dataAbertura}</p>
              </div>
            </div>

            <div className="p-5 bg-[#111] border border-gray-800 rounded-lg">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">
                Fato Gerador / Descrição
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {mockProcesso.descricao}
              </p>
            </div>
            
            <div className="p-5 border border-red-900/30 bg-red-950/10 rounded-lg">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-3">Conclusão / Parecer</h3>
              <p className="text-sm text-gray-500 italic">O processo ainda encontra-se em fase de instrução e apuração de provas. Parecer pendente.</p>
            </div>
          </div>
        )}

        {/* MÍDIAS */}
        {activeTab === 'midias' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Documentos e Provas</h3>
              <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-900/50 px-3 py-1.5 rounded hover:bg-red-900/20">
                <MdOutlineAddBox className="text-base" /> Anexar Arquivo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockProcesso.anexos.map(anexo => (
                <div key={anexo.id} className="flex items-center gap-4 p-4 bg-[#111] border border-gray-800 rounded-lg group hover:border-gray-600 transition-colors">
                  <div className={`text-3xl ${anexo.type === 'pdf' ? 'text-red-400' : 'text-blue-400'}`}>
                    {anexo.type === 'pdf' ? <MdPictureAsPdf /> : <MdImage />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 truncate">{anexo.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{anexo.size}</p>
                  </div>
                  <button className="text-gray-500 hover:text-white p-2">
                    <MdDownload className="text-xl" />
                  </button>
                </div>
              ))}
              
              {mockProcesso.videos.map(video => (
                <div key={`v-${video.id}`} className="flex items-center gap-4 p-4 bg-[#111] border border-gray-800 rounded-lg group hover:border-gray-600 transition-colors">
                  <div className="text-3xl text-purple-400">
                    <MdVideocam />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 truncate">{video.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{video.duration}</p>
                  </div>
                  <button className="text-gray-500 hover:text-white p-2">
                    <MdDownload className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="animate-fadeIn p-4">
            <div className="relative border-l-2 border-red-900/50 pl-6 space-y-8 ml-2">
              {mockProcesso.movimentacoes.map((mov, i) => (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  
                  <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2 border-b border-gray-800 pb-2">
                      <div>
                        <h4 className="text-sm font-bold text-red-400">{mov.titulo}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">{mov.data}</p>
                      </div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded">
                        <MdPerson className="inline mr-1" /> {mov.user}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {mov.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
