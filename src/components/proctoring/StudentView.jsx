import { useState, useEffect } from 'react';
import { proctorService } from '../../services/proctorService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LiveKitRoom, 
  useLocalParticipant,
  RoomAudioRenderer
} from '@livekit/components-react';
import '@livekit/components-styles';

const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

function StudentPublisher({ session }) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    async function publishTracks() {
      try {
        if (session.require_camera) {
          await localParticipant.setCameraEnabled(true);
        }
        if (session.require_microphone) {
          await localParticipant.setMicrophoneEnabled(true);
        }
        if (session.require_screen_share) {
          await localParticipant.setScreenShareEnabled(true, { audio: false });
        }
      } catch (e) {
        console.error("Failed to publish tracks:", e);
      }
    }
    
    if (localParticipant) {
      publishTracks();
    }
    
    return () => {
      // Cleanup tracks if component unmounts
      if (localParticipant) {
        localParticipant.setCameraEnabled(false);
        localParticipant.setMicrophoneEnabled(false);
        localParticipant.setScreenShareEnabled(false);
      }
    };
  }, [localParticipant, session]);

  return null; // Hidden publisher
}

export default function StudentView({ session, participantId, onDisconnect, onPauseFromInstructor }) {
  const { user } = useAuth();
  const [token, setToken] = useState('');

  useEffect(() => {
    async function fetchToken() {
      if (session && user) {
        try {
          const t = await proctorService.getLivekitToken(session.room_name, user.id, false);
          setToken(t);
        } catch (e) {
          console.error("Failed to fetch livekit token for student:", e);
        }
      }
    }
    fetchToken();
  }, [session, user]);

  if (!token) return null;

  return (
    <LiveKitRoom
      video={session.require_camera}
      audio={session.require_microphone}
      screen={session.require_screen_share}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      onDisconnected={onDisconnect}
      className="hidden" // Ensure it doesn't take space
    >
      <StudentPublisher session={session} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
