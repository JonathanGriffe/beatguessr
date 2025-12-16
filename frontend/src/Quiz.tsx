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
  const player = useRef<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<'none' | 'leader' | 'follower'>('none');
  const [isReady, setIsReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const endRoundCallback = useRef(() => { });
  const settingsRef = useRef<Settings>({
    volume: 50,
    roundTimer: 25,
    mode: 'casual',
    roomName: queryParams.get("room"),
    deviceId: null,
    guestUsername: queryParams.get("username")
  });



  const interfaceRef = useRef<QuizInterfaceHandle>(null);

  const startRoomQuiz = (timer: number) => {
    const maxTimer = settingsRef.current.roomName ? (timer + ROUND_SEPARATION_TIMER / 1000) : undefined;
    interfaceRef.current?.startRound(timer, maxTimer);
  }

  const setVolume = (value: number[]) => {
    settingsRef.current.volume = value[0];
    player.current?.setVolume(value[0] / 100);
  }
  const refresh = (cb: (token: string) => void) => {
    get(`/api/accounts/refresh/`, navigate).then(res => res.json())
      .then(data => {
        setAccessToken(data.access_token);
        cb(data.access_token);
      })
  }


  const startRound = () => {
    const mode = settingsRef.current.roomName ? 'casual' : settingsRef.current.mode;
    let url = `/api/quiz/question/?device_id=${settingsRef.current.deviceId}&playlist_id=${playlistId.current}&mode=${mode}`
    if (settingsRef.current.roomName) {
      url += `&room_name=${settingsRef.current.roomName}&timer=${settingsRef.current.roundTimer}`
    }
    get(url, navigate).then((res) => {
      res.status === 200 && !settingsRef.current.roomName && interfaceRef.current?.startRound(settingsRef.current.roundTimer);
    })
  }

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    if (settingsRef.current.guestUsername) {
      get(`/api/accounts/guest_user/?guest_username=${settingsRef.current.guestUsername}`, navigate).then(() => {
        setRoomStatus('follower');
        setIsReady(true);
        setPlaying(true);
      });
      return;
    }

    const initSpotifyPlayer = async () => {
      if (settingsRef.current.roomName) {
        setRoomStatus('follower');
        setPlaying(true);
      }
      if (!window.Spotify) {
        console.log("adding script");
        script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);
      }

      await new Promise<void>(resolve => {
        if (window.Spotify) return resolve();
        window.onSpotifyWebPlaybackSDKReady = resolve;
      })

      const spotifyPlayer = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb: (token: string) => void): void => { (refresh(cb)); },
        volume: 0.5
      });

      player.current = spotifyPlayer;


      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        settingsRef.current.deviceId = device_id;
        setIsReady(true);
        if (!settingsRef.current.roomName) {
          endRoundCallback.current = startRound;
        }
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
      });

      spotifyPlayer.connect();

    }

    initSpotifyPlayer();

    return () => {
      console.log("END !")
      if (player.current) {
        player.current.disconnect();
        player.current.removeListener('ready');
        player.current.removeListener('not_ready');
      }

      if (script) {
        script.parentNode?.removeChild(script);
      }
      delete player.current;
      delete window.Spotify;
      delete window.onSpotifyWebPlaybackSDKReady;
    }
  }, []);

  return (
    <div className='w-full h-full flex-1 relative flex flex-col items-center justify-center'>
      {!settingsRef.current.guestUsername &&
        <div className="absolute top-0 left-0 p-20">
          <SettingsCard settingsRef={settingsRef} setVolume={setVolume} roomStatus={roomStatus} />
        </div>
      }
      {
        isReady && <div className="md:absolute md:top-0 md:right-0 md:p-20">
          <RoomCard settingsRef={settingsRef} startRound={startRoomQuiz} enterRoom={() => { setRoomStatus('leader'); }} />

        </div>
      }
      {isReady && (playing ?
        <QuizInterface accessToken={accessToken} roundEndCallback={endRoundCallback} ref={interfaceRef} roomStatus={roomStatus} />
        : <Button onClick={() => { setPlaying(true); startRound() }} className="hover:cursor-pointer bg-darkblue size-60">
          <Play className="size-full" />
        </Button>
      )}
    </div>
  );
}

export default Quiz;

