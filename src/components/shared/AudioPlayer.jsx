import { useState, useRef, useEffect } from 'react';
import { MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff } from 'react-icons/md';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Attempt autoplay on mount
  useEffect(() => {
    const attemptPlay = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (err) {
        console.warn("Navegador bloqueou o Autoplay. O usuário deve clicar na tela primeiro.", err);
      }
    };
    attemptPlay();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      toggleMute();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-mil-dark border border-gray-800 rounded-full shadow-lg p-2 flex items-center gap-3 hover:border-gold/30 transition-colors">
      <audio
        ref={audioRef}
        src="/audio/cancao.mp3"
        loop
      />
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-gold text-mil-black flex items-center justify-center hover:bg-gold-light transition-colors"
        title={isPlaying ? "Pausar Canção" : "Tocar Canção"}
      >
        {isPlaying ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
      </button>

      <div className="flex items-center gap-2 pr-4 hidden sm:flex">
        <button onClick={toggleMute} className="text-gray-400 hover:text-gold transition-colors">
          {isMuted || volume === 0 ? <MdVolumeOff size={20} /> : <MdVolumeUp size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gold"
          title="Volume"
        />
      </div>
    </div>
  );
}
