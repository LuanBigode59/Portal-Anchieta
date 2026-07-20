import { useState } from 'react';
import { MdSend, MdCheckCircle } from 'react-icons/md';
import { GiMilitaryFort } from 'react-icons/gi';

export default function Recruitment() {
  const [formData, setFormData] = useState({
    nomeRp: '', id: '', discord: '', steam: '',
    experiencia: '', cidadeAnterior: '', disponibilidade: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1500));
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center animate-scaleIn max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-army-green/20 border-2 border-army-green flex items-center justify-center mb-6">
            <MdCheckCircle className="text-army-green-light text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Formulário Enviado!</h2>
          <p className="text-gray-400 mb-6">
            Sua solicitação de recrutamento foi recebida com sucesso. 
            Aguarde contato do comando pelo Discord.
          </p>
          <span className="badge-green !text-xs !px-4 !py-2">Protocolo: #REC-{Date.now().toString(36).toUpperCase()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mil-dark border-2 border-choque-yellow/30 shadow-glow-choque mb-6 animate-float">
            <img src="/logos/logo.png" alt="Logo" className="w-full h-full object-contain text-choque-yellow text-3xl" />
          </div>
          <p className="text-choque-yellow text-xs tracking-[6px] uppercase font-bold mb-3">Alistamento</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            <span className="text-choque-gradient">Recrutamento</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Preencha o formulário abaixo para se candidatar a uma vaga no 2º Batalhão de Polícia de Choque Anchieta.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="hero-card p-6 sm:p-8 animate-fadeInUp">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Nome RP *
              </label>
              <input
                type="text"
                name="nomeRp"
                value={formData.nomeRp}
                onChange={handleChange}
                placeholder="Seu nome completo no RP"
                className="mil-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  ID (Passaporte) *
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="Seu ID no servidor"
                  className="mil-input"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Discord *
                </label>
                <input
                  type="text"
                  name="discord"
                  value={formData.discord}
                  onChange={handleChange}
                  placeholder="usuario#0000"
                  className="mil-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Steam (opcional)
              </label>
              <input
                type="text"
                name="steam"
                value={formData.steam}
                onChange={handleChange}
                placeholder="Link do perfil Steam"
                className="mil-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Experiência Anterior *
              </label>
              <textarea
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                placeholder="Descreva sua experiência em batalhões, corporações ou RP em geral..."
                className="mil-textarea"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Cidade/Corporação Anterior
              </label>
              <input
                type="text"
                name="cidadeAnterior"
                value={formData.cidadeAnterior}
                onChange={handleChange}
                placeholder="De onde você vem?"
                className="mil-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Disponibilidade *
              </label>
              <select
                name="disponibilidade"
                value={formData.disponibilidade}
                onChange={handleChange}
                className="mil-select"
                required
              >
                <option value="">Selecione sua disponibilidade</option>
                <option value="integral">Integral (7 dias/semana)</option>
                <option value="parcial">Parcial (3-5 dias/semana)</option>
                <option value="fins_semana">Fins de Semana</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-mil-border">
            <button
              type="submit"
              disabled={loading}
              className="btn-choque w-full !py-4 !text-sm !tracking-widest uppercase flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <MdSend className="text-lg" /> Enviar Candidatura
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-600 mt-4">
              Ao enviar, você concorda com os termos e regulamentos do batalhão.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
