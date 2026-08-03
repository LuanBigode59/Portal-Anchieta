import { useState, useEffect, useRef } from 'react';
import { MdCheckCircle, MdCancel, MdVideocam, MdMic, MdScreenShare, MdWarning } from 'react-icons/md';

export default function DeviceTest({ 
  requireCamera, 
  requireMicrophone, 
  requireScreenShare, 
  onTestComplete 
}) {
  const [cameraOk, setCameraOk] = useState(null);
  const [micOk, setMicOk] = useState(null);
  const [screenOk, setScreenOk] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup streams when unmounting
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const testCameraAndMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: requireCamera, 
        audio: requireMicrophone 
      });
      
      if (requireCamera) {
        setCameraOk(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
      if (requireMicrophone) setMicOk(true);
    } catch (err) {
      console.error("Camera/Mic test failed:", err);
      if (requireCamera) setCameraOk(false);
      if (requireMicrophone) setMicOk(false);
    }
  };

  const testScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenOk(true);
      // Immediately stop it, just testing permissions
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Screen share test failed:", err);
      setScreenOk(false);
    }
  };

  const checkCompletion = () => {
    const isCameraReady = !requireCamera || cameraOk === true;
    const isMicReady = !requireMicrophone || micOk === true;
    const isScreenReady = !requireScreenShare || screenOk === true;
    
    if (isCameraReady && isMicReady && isScreenReady && termsAccepted) {
      onTestComplete(true);
    } else {
      onTestComplete(false);
    }
  };

  useEffect(() => {
    checkCompletion();
  }, [cameraOk, micOk, screenOk, termsAccepted]);

  return (
    <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-6">
      <h3 className="text-lg font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-2">Checklist de Dispositivos</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {requireCamera && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-mil-black border border-gray-800">
              <div className="flex items-center gap-3">
                <MdVideocam className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-white">Câmera</p>
                  <p className="text-xs text-gray-500">Obrigatório</p>
                </div>
              </div>
              <div>
                {cameraOk === null ? (
                  <button onClick={testCameraAndMic} className="btn-gold text-xs !py-1 !px-3">Testar</button>
                ) : cameraOk ? (
                  <MdCheckCircle className="text-2xl text-green-500" />
                ) : (
                  <MdCancel className="text-2xl text-red-500" />
                )}
              </div>
            </div>
          )}

          {requireMicrophone && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-mil-black border border-gray-800">
              <div className="flex items-center gap-3">
                <MdMic className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-white">Microfone</p>
                  <p className="text-xs text-gray-500">Obrigatório</p>
                </div>
              </div>
              <div>
                {micOk === null ? (
                  <button onClick={testCameraAndMic} className="btn-gold text-xs !py-1 !px-3">Testar</button>
                ) : micOk ? (
                  <MdCheckCircle className="text-2xl text-green-500" />
                ) : (
                  <MdCancel className="text-2xl text-red-500" />
                )}
              </div>
            </div>
          )}

          {requireScreenShare && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-mil-black border border-gray-800">
              <div className="flex items-center gap-3">
                <MdScreenShare className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm font-bold text-white">Compartilhar Tela</p>
                  <p className="text-xs text-gray-500">Obrigatório</p>
                </div>
              </div>
              <div>
                {screenOk === null ? (
                  <button onClick={testScreenShare} className="btn-gold text-xs !py-1 !px-3">Testar</button>
                ) : screenOk ? (
                  <MdCheckCircle className="text-2xl text-green-500" />
                ) : (
                  <MdCancel className="text-2xl text-red-500" />
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          {requireCamera && (
            <div className="h-48 w-full bg-black rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center relative">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {!cameraOk && <p className="text-gray-500 text-sm absolute">Prévia da Câmera</p>}
            </div>
          )}
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg mt-6">
        <h4 className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-2"><MdWarning /> Termo de Responsabilidade</h4>
        <div className="text-xs text-gray-300 space-y-2 mb-4">
          <p>Ao solicitar autorização, você concorda que:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>A avaliação será supervisionada em tempo real por um instrutor.</li>
            <li>O compartilhamento de câmera, microfone e tela devem permanecer ativos durante toda a prova.</li>
            <li>Interrupções na conexão ou saída da página (troca de abas) serão registradas e poderão invalidar sua tentativa.</li>
            <li>O instrutor responsável tem autonomia para pausar ou cancelar sua prova caso identifique irregularidades.</li>
          </ul>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={termsAccepted} 
            onChange={(e) => setTermsAccepted(e.target.checked)} 
            className="mt-1 accent-gold w-4 h-4" 
          />
          <span className="text-sm font-bold text-white">
            Li e aceito os termos para a realização desta prova supervisionada.
          </span>
        </label>
      </div>

    </div>
  );
}
