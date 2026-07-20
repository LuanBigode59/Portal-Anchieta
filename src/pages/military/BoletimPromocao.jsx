import { useState, useEffect } from 'react';
import Topbar from '../../components/layout/Topbar';
import { MdAssignment, MdContentCopy, MdPictureAsPdf, MdCleaningServices, MdImage } from 'react-icons/md';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { cargoLabels } from '../../data/ranks';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function BoletimPromocao() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    numero: '',
    data: new Date().toISOString().split('T')[0], // yyyy-mm-dd
    responsavel: 'Tenente Coronel Luan Bigode',
    assinatura: 'Luan Bigode',
    militarNome: '',
    militarId: '',
    graduacaoAtual: '',
    novaGraduacao: ''
  });

  useEffect(() => {
    // Load cursive font for canvas rendering
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Initial number
    const lastNum = localStorage.getItem('last_boletim_number');
    setFormData(prev => ({ ...prev, numero: lastNum ? parseInt(lastNum) + 1 : 29 }));

    // Load users
    userService.getAllUsers().then(data => {
      setUsers(data.filter(u => u.status !== 'Exonerado'));
    }).catch(console.error);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '[Data]';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const generatedText = `BOLETIM INTERNO DE PROMOÇÃO
2BP CHOQUE ANCHIETA — ELITE SP

BOLETIM Nº ${formData.numero || '[Nº]'}/${new Date().getFullYear()}

Assunto: Promoção de Militar
Data: ${formatDate(formData.data)}
Origem: Comando do 2BP Choque Anchieta
Responsável: ${formData.responsavel || '[Responsável]'}

O Comando do 2BP Choque Anchieta, no uso de suas atribuições internas, torna pública a promoção abaixo, após avaliação de conduta, disciplina, presença em serviço, respeito à hierarquia, desempenho operacional e comprometimento com o batalhão.

I — MILITAR PROMOVIDO

Nome: ${formData.militarNome || '[Nome]'}
Passaporte: ${formData.militarId || '[ID]'}
Graduação atual: ${formData.graduacaoAtual || '[Atual]'}
Nova graduação: ${formData.novaGraduacao || '[Nova]'}
Data da promoção: ${formatDate(formData.data)}

II — FUNDAMENTO DA PROMOÇÃO

A promoção é concedida por mérito interno, em reconhecimento aos serviços prestados, postura militar, lealdade institucional, responsabilidade, preparo operacional e evolução dentro da tropa.

III — DETERMINAÇÃO DO COMANDO

A partir desta publicação, o militar passa a ocupar oficialmente a nova graduação, devendo manter conduta exemplar, cumprir as determinações do comando, auxiliar a tropa e preservar os princípios de hierarquia, disciplina e respeito.

IV — OBSERVAÇÃO DISCIPLINAR

O Comando reforça que toda promoção representa reconhecimento, mas também maior responsabilidade. Qualquer conduta incompatível poderá resultar em reavaliação ou medidas internas cabíveis.

V — PUBLICAÇÃO

Publique-se nos canais oficiais do 2BP Choque Anchieta, para ciência da tropa e registro interno.

Quartel do 2BP Choque Anchieta — Elite SP
Data: ${formatDate(formData.data)}

${formData.responsavel || '[Responsável]'}

Assinatura: _______________________________________`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    sendNotification('Boletim copiado para a área de transferência!', 'sucesso');
  };

  const handleClear = () => {
    setFormData({
      numero: '',
      data: new Date().toISOString().split('T')[0],
      responsavel: 'Tenente Coronel Luan Bigode',
      assinatura: 'Luan Bigode',
      militarNome: '',
      militarId: '',
      graduacaoAtual: '',
      novaGraduacao: ''
    });
  };

  const createSignatureImage = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.font = '700 48px "Dancing Script", cursive';
    ctx.fillStyle = '#C9A84C'; // Gold color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 300, 75);
    return canvas.toDataURL('image/png');
  };

  const generatePDF = () => {
    if (!formData.numero || !formData.militarNome || !formData.novaGraduacao) {
      sendNotification("Preencha os campos obrigatórios (Nº, Nome, Nova Graduação)!", "aviso");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Papel de Fundo Militar
      doc.setFillColor(20, 20, 20);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Borda Gold
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);

      // Cabeçalho PMESP
      doc.setFont("helvetica", "bold");
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(14);
      doc.text("BOLETIM INTERNO DE PROMOÇÃO", 105, 25, { align: "center" });
      doc.setFontSize(11);
      doc.text("2º BATALHÃO DE POLÍCIA DE CHOQUE ANCHIETA — ELITE SP", 105, 32, { align: "center" });
      
      doc.setDrawColor(40, 40, 40);
      doc.line(15, 38, 195, 38);

      // Metadados
      doc.setTextColor(220, 220, 220);
      doc.setFontSize(10);
      doc.text(`BOLETIM Nº ${formData.numero}/${new Date().getFullYear()}`, 20, 48);
      doc.text(`Assunto: Promoção de Militar`, 20, 54);
      doc.text(`Data: ${formatDate(formData.data)}`, 20, 60);
      doc.text(`Origem: Comando do 2º BP Choque Anchieta`, 20, 66);
      doc.text(`Responsável: ${formData.responsavel}`, 20, 72);

      let y = 80;
      
      // Parágrafo introdutório
      doc.setFont("helvetica", "normal");
      const intro = doc.splitTextToSize("O Comando do 2º BP Choque Anchieta, no uso de suas atribuições internas, torna pública a promoção abaixo, após avaliação de conduta, disciplina, presença em serviço, respeito à hierarquia, desempenho operacional e comprometimento com o batalhão.", 170);
      doc.text(intro, 20, y);
      y += (intro.length * 5) + 4;

      const addSection = (title, contentLines) => {
        if (y > 275) { doc.addPage(); doc.setFillColor(20, 20, 20); doc.rect(0, 0, 210, 297, 'F'); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 277); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(201, 168, 76);
        doc.text(title, 20, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(220, 220, 220);
        contentLines.forEach(line => {
          if (y > 280) { doc.addPage(); doc.setFillColor(20, 20, 20); doc.rect(0, 0, 210, 297, 'F'); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 277); y = 20; }
          const split = doc.splitTextToSize(line, 170);
          doc.text(split, 20, y);
          y += (split.length * 4.5);
        });
        y += 3;
      };

      addSection("I — MILITAR PROMOVIDO", [
        `Nome: ${formData.militarNome}`,
        `Passaporte: ${formData.militarId}`,
        `Graduação atual: ${formData.graduacaoAtual}`,
        `Nova graduação: ${formData.novaGraduacao}`,
        `Data da promoção: ${formatDate(formData.data)}`
      ]);

      addSection("II — FUNDAMENTO DA PROMOÇÃO", [
        "A promoção é concedida por mérito interno, em reconhecimento aos serviços prestados, postura militar, lealdade institucional, responsabilidade, preparo operacional e evolução dentro da tropa."
      ]);

      addSection("III — DETERMINAÇÃO DO COMANDO", [
        "A partir desta publicação, o militar passa a ocupar oficialmente a nova graduação, devendo manter conduta exemplar, cumprir as determinações do comando, auxiliar a tropa e preservar os princípios de hierarquia, disciplina e respeito."
      ]);

      addSection("IV — OBSERVAÇÃO DISCIPLINAR", [
        "O Comando reforça que toda promoção representa reconhecimento, mas também maior responsabilidade. Qualquer conduta incompatível poderá resultar em reavaliação ou medidas internas cabíveis."
      ]);

      addSection("V — PUBLICAÇÃO", [
        "Publique-se nos canais oficiais do 2º BP Choque Anchieta, para ciência da tropa e registro interno.",
        "",
        "Quartel do 2º BP Choque Anchieta — Elite SP",
        `Data: ${formatDate(formData.data)}`
      ]);

      // Assinatura Militar do Rodapé
      if (y > 255) {
        doc.addPage(); doc.setFillColor(20, 20, 20); doc.rect(0, 0, 210, 297, 'F'); doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.rect(10, 10, 190, 277); y = 30;
      }

      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(201, 168, 76);
      doc.text("✯✯✯✯ | Comando Geral", 105, y, { align: "center" });
      doc.text(formData.responsavel.toUpperCase(), 105, y + 5, { align: "center" });
      
      // Linha de assinatura
      doc.setDrawColor(100, 100, 100);
      doc.line(60, y + 25, 150, y + 25);
      doc.setTextColor(150, 150, 150);
      doc.text("Assinatura:", 40, y + 25);

      // Gerar assinatura manuscrita em Canvas e adicionar
      const sigData = createSignatureImage(formData.assinatura);
      doc.addImage(sigData, 'PNG', 65, y + 5, 80, 20);

      // Rodapé Oficial
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont("courier", "normal");
      doc.text(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 283);

      doc.save(`Boletim_Promocao_${formData.numero}.pdf`);
      localStorage.setItem('last_boletim_number', formData.numero);
      sendNotification("PDF do Boletim de Promoção baixado!", "sucesso");
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao gerar PDF", "erro");
    }
  };

  const generatePNG = async () => {
    if (!formData.numero || !formData.militarNome || !formData.novaGraduacao) {
      sendNotification("Preencha os campos obrigatórios!", "aviso");
      return;
    }
    const element = document.getElementById('boletim-print-view');
    if (!element) return;
    
    element.style.display = 'block';
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#141414',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Boletim_Promocao_${formData.numero}.png`;
      link.click();
      localStorage.setItem('last_boletim_number', formData.numero);
      sendNotification("PNG do Boletim baixado!", "sucesso");
    } catch (err) {
      console.error(err);
      sendNotification("Erro ao gerar PNG", "erro");
    } finally {
      element.style.display = 'none';
    }
  };

  const handleSelectPatenteAtual = (e) => setFormData({...formData, graduacaoAtual: e.target.value});
  const handleSelectNovaPatente = (e) => setFormData({...formData, novaGraduacao: e.target.value});
  
  const handleSelectMilitar = (e) => {
    const userId = e.target.value;
    if (!userId) {
      setFormData(prev => ({...prev, militarNome: '', militarId: '', graduacaoAtual: ''}));
      return;
    }
    const u = users.find(x => x.id === userId);
    if (u) {
      setFormData(prev => ({
        ...prev, 
        militarNome: u.nome, 
        militarId: u.cpf || '',
        graduacaoAtual: cargoLabels[u.cargo] || u.cargo
      }));
    }
  };

  const patentes = [
    "Recruta", "Soldado", "Cabo", "3º Sargento", "2º Sargento", "1º Sargento", 
    "Subtenente", "2º Tenente", "1º Tenente", "Capitão", "Major", "Tenente Coronel", "Coronel"
  ];

  return (
    <div className="animate-fadeIn pb-10">
      <Topbar title="BOLETIM DE PROMOÇÃO" subtitle="Geração Automática de Boletins Internos" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Painel Esquerdo: Formulário */}
        <div className="bg-mil-dark border border-gray-800 rounded-xl p-5 shadow-2xl relative">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-3">
            <MdAssignment className="text-gold text-xl" />
            <h2 className="text-white font-black tracking-widest uppercase text-sm">Dados do Boletim</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nº do Boletim *</label>
                <input type="text" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} className="mil-input" placeholder="Ex: 001" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Data *</label>
                <input type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} className="mil-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Responsável (Impresso) *</label>
                <input type="text" value={formData.responsavel} onChange={e => setFormData({ ...formData, responsavel: e.target.value })} className="mil-input" placeholder="Ex: Tenente Coronel Luan Bigode" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assinatura (Manuscrita) *</label>
                <input type="text" value={formData.assinatura} onChange={e => setFormData({ ...formData, assinatura: e.target.value })} className="mil-input" placeholder="Ex: Luan Bigode" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome do Militar Promovido *</label>
              <select onChange={handleSelectMilitar} className="mil-input">
                <option value="">Selecione um militar...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} ({cargoLabels[u.cargo] || u.cargo})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Passaporte/ID</label>
                <input type="text" value={formData.militarId} disabled className="mil-input opacity-70 cursor-not-allowed" placeholder="ID" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Grad. Atual *</label>
                <select value={formData.graduacaoAtual} disabled className="mil-input opacity-70 cursor-not-allowed">
                  <option value={formData.graduacaoAtual}>{formData.graduacaoAtual || 'Selecione...'}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nova Grad. *</label>
                <select value={formData.novaGraduacao} onChange={handleSelectNovaPatente} className="mil-input">
                  <option value="">Selecione...</option>
                  {patentes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={handleClear} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <MdCleaningServices /> Limpar
            </button>
          </div>
        </div>

        {/* Painel Direito: Resultado */}
        <div className="bg-mil-dark border border-gray-800 rounded-xl p-5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
            <h2 className="text-white font-black tracking-widest uppercase text-sm">Resultado Gerado</h2>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="btn-secondary !py-1.5 !px-3 !text-[10px] flex items-center gap-1">
                <MdContentCopy /> Copiar Texto
              </button>
              <button onClick={generatePNG} className="btn-outline-gold !py-1.5 !px-3 !text-[10px] flex items-center gap-1">
                <MdImage /> Gerar PNG
              </button>
              <button onClick={generatePDF} className="btn-gold !py-1.5 !px-3 !text-[10px] flex items-center gap-1">
                <MdPictureAsPdf /> Baixar PDF
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#151a15] rounded-lg p-4 font-mono text-xs text-green-500 overflow-y-auto whitespace-pre-wrap border border-gray-800 shadow-inner max-h-[500px]">
            {generatedText}
          </div>
        </div>

      </div>

      {/* Hidden Print View for PNG Export */}
      <div 
        id="boletim-print-view" 
        style={{ 
          display: 'none', 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          width: '794px',
          height: '1123px',
          backgroundColor: '#141414',
          padding: '40px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          color: '#dcdcdc',
          boxSizing: 'border-box',
          zIndex: -1
        }}
      >
        <div style={{ border: '2px solid #C9A84C', height: '100%', padding: '40px', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>BOLETIM INTERNO DE PROMOÇÃO</h1>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#C9A84C' }}>2º BATALHÃO DE POLÍCIA DE CHOQUE ANCHIETA — ELITE SP</h2>
            <div style={{ borderBottom: '1px solid #404040', margin: '15px 0' }}></div>
          </div>

          <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
            <p style={{ margin: '4px 0' }}>BOLETIM Nº {formData.numero || '[Nº]'}/{new Date().getFullYear()}</p>
            <p style={{ margin: '4px 0' }}>Assunto: Promoção de Militar</p>
            <p style={{ margin: '4px 0' }}>Data: {formatDate(formData.data)}</p>
            <p style={{ margin: '4px 0' }}>Origem: Comando do 2º BP Choque Anchieta</p>
            <p style={{ margin: '4px 0' }}>Responsável: {formData.responsavel}</p>
          </div>

          <p style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
            O Comando do 2º BP Choque Anchieta, no uso de suas atribuições internas, torna pública a promoção abaixo, após avaliação de conduta, disciplina, presença em serviço, respeito à hierarquia, desempenho operacional e comprometimento com o batalhão.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#C9A84C', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>I — MILITAR PROMOVIDO</h3>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Nome: {formData.militarNome || '[Nome]'}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Passaporte: {formData.militarId || '[ID]'}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Graduação atual: {formData.graduacaoAtual || '[Atual]'}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Nova graduação: {formData.novaGraduacao || '[Nova]'}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Data da promoção: {formatDate(formData.data)}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#C9A84C', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>II — FUNDAMENTO DA PROMOÇÃO</h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>A promoção é concedida por mérito interno, em reconhecimento aos serviços prestados, postura militar, lealdade institucional, responsabilidade, preparo operacional e evolução dentro da tropa.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#C9A84C', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>III — DETERMINAÇÃO DO COMANDO</h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>A partir desta publicação, o militar passa a ocupar oficialmente a nova graduação, devendo manter conduta exemplar, cumprir as determinações do comando, auxiliar a tropa e preservar os princípios de hierarquia, disciplina e respeito.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#C9A84C', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>IV — OBSERVAÇÃO DISCIPLINAR</h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>O Comando reforça que toda promoção representa reconhecimento, mas também maior responsabilidade. Qualquer conduta incompatível poderá resultar em reavaliação ou medidas internas cabíveis.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#C9A84C', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>V — PUBLICAÇÃO</h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', lineHeight: '1.5' }}>Publique-se nos canais oficiais do 2º BP Choque Anchieta, para ciência da tropa e registro interno.</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Quartel do 2º BP Choque Anchieta — Elite SP</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>Data: {formatDate(formData.data)}</p>
          </div>

          <div style={{ textAlign: 'center', position: 'absolute', bottom: '40px', left: '0', right: '0' }}>
            <p style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '14px', margin: '0 0 5px 0' }}>✯✯✯✯ | Comando Geral</p>
            <p style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '14px', margin: '0' }}>{formData.responsavel.toUpperCase()}</p>
            
            <div style={{ position: 'relative', width: '300px', margin: '40px auto 0 auto' }}>
              <img src={createSignatureImage(formData.assinatura)} alt="Assinatura" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '50px', objectFit: 'contain' }} />
              <div style={{ borderTop: '1px solid #666', paddingTop: '5px', color: '#999', fontSize: '12px' }}>Assinatura</div>
            </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: '20px', left: '40px', fontSize: '10px', color: '#666', fontFamily: 'monospace' }}>
            Documento gerado em: {new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
}
