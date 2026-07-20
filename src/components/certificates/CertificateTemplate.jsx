import { forwardRef } from 'react';

const CertificateTemplate = forwardRef(function CertificateTemplate(
  { militarNome, militarPatente, cursoNome, cargaHoraria, nota, instrutor, data, codigo },
  ref
) {
  // Use a seamless digital camo pattern in base64 (dark green/black/grey)
  const camoPattern = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4FAQLs72YAAAAASUVORK5CYII=`; // Fallback simple noise pattern, enhanced via CSS
  
  // Custom styled component to generate the intricate design
  return (
    <div
      ref={ref}
      style={{
        width: '1040px',
        height: '736px',
        fontFamily: "'Inter', 'Arial', sans-serif",
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        // Camo background (approximated with repeating linear gradients and dark colors)
        backgroundColor: '#0a0a0a',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(20,25,20,0.8) 0%, transparent 20%),
          radial-gradient(circle at 80% 90%, rgba(15,20,15,0.8) 0%, transparent 20%),
          radial-gradient(circle at 50% 50%, rgba(25,30,25,0.8) 0%, transparent 30%),
          repeating-linear-gradient(45deg, #0d120d 0px, #0d120d 20px, #0a0e0a 20px, #0a0e0a 40px),
          repeating-linear-gradient(-45deg, #111511 0px, #111511 20px, transparent 20px, transparent 40px)
        `,
        padding: '24px',
      }}
    >
      {/* === OUTER GOLD BORDER (Corner cuts) === */}
      {/* We achieve the angled corners by using absolute positioned polygons or clip-path on the inner container */}
      
      <div style={{
        position: 'absolute',
        top: '24px', left: '24px', right: '24px', bottom: '24px',
        background: '#151515',
        clipPath: 'polygon(50px 0, calc(100% - 50px) 0, 100% 50px, 100% calc(100% - 50px), calc(100% - 50px) 100%, 50px 100%, 0 calc(100% - 50px), 0 50px)',
        display: 'flex',
      }}>
        {/* Inner Gold Frame Border */}
        <div style={{
          position: 'absolute',
          top: '0', left: '0', right: '0', bottom: '0',
          background: 'linear-gradient(135deg, #D4AF37 0%, #FFF3B0 25%, #AA7B25 50%, #FFF3B0 75%, #D4AF37 100%)',
          padding: '4px', // This acts as the gold border thickness
        }}>
          {/* Inner Light Background (The paper texture) */}
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(180deg, #fbfbfb 0%, #ebebeb 100%)',
            position: 'relative',
            // Adding a subtle paper grain texture
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"), linear-gradient(180deg, #fbfbfb 0%, #eeeeee 100%)`,
          }}>

            {/* === CENTER WATERMARK === */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px', height: '400px',
              opacity: 0.03,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg viewBox="0 0 100 100" width="400" height="400">
                <path d="M50 5 C50 5, 20 20, 20 50 C20 80, 50 95, 50 95 C50 95, 80 80, 80 50 C80 20, 50 5, 50 5 Z" fill="black" />
              </svg>
            </div>

            {/* === TOP LEFT LOGO (Shield) === */}
            <div style={{
              position: 'absolute',
              top: '30px', left: '40px',
              width: '160px', height: '190px',
              filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
            }}>
              <svg viewBox="0 0 160 210" width="100%" height="100%">
                {/* Shield background */}
                <path d="M80 5 L150 25 L150 110 C150 160 80 200 80 200 C80 200 10 160 10 110 L10 25 Z" fill="#0d0d0d" stroke="url(#goldGrad)" strokeWidth="6" strokeLinejoin="round"/>
                
                {/* Gold Gradient Def */}
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E5C158"/>
                    <stop offset="30%" stopColor="#FFF3B0"/>
                    <stop offset="70%" stopColor="#AA7B25"/>
                    <stop offset="100%" stopColor="#E5C158"/>
                  </linearGradient>
                </defs>

                {/* Shield Inner Box */}
                <rect x="25" y="30" width="110" height="35" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
                <rect x="27" y="32" width="106" height="31" fill="#151515" />
                <text x="80" y="55" textAnchor="middle" fill="url(#goldGrad)" fontSize="24" fontWeight="900" fontFamily="Impact, Arial Black, sans-serif">CHOQUE</text>
                
                <text x="80" y="75" textAnchor="middle" fill="#ccc" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">2º BP CHOQUE</text>

                {/* Spartan Helmet Illustration */}
                <path d="M60 150 L60 100 C60 85 70 80 80 80 C90 80 100 85 100 100 L100 150 L90 150 L90 120 L70 120 L70 150 Z" fill="url(#goldGrad)" />
                <path d="M75 100 L85 100 L85 130 L75 130 Z" fill="#151515" />
                <circle cx="80" cy="72" r="15" fill="url(#goldGrad)" />
                <circle cx="80" cy="72" r="13" fill="#151515" />

                {/* Bottom text */}
                <text x="80" y="175" textAnchor="middle" fill="url(#goldGrad)" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">ANCHIETA</text>

                {/* Laurel Leaves left & right */}
                <path d="M25 100 Q15 130 40 160" fill="none" stroke="url(#goldGrad)" strokeWidth="3" />
                <path d="M135 100 Q145 130 120 160" fill="none" stroke="url(#goldGrad)" strokeWidth="3" />
              </svg>
            </div>

            {/* === TOP RIGHT LOGO (Ribbon) === */}
            <div style={{
              position: 'absolute',
              top: '0', right: '40px',
              width: '100px', height: '200px',
              background: '#0d0d0d',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 30px), 0 100%)',
              borderLeft: '4px solid #C9A84C',
              borderRight: '4px solid #C9A84C',
              borderBottom: '4px solid #C9A84C', // This doesn't actually show on clip-path, but adds weight in some renderers
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '40px',
              filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))'
            }}>
              {/* Added fake borders since clip-path cuts real borders */}
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: '15px', width: '2px', background: 'url(#goldGrad)' }} />
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: '15px', width: '2px', background: 'url(#goldGrad)' }} />
              
              {/* Shield/Spartan circle */}
              <div style={{
                width: '70px', height: '70px',
                border: '1px solid #C9A84C',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: '4px',
                  border: '1px dashed #C9A84C', borderRadius: '50%'
                }} />
                <svg viewBox="0 0 100 100" width="40" height="40" fill="white">
                   <path d="M50 10 L80 30 L80 60 C80 80 50 90 50 90 C50 90 20 80 20 60 L20 30 Z" fill="none" stroke="white" strokeWidth="4"/>
                   <rect x="45" y="30" width="10" height="30" fill="white" />
                   <path d="M30 40 L45 40 L45 35 L30 35 Z" fill="white" />
                   <path d="M70 40 L55 40 L55 35 L70 35 Z" fill="white" />
                   {/* Helmet plume */}
                   <path d="M50 5 Q70 5 70 20 Q50 15 30 20 Q30 5 50 5" fill="white" />
                </svg>
              </div>
            </div>

            {/* === HEADER CENTER TEXT === */}
            <div style={{
              marginTop: '55px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '15px',
                fontWeight: '900',
                color: '#111',
                letterSpacing: '2px',
                fontFamily: "'Inter', sans-serif"
              }}>
                2º BATALHÃO DE POLÍCIA DE CHOQUE
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '15px',
                marginTop: '6px'
              }}>
                <div style={{ width: '40px', height: '1px', background: '#ccc' }} />
                <div style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#444',
                  letterSpacing: '4px',
                }}>
                  ANCHIETA
                </div>
                <div style={{ width: '40px', height: '1px', background: '#ccc' }} />
              </div>

              <div style={{
                fontSize: '12px',
                fontWeight: '900',
                color: '#111',
                letterSpacing: '3px',
                marginTop: '6px'
              }}>
                ELITE <span style={{ color: '#C0392B' }}>SP</span>
              </div>
            </div>

            {/* === MAIN TITLE (CERTIFICADO DE CONCLUSÃO) === */}
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <h1 style={{
                fontSize: '66px',
                fontWeight: '900',
                color: '#151515',
                letterSpacing: '6px',
                margin: '0',
                fontFamily: "'Impact', 'Arial Black', sans-serif",
                transform: 'scaleY(1.1)',
              }}>
                CERTIFICADO
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                marginTop: '15px'
              }}>
                <div style={{ width: '120px', height: '2px', background: '#C9A84C', position: 'relative' }}>
                  {/* Arrowhead / line tip */}
                  <div style={{ position: 'absolute', right: '-4px', top: '-3px', width: '0', height: '0', borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid #C9A84C' }} />
                </div>
                <div style={{
                  fontSize: '17px',
                  fontWeight: '800',
                  color: '#C9A84C',
                  letterSpacing: '7px',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  DE CONCLUSÃO
                </div>
                <div style={{ width: '120px', height: '2px', background: '#C9A84C', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-4px', top: '-3px', width: '0', height: '0', borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: '6px solid #C9A84C' }} />
                </div>
              </div>
            </div>

            {/* === BODY TEXT === */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '45px'
            }}>
              <div style={{
                fontSize: '18px',
                color: '#151515',
                fontFamily: "'Georgia', serif",
                fontStyle: 'italic',
                marginBottom: '40px'
              }}>
                Certificamos que
              </div>

              {/* Student Name */}
              <div style={{ width: '700px', position: 'relative', textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#111',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '1px',
                  paddingBottom: '8px'
                }}>
                  {militarPatente && <span style={{ color: '#666', fontWeight: '600' }}>{militarPatente} </span>}
                  {militarNome || 'NOME COMPLETO DO MILITAR'}
                </div>
                {/* Black underline */}
                <div style={{ width: '100%', height: '2px', background: '#111', position: 'absolute', bottom: 0 }} />
              </div>

              <div style={{
                fontSize: '18px',
                color: '#151515',
                fontFamily: "'Georgia', serif",
                fontStyle: 'italic',
                marginBottom: '40px'
              }}>
                concluiu com êxito o curso de
              </div>

              {/* Course Name */}
              <div style={{ width: '700px', position: 'relative', textAlign: 'center', marginBottom: '35px' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#111',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '2px',
                  paddingBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  {cursoNome || 'NOME DO CURSO DE ESPECIALIZAÇÃO'}
                </div>
                {/* Gold decorated underline */}
                <div style={{ width: '100%', height: '3px', background: '#C9A84C', position: 'absolute', bottom: 0 }} />
                {/* Arrow decorations on the gold line */}
                <div style={{ position: 'absolute', left: '-10px', bottom: '-4px', width: '0', height: '0', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '12px solid #C9A84C' }} />
                <div style={{ position: 'absolute', right: '-10px', bottom: '-4px', width: '0', height: '0', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '12px solid #C9A84C' }} />
              </div>

              <div style={{
                fontSize: '15px',
                color: '#333',
                fontFamily: "'Inter', sans-serif",
                textAlign: 'center',
                lineHeight: '1.6',
                maxWidth: '650px'
              }}>
                realizado no 2º Batalhão de Polícia de Choque Anchieta - Elite SP,<br />
                demonstrando dedicação, disciplina e comprometimento com a missão.
              </div>
            </div>

            {/* === FOOTER SIGNATURES & LOGOS === */}
            <div style={{
              position: 'absolute',
              bottom: '50px',
              left: '60px',
              right: '60px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}>
              
              {/* Instructor Signature */}
              <div style={{ width: '220px', textAlign: 'center' }}>
                <div style={{ width: '100%', height: '2px', background: '#111', marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111', letterSpacing: '1px' }}>
                  INSTRUTOR
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#C9A84C', letterSpacing: '1px', marginTop: '2px', textTransform: 'uppercase' }}>
                  {instrutor || 'NOME DO INSTRUTOR'}
                </div>
              </div>

              {/* Center Gold Wreath & Star */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-15px' }}>
                <svg viewBox="0 0 100 100" width="24" height="24" style={{ marginBottom: '55px' }}>
                  <polygon points="50,5 61,35 95,35 68,55 78,85 50,65 22,85 32,55 5,35 39,35" fill="#C9A84C" />
                </svg>
                
                {/* Wreath */}
                <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute' }}>
                    {/* Simplified laurel wreath vectors */}
                    <path d="M50 95 C20 95, 5 70, 5 40 C5 20, 20 10, 30 15 C20 30, 25 60, 45 80" fill="none" stroke="#C9A84C" strokeWidth="4" />
                    <path d="M50 95 C80 95, 95 70, 95 40 C95 20, 80 10, 70 15 C80 30, 75 60, 55 80" fill="none" stroke="#C9A84C" strokeWidth="4" />
                    {/* Leaves */}
                    <path d="M10 40 Q5 20 20 25 Q15 45 10 40 Z" fill="#C9A84C" />
                    <path d="M90 40 Q95 20 80 25 Q85 45 90 40 Z" fill="#C9A84C" />
                    <path d="M15 55 Q5 40 25 45 Q20 60 15 55 Z" fill="#C9A84C" />
                    <path d="M85 55 Q95 40 75 45 Q80 60 85 55 Z" fill="#C9A84C" />
                    <path d="M22 70 Q15 55 35 60 Q30 75 22 70 Z" fill="#C9A84C" />
                    <path d="M78 70 Q85 55 65 60 Q70 75 78 70 Z" fill="#C9A84C" />
                  </svg>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: '#C9A84C',
                    fontFamily: "'Georgia', serif",
                    letterSpacing: '-2px'
                  }}>
                    II
                  </div>
                </div>
              </div>

              {/* Student Signature */}
              <div style={{ width: '220px', textAlign: 'center' }}>
                <div style={{ width: '100%', height: '2px', background: '#111', marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111', letterSpacing: '1px' }}>
                  ALUNO
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#C9A84C', letterSpacing: '1px', marginTop: '2px', textTransform: 'uppercase' }}>
                  {militarNome || 'NOME DO ALUNO'}
                </div>
              </div>

            </div>

            {/* Sub-texts under the signature line (Data & Code - very small and discreet) */}
            <div style={{
              position: 'absolute', bottom: '15px', right: '30px',
              fontSize: '9px', color: '#888', textAlign: 'right'
            }}>
              Emissão: {data || new Date().toLocaleDateString('pt-BR')}<br/>
              Validação: {codigo || 'CHQ-000000'}
            </div>
            
          </div>
        </div>
      </div>

      {/* === BOTTOM BORDER TEXT (Inside the camo border space) === */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '0', right: '0',
        textAlign: 'center',
        zIndex: 5
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '900',
          color: '#C9A84C',
          letterSpacing: '6px',
          fontFamily: "'Inter', sans-serif"
        }}>
          DISCIPLINA &nbsp; • &nbsp; HONRA &nbsp; • &nbsp; CORAGEM &nbsp; • &nbsp; LEALDADE
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
