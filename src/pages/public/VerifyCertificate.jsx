import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import {
  MdVerified, MdSearch, MdClose, MdCardMembership,
  MdCheckCircle, MdError, MdSchool, MdCalendarToday,
  MdStar, MdPerson, MdAccessTime
} from 'react-icons/md';
import { GiMilitaryFort } from 'react-icons/gi';

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-verify if code is in URL
  useEffect(() => {
    if (searchParams.get('code')) {
      handleVerify();
    }
  }, []);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data, error: dbError } = await supabase
        .from('certificados')
        .select('*, cursos(nome, carga_horaria, instrutor), profiles(nome, cargo)')
        .eq('codigo_verificacao', code.trim().toUpperCase())
        .single();

      if (dbError || !data) {
        setError('Certificado não encontrado. Verifique o código e tente novamente.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Erro ao consultar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const RANK_LABELS = {
    tenente_coronel: 'Tenente-Coronel PM',
    major: 'Major PM',
    capitao: 'Capitão PM',
    primeiro_tenente: '1° Tenente PM',
    segundo_tenente: '2° Tenente PM',
    aspirante: 'Aspirante PM',
    subtenente: 'Subtenente PM',
    primeiro_sargento: '1° Sargento PM',
    segundo_sargento: '2° Sargento PM',
    terceiro_sargento: '3° Sargento PM',
    cabo: 'Cabo PM',
    soldado_primeira: 'Soldado 1a Classe PM',
    soldado_segunda: 'Soldado 2a Classe PM',
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-900 bg-mil-dark py-4 px-6 flex items-center gap-3">
        <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-gold text-2xl" />
        <div>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">2º BP CHOQUE ANCHIETA</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Portal de Verificação de Certificados</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-2xl mb-4 border border-gold/20">
              <MdVerified className="text-4xl text-gold" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">
              Verificar Certificado
            </h2>
            <p className="text-xs text-gray-500">
              Insira o código único do certificado para verificar sua autenticidade.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleVerify} className="flex gap-2 mb-8">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="CERT-XXXXXX-XXXXX"
              className="mil-input flex-1 font-mono uppercase tracking-widest text-sm"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-gold !py-2 !px-5 flex items-center gap-2"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <MdSearch className="text-lg" />}
              Verificar
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 mb-4 animate-fadeIn">
              <MdError className="text-red-500 text-2xl flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-green-500/5 border border-green-500/30 rounded-xl overflow-hidden animate-fadeIn">
              {/* Green top banner */}
              <div className="bg-green-500/20 border-b border-green-500/20 px-5 py-3 flex items-center gap-2">
                <MdCheckCircle className="text-green-500 text-xl" />
                <span className="text-sm font-black text-green-400 uppercase tracking-widest">
                  Certificado Válido e Autêntico
                </span>
              </div>

              <div className="p-6 space-y-4">
                {/* Course */}
                <div className="flex items-start gap-3">
                  <MdSchool className="text-gold text-xl mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Curso</p>
                    <p className="text-base font-black text-white">{result.cursos?.nome}</p>
                  </div>
                </div>

                {/* Military */}
                <div className="flex items-start gap-3">
                  <MdPerson className="text-gold text-xl mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Militar</p>
                    <p className="text-base font-black text-white">{result.profiles?.nome}</p>
                    <p className="text-xs text-gray-500">{RANK_LABELS[result.profiles?.cargo] || result.profiles?.cargo}</p>
                  </div>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-3 gap-3">
                  {result.cursos?.carga_horaria && (
                    <div className="bg-mil-black/50 rounded-lg p-3 text-center border border-gray-800">
                      <MdAccessTime className="text-gold text-lg mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest">Carga</p>
                      <p className="text-xs font-bold text-white">{result.cursos.carga_horaria}</p>
                    </div>
                  )}
                  {result.nota && (
                    <div className="bg-mil-black/50 rounded-lg p-3 text-center border border-gray-800">
                      <MdStar className="text-gold text-lg mx-auto mb-1" />
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest">Nota</p>
                      <p className="text-xs font-bold text-gold">{result.nota}/100</p>
                    </div>
                  )}
                  <div className="bg-mil-black/50 rounded-lg p-3 text-center border border-gray-800">
                    <MdCalendarToday className="text-gold text-lg mx-auto mb-1" />
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Data</p>
                    <p className="text-xs font-bold text-white">
                      {result.data_emissao
                        ? new Date(result.data_emissao).toLocaleDateString('pt-BR')
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Code */}
                <div className="bg-mil-black/30 rounded-lg p-3 border border-gray-800">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Código de Verificação</p>
                  <p className="text-xs font-mono text-army-green-light tracking-widest">{result.codigo_verificacao}</p>
                </div>

                {/* Assinatura Comando */}
                <div className="border-t border-gray-800 pt-4 text-center">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Documento homologado por</p>
                  <p className="text-sm font-black text-gold">Ten. Cel. Luan Bigode</p>
                  <p className="text-[10px] text-gray-500">Comando Geral — 2º BP CHOQUE Anchieta</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-900 py-4 text-center text-[10px] text-gray-700 uppercase tracking-widest">
        2º Batalhão de Polícia de Choque Anchieta • Disciplina • Honra • Coragem • Lealdade
      </footer>
    </div>
  );
}
