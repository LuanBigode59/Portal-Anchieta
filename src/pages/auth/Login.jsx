import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import { GiMilitaryFort } from 'react-icons/gi';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(cpf, senha);
      } else {
        await register(cpf, senha, nome || 'Efetivo', whatsapp);
      }
      navigate('/militar/dashboard');
    } catch (err) {
      console.error("Login/Register error:", err);
      let errMsg = err?.message || 'Erro desconhecido';
      if (errMsg === '{}') {
        errMsg = 'Erro na comunicação com o servidor. Verifique os dados ou tente novamente.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mil-black military-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#141414] opacity-90" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-army-green/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-[420px] relative z-10 animate-slideUp">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gold text-sm mb-6 transition-colors">
          <MdArrowBack /> Voltar ao Portal
        </Link>

        {/* Main Card */}
        <div className="bg-mil-dark/90 backdrop-blur-sm border border-army-green/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(45,90,30,0.15)] relative">
          <div className="h-1.5 w-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

          <div className="px-8 pt-8 pb-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-mil-dark/50 shadow-gold animate-pulse-slow p-2 relative z-10 border border-gold/30">
                  <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-gold text-4xl drop-shadow-[0_0_10px_rgba(201,168,76,0.6)]" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full border border-gold/20 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <h1 className="text-gold font-black text-sm tracking-[2px] uppercase text-center">Portal Oficial</h1>
              <p className="text-gold-light/80 text-[9px] tracking-[3px] uppercase mt-1 mb-2 text-center">Acesso Militar</p>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-army-green to-transparent my-2" />
              <h2 className="text-gray-200 font-bold text-base tracking-[2px] text-center mt-1">2º BP CHOQUE</h2>
              <p className="text-army-green-light font-semibold text-[10px] tracking-[4px] uppercase mt-0.5 text-center">Anchieta</p>
            </div>

            {/* Toggle */}
            <div className="flex bg-mil-black rounded-lg p-1 mb-6 border border-mil-border">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${isLogin ? 'bg-army-green text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => { setIsLogin(true); setError(''); }}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${!isLogin ? 'bg-army-green text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => { setIsLogin(false); setError(''); }}
              >
                Cadastro
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 bg-danger/20 border border-danger/50 rounded-lg text-danger-light text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <span className="w-2 h-2 rounded-full bg-danger-light animate-pulse flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Matrícula (Passaporte / CPF)
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="0000"
                  className="mil-input"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Senha Operacional
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="mil-input pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Nome do Personagem
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Sd. Silva"
                    className="mil-input"
                    required={!isLogin}
                  />
                </div>
              )}

              {!isLogin && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    WhatsApp (Obrigatório) *
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="mil-input"
                    required={!isLogin}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-army-green-dark via-army-green to-army-green-dark hover:from-army-green hover:to-army-green text-white py-3.5 rounded-lg font-black text-xs tracking-[2px] uppercase shadow-[0_0_15px_rgba(45,90,30,0.4)] transition-all duration-300 disabled:opacity-50 border border-army-green-light/50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  isLogin ? 'Entrar na Central' : 'Solicitar Alistamento'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[9px] text-gray-600 mt-4 font-mono">
          © 2026 PMESP — ACESSO RESTRITO
        </p>
      </div>
    </div>
  );
}
