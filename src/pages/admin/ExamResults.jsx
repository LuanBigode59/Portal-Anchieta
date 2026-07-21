import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { examService } from '../../services/examService';
import { MdAssignment, MdCheckCircle, MdCancel, MdClose, MdVisibility } from 'react-icons/md';
import { cargoBadgeClass, cargoLabels } from '../../data/ranks';

export default function ExamResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await examService.getAllDetailedResults();
        setResults(data);
      } catch (err) {
        console.error("Erro ao carregar resultados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openDetails = (res) => {
    setSelectedResult(res);
  };

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="RESULTADO DE PROVAS" subtitle="Análise detalhada do desempenho do efetivo" />
      
      <div className="hero-card p-6 mt-6 border border-gray-800">
        {loading ? (
          <div className="flex justify-center p-10"><div className="spinner" /></div>
        ) : results.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Nenhum resultado encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mil-table w-full text-left">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Militar</th>
                  <th>Prova</th>
                  <th className="text-center">Tentativa</th>
                  <th className="text-center">Nota</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.id} className="hover:bg-mil-black/50 transition-colors">
                    <td className="text-xs text-gray-400">
                      {new Date(res.created_at).toLocaleDateString('pt-BR')} {new Date(res.created_at).toLocaleTimeString('pt-BR')}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${cargoBadgeClass[res.profiles?.patente] || 'badge-gray'}`}>
                          {cargoLabels[res.profiles?.patente] || res.profiles?.patente}
                        </span>
                        <span className="font-bold text-gray-200">{res.profiles?.nome}</span>
                      </div>
                    </td>
                    <td className="font-medium text-gray-300">{res.provas?.titulo}</td>
                    <td className="text-center font-mono text-gray-400">{res.tentativa_num}º</td>
                    <td className="text-center font-mono font-bold">
                      <span className={res.nota >= 70 ? 'text-green-500' : 'text-red-500'}>{res.nota}</span>
                    </td>
                    <td className="text-center">
                      {res.aprovado ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full uppercase tracking-widest font-bold">
                          <MdCheckCircle /> Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded-full uppercase tracking-widest font-bold">
                          <MdCancel /> Reprovado
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <button 
                        onClick={() => openDetails(res)}
                        className="btn-secondary !p-1.5 inline-flex items-center"
                        title="Ver Respostas"
                      >
                        <MdVisibility className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <MdAssignment className="text-gold" />
                  Detalhes da Prova
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedResult.profiles?.patente} {selectedResult.profiles?.nome} — {selectedResult.provas?.titulo}
                </p>
              </div>
              <button 
                onClick={() => setSelectedResult(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-mil-black border border-gray-800 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Nota Final</p>
                  <p className={`text-3xl font-black ${selectedResult.nota >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedResult.nota}
                  </p>
                </div>
                <div className="bg-mil-black border border-gray-800 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
                  <p className={`text-xl font-black mt-1 ${selectedResult.aprovado ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedResult.aprovado ? 'APROVADO' : 'REPROVADO'}
                  </p>
                </div>
                <div className="bg-mil-black border border-gray-800 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Tentativa</p>
                  <p className="text-xl font-black text-gray-300 mt-1">{selectedResult.tentativa_num}º</p>
                </div>
                <div className="bg-mil-black border border-gray-800 p-4 rounded-xl text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Data</p>
                  <p className="text-sm font-bold text-gray-300 mt-2">
                    {new Date(selectedResult.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-gold uppercase tracking-widest mb-4">Gabarito e Respostas</h4>
              
              <div className="space-y-4">
                {selectedResult.provas?.perguntas ? selectedResult.provas.perguntas.map((pergunta, index) => {
                  const userAnsIndex = selectedResult.respostas_usuario?.[index];
                  const isCorrect = userAnsIndex === pergunta.corretaIndex;
                  const isBlank = userAnsIndex === undefined || userAnsIndex === null;

                  return (
                    <div key={index} className={`p-4 rounded-xl border ${isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {isCorrect ? <MdCheckCircle className="text-green-500 text-xl" /> : <MdCancel className="text-red-500 text-xl" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-200 mb-3">{index + 1}. {pergunta.enunciado}</p>
                          
                          <div className="space-y-2">
                            {pergunta.opcoes?.map((opcao, optIndex) => {
                              const isThisUserAns = userAnsIndex === optIndex;
                              const isThisCorrectAns = pergunta.corretaIndex === optIndex;
                              
                              let badge = null;
                              if (isThisCorrectAns) {
                                badge = <span className="ml-2 text-[10px] bg-green-500 text-black px-2 py-0.5 rounded font-bold uppercase">Gabarito</span>;
                              } else if (isThisUserAns && !isCorrect) {
                                badge = <span className="ml-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase">Sua Resposta</span>;
                              }

                              return (
                                <div key={optIndex} className={`p-2 rounded flex items-center ${isThisCorrectAns ? 'bg-green-500/10 border border-green-500/30' : isThisUserAns ? 'bg-red-500/10 border border-red-500/30' : 'bg-black/20 text-gray-500'}`}>
                                  <span className="w-6 h-6 rounded bg-black/40 flex items-center justify-center text-xs font-bold mr-3 border border-gray-800">
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <span className={`text-sm ${isThisCorrectAns ? 'text-green-400 font-bold' : isThisUserAns ? 'text-red-400' : ''}`}>
                                    {opcao}
                                  </span>
                                  {badge}
                                </div>
                              );
                            })}
                          </div>
                          
                          {isBlank && (
                            <p className="text-xs text-red-500 mt-3 font-bold uppercase">⚠️ Questão deixada em branco (Considerada Errada)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center p-6 text-gray-500">Gabarito detalhado não disponível para esta prova (formato antigo).</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
