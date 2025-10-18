import { useState, useEffect, useRef } from 'react';
import GuessInput from './GuessInput';
import { get, post } from './utils/utils';
import { useNavigate } from 'react-router';
import './WebPlayback.css';
import TrackCard from './TrackCard';
import type { Track } from './lib/types';
import { Check, CirclePlus, Pause, Play, Plus } from 'lucide-react';
import { Spinner } from './components/ui/spinner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: any;
  }
}

const ROUND_SEPARATION_TIMER = 5000

interface SpotifyPlaylist {
  id: string;
  name: string;
}

function WebPlayback(props: { playlist_id: string | null }) {
    const navigate = useNavigate();

    const [questionId, setQuestionId] = useState<string | null>(null);
    const [text, setText] = useState("");
    const [answerStatus, setAnswerStatus] = useState<'default' | 'correct' | 'wrong'>('default');
    const timeoutRef: { current: number | undefined } = useRef(undefined);
    const deviceId = useRef<string | null>(null);

    const [timerLength, setTimerLength] = useState<number>(0);
    const [track, setTrack] = useState<Track>({});
    const [timer, setTimer] = useState<number>(0);
    const timerId = useRef<number | undefined>(undefined);
    const player = useRef<any>(null);
    const timerStart = useRef<number>(0);
    const timerRemaining = useRef<number>(0);

    const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([]);
    const spotifyUserId = useRef<string | null>(null);

    const accessToken = useRef<string | null>(null);

    const [songLiked, setSongLiked] = useState<'loading' | 'true' | 'false'>('loading');
    const [playing, setPlaying] = useState<boolean>(true);

    const labelColor = answerStatus === 'correct' ? 'green' : answerStatus === 'wrong' ? 'red' : 'black';

    const changeTrack = () => {
      console.log("change track !")
      if (props.playlist_id === null) {
        return
      }
        setText("");
        setTrack({});
        get(`/api/quiz/question/?device_id=${deviceId.current}&playlist_id=${props.playlist_id}`, navigate).then(res => res.json()).then(data => {
            setQuestionId(data.question_id);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => roundTimeout(data.question_id), data.timer_ms);
            setTimerLength(data.timer_ms);
            startTimer(data.timer_ms);
          });
    };

    const refresh = (cb: (token: string) => void) => {
      get(`/api/accounts/refresh/`, navigate).then(res => res.json())
        .then(data => {
          accessToken.current = data.access_token;
          cb(data.access_token);
        })
    }


    const getUserData = () => {
      fetch(`https://api.spotify.com/v1/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.current}`
        }
      }).then(data => {
        data.json().then(data => {
          spotifyUserId.current = data.id;
          getPlaylists();
        })
      })
    }


    const getPlaylists = () => {
      fetch(`https://api.spotify.com/v1/me/playlists`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.current}`
        }
      }).then(data => {
        data.json().then(data => {  
          setSpotifyPlaylists(data.items.filter((playlist: any) => playlist.owner.id === spotifyUserId.current).map((playlist: any) => ({ id: playlist.id, name: playlist.name })));
        })
      })
    }


    const addToPlaylist = (playlist_id: string) => {
      fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.current}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [`spotify:track:${playlist_id}`] })
      })
    }

    const getSongLiked = (spotify_id: string) => {
      setSongLiked('loading');
      fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${spotify_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.current}`
        }
      }).then(data => {
        data.json().then(data => {
          setSongLiked(data[0] ? 'true' : 'false');
        })
      })
    }

    const toggleSongLiked = () => {
      const method = songLiked === 'true' ? 'DELETE' : 'PUT';
      setSongLiked('loading');
      fetch(`https://api.spotify.com/v1/me/tracks?ids=${track.spotify_id}`, {
          method: method,
          headers: {
            'Authorization': `Bearer ${accessToken.current}`
          }
        }).then(() => {
          setSongLiked(method === 'DELETE' ? 'false' : 'true');
        })
      }

    const sendResponse = (text: string) => {
      if (!questionId) {
        console.error("No question ID set");
        return;
      }
      if (text.length === 0) {
        return;
      }
        post('/api/quiz/answer/', navigate, {'Content-Type': 'application/json'},
            {
                question_id: questionId,
                text: text,
            },
        ).then(res => res.json())
          .then(data => {
            let status: 'correct' | 'wrong' = data.is_artist_correct || data.is_title_correct ? "correct" : "wrong";
            setAnswerStatus(status);
            setTimeout(() => setAnswerStatus('default'), 3000);
            if (data.is_artist_correct && data.is_title_correct) {
                endRound(data.song);
            } else {
              setTrack(data.song || {});
            }
        });


    }

    const togglePlaying = () => {
      if (player.current) {
        if (playing) {
          timerRemaining.current = timerRemaining.current - (Date.now() - timerStart.current);
          clearTimeout(timerId.current);
          clearTimeout(timeoutRef.current);
        } else {
          startTimer(timerRemaining.current);
          timerStart.current = Date.now();
          timeoutRef.current = setTimeout(() => {
            changeTrack();
          }, timerRemaining.current);
        }
        setPlaying((prev) => !prev);
        player.current.togglePlay();
      }
    }

    const updateTimer = (timeout: number) => {
      timerId.current = setTimeout(() => {
        updateTimer(1000);
        setTimer((prev) => {
          if (prev > 0) {
            return prev - 1;
          }
          return 0;
        });
      }, timeout)
    }
    const startTimer = (duration: number) => {
      setTimer(Math.ceil(duration / 1000));
      timerStart.current = Date.now();
      timerRemaining.current = duration;
      clearInterval(timerId.current);
      

      updateTimer(duration - 1000 * Math.floor((duration - 1) / 1000));
    }

    const roundTimeout = (questionId: string) => {
      post('/api/quiz/answer/', navigate, {'Content-Type': 'application/json'}, 
            {
                question_id: questionId,
            },
        ).then(res => res.json()).then(data => {
          endRound(data.song);
        })
    }
    const endRound = (track: Track) => {
      setTrack(track);
      if (track.spotify_id) {
        getSongLiked(track.spotify_id);
      }
      setQuestionId(null);
      startTimer(ROUND_SEPARATION_TIMER);
      timeoutRef.current = setTimeout(() => {
        changeTrack();
      }, ROUND_SEPARATION_TIMER);
    }

    useEffect(() => {
      let script: HTMLScriptElement | null = null;
      const initSpotifyPlayer = async () => {
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
            deviceId.current = device_id;
            changeTrack();
            getUserData();
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
      <div className="flex flex-col w-full items-center m-20 gap-6">
        { (questionId === null) && timerLength ?
        <div className="text-greenblue flex flex-row items-center justify-between border-5 border-greenblue w-140 rounded-xl p-2">
          <div className="cursor-pointer">
            {
              songLiked === 'true' ? <div className="w-8 h-8 rounded-2xl bg-greenblue flex items-center justify-center">
                <Check className="text-beige w-6 h-6" onClick={toggleSongLiked}/></div> : 
              songLiked === 'false' ? <CirclePlus className="w-8 h-8" onClick={toggleSongLiked}/> : 
              <Spinner className="w-8 h-8"/>
            }
          </div>
          <div className="cursor-pointer">
          {
            playing ? <Pause className="w-8 h-8" onClick={togglePlaying}/> : <Play className="w-8 h-8" onClick={togglePlaying}/>
          }
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Plus className="w-8 h-8 cursor-pointer"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                {
                  spotifyPlaylists.map((playlist) => <DropdownMenuItem key={playlist.id} onSelect={() => addToPlaylist(playlist.id)}>{playlist.name}</DropdownMenuItem>)
                }
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> : ""
        }
        <TrackCard track={track}/>
        <div className="flex flex-col items-center h-1/3">
              <p>{questionId ? "Next round in" : "Rounds ends in"}</p>
              <p className="text-greenblue font-bold text-4xl">{timer}</p>
          </div>
        <div className="w-full">
          <div className="h-3 w-full rounded overflow-hidden">
            {questionId ? <div className='h-full bg-darkblue animate-fillBar' style={{ animationDuration: `${timerLength}ms` }}></div>: ''}
          </div>
          <GuessInput value={text} onChange={(e) => setText(e.target.value)} labelColor={labelColor} onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  sendResponse(text);
              }
          }} />
          </div>
      </div>
    );
}

export default WebPlayback