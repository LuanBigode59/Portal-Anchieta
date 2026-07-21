import { forwardRef } from 'react';

const CertificateTemplate = forwardRef(function CertificateTemplate(
  { militarNome, militarPatente, cursoNome, cargaHoraria, nota, instrutor, data, codigo },
  ref
) {
  const rankAndName = militarPatente ? `${militarPatente} ${militarNome}` : (militarNome || 'NOME DO ALUNO');
  const instrutorName = instrutor || 'NOME DO INSTRUTOR';
  
  return (
    <div
      ref={ref}
      style={{
        width: '1040px',
        height: '736px',
        fontFamily: "'Inter', 'Arial', sans-serif",
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundImage: 'url(/cert-template.jpg)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#111'
      }}
    >
      {/* NOME DO ALUNO (Box superior, acima da primeira linha) */}
      <div style={{
        position: 'absolute',
        top: '325px', // Aproximadamente acima da primeira linha
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '32px',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: '#111'
      }}>
        {rankAndName}
      </div>

      {/* NOME DO CURSO (Box central, acima da segunda linha) */}
      <div style={{
        position: 'absolute',
        top: '410px', // Aproximadamente acima da linha com setas douradas
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '26px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#111'
      }}>
        {cursoNome || 'CURSO DE ESPECIALIZAÇÃO'}
      </div>

      {/* ASSINATURA/NOME INSTRUTOR (Esquerda Inferior) */}
      <div style={{
        position: 'absolute',
        bottom: '135px', // Ajustado para ficar exatamente sobre a linha preta
        left: '190px',
        width: '260px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#111'
      }}>
        {instrutorName}
      </div>

      {/* ASSINATURA/NOME ALUNO (Direita Inferior) */}
      <div style={{
        position: 'absolute',
        bottom: '135px', // Ajustado para ficar exatamente sobre a linha preta
        right: '185px',
        width: '260px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#111'
      }}>
        {rankAndName}
      </div>

      {/* DADOS DE EMISSÃO E VALIDAÇÃO */}
      <div style={{
        position: 'absolute', 
        bottom: '25px', 
        right: '35px',
        fontSize: '10px', 
        color: '#555', 
        textAlign: 'right'
      }}>
        Emissão: {data || new Date().toLocaleDateString('pt-BR')}<br/>
        Validação: {codigo || 'CHQ-000000'}
      </div>
    </div>
  );
});

export default CertificateTemplate;
