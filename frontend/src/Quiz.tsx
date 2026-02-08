import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import './Quiz.css';
import QuizInterface, { ROUND_SEPARATION_TIMER, type QuizInterfaceHandle } from './QuizInterface';
import RoomCard from './RoomCard';
import SettingsCard from './SettingsCard';
import { Button } from './components/ui/button';
import type { Settings } from './lib/types';
import { get } from './utils/utils';

function Quiz() {
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();
  const playlistId = useRef(queryParams.get("playlist_id"));
  const [roomStatus, setRoomStatus] = useState<'none' | 'leader' | 'follower'>('none');
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const endRoundCallback = useRef(() => { });
  const settingsRef = useRef<Settings>({
    volume: 50,
    roundTimer: 25,
    mode: 'casual',
    roomName: queryParams.get("room"),
    guestUsername: queryParams.get("username")
  });



  const interfaceRef = useRef<QuizInterfaceHandle>(null);

  const startRoomQuiz = (timer: number, preview_url: string) => {
    const maxTimer = settingsRef.current.roomName ? (timer + ROUND_SEPARATION_TIMER / 1000) : undefined;
    interfaceRef.current?.startRound(timer, maxTimer);
    playSong(preview_url);
  }

  const setVolume = (value: number[]) => {
    settingsRef.current.volume = value[0];
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  }

  const playSong = (preview_url: string) => {
    if (audioRef.current !== null) {
      audioRef.current.src = preview_url;
      audioRef.current.play();
    }
  }

  const startRound = () => {
    const mode = settingsRef.current.roomName ? 'casual' : settingsRef.current.mode;
    let url = `/api/quiz/question/?playlist_id=${playlistId.current}&mode=${mode}`
    if (settingsRef.current.roomName) {
      url += `&room_name=${settingsRef.current.roomName}&timer=${settingsRef.current.roundTimer}`
    }
    get(url, navigate).then((res) => {
      if (res.status === 200 && !settingsRef.current.roomName) {
        interfaceRef.current?.startRound(settingsRef.current.roundTimer);
        res.json().then(data => {
          playSong(data.preview_url);
        })
      }

    })
  }

  useEffect(() => {
    if (!settingsRef.current.roomName) {
      endRoundCallback.current = startRound;
    }
    if (settingsRef.current.guestUsername) {
      get(`/api/accounts/guest_user/?guest_username=${settingsRef.current.guestUsername}`, navigate).then(() => {
        setRoomStatus('follower');
        setPlaying(true);
      });
      return;
    }


  }, []);

  return (
    <div className='w-full h-full flex-1 relative flex flex-col items-center justify-center'>
      {(playing ?
        <QuizInterface roundEndCallback={endRoundCallback} ref={interfaceRef} roomStatus={roomStatus} />
        : <Button onClick={() => { setPlaying(true); startRound() }} className="hover:cursor-pointer bg-transparent hover:bg-gray-500/20 size-60">
          <Play className="size-full" />
        </Button>
      )}
      <audio ref={audioRef} />
      {!settingsRef.current.guestUsername &&
        <div className="absolute top-0 left-0 p-20">
          <SettingsCard settingsRef={settingsRef} setVolume={setVolume} roomStatus={roomStatus} />
        </div>
      }
      {
        <div className="md:absolute md:top-0 md:right-0 md:p-20">
          <RoomCard settingsRef={settingsRef} startRound={startRoomQuiz} enterRoom={() => { setRoomStatus('leader'); }} />

        </div>
      }

    </div>
  );
}

export default Quiz;

