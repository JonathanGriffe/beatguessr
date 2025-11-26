import { Check, CirclePlus, Pause, Play, Plus } from 'lucide-react';
import { useEffect, useImperativeHandle, useRef, useState, type Ref, type RefObject } from 'react';
import { useNavigate } from 'react-router';
import GuessInput from './GuessInput';
import TrackCard from './TrackCard';
import './WebPlayback.css';
import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Spinner } from './components/ui/spinner';
import type { SpotifyPlaylist, Track } from './lib/types';
import { post } from './utils/utils';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: any;
  }
}

export const ROUND_SEPARATION_TIMER = 5000

export type QuizInterfaceHandle = {
  startRound: (timer: number, totalTimer?: number) => void;
};

function QuizInterface(props: { accessToken: string | null, roundEndCallback: RefObject<() => void>, ref: Ref<QuizInterfaceHandle>, roomStatus: string }) {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [answerStatus, setAnswerStatus] = useState<'default' | 'correct' | 'wrong'>('default');
  const timeoutRef: { current: number | undefined } = useRef(undefined);

  const [timerLength, setTimerLength] = useState<number>(0);
  const [track, setTrack] = useState<Track>({});
  const [timer, setTimer] = useState<number>(0);
  const timerId = useRef<number | undefined>(undefined);
  const timerStart = useRef<number>(0);
  const timerRemaining = useRef<number>(0);
  const totalTimer = useRef<number | undefined>(undefined);
  const [guesses, setGuesses] = useState<string[]>([]);


  const spotifyUserId = useRef<string | null>(null);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([]);

  const [songLiked, setSongLiked] = useState<'loading' | 'true' | 'false'>('loading');
  const [playing, setPlaying] = useState<boolean>(true);

  const answerStatusTimerId = useRef<number | undefined>(undefined);

  const [isQuestion, setIsQuestion] = useState<boolean>(false);

  useImperativeHandle(props.ref, () => ({
    startRound(timer: number, totalFixedTimer?: number) {
      totalTimer.current = totalFixedTimer && totalFixedTimer * 1000;
      startRound(timer);
    },
  }));

  const startRound = (roundTimer: number) => {
    setText("");
    setTrack({});
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(roundTimeout, roundTimer * 1000);
    setTimerLength(roundTimer * 1000);
    startTimer(roundTimer * 1000);
    setIsQuestion(true);
  }

  const getUserData = () => {
    fetch(`https://api.spotify.com/v1/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${props.accessToken}`
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
        'Authorization': `Bearer ${props.accessToken}`
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
        'Authorization': `Bearer ${props.accessToken}`,
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
        'Authorization': `Bearer ${props.accessToken}`
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
        'Authorization': `Bearer ${props.accessToken}`
      }
    }).then(() => {
      setSongLiked(method === 'DELETE' ? 'false' : 'true');
    })
  }

  const sendResponse = (text: string) => {
    setText("");
    if (text.length === 0) {
      return;
    }
    post('/api/quiz/answer/', navigate, { 'Content-Type': 'application/json' },
      {
        text: text,
      },
    ).then(res => res.json())
      .then(data => {
        let status: 'correct' | 'wrong' = data.is_artist_correct || data.is_title_correct ? "correct" : "wrong";
        setGuesses(prev => [text, ...prev]);
        setAnswerStatus(status);
        clearTimeout(answerStatusTimerId.current);
        answerStatusTimerId.current = setTimeout(() => setAnswerStatus('default'), 3000);
        if (data.song?.spotify_id) {
          endRound(data.song);
        } else {
          setTrack(data.song || {});
        }
      });


  }

  const togglePlaying = () => {
    if (playing) {
      timerRemaining.current = timerRemaining.current - (Date.now() - timerStart.current);
      clearTimeout(timerId.current);
      clearTimeout(timeoutRef.current);
    } else {
      startTimer(timerRemaining.current);
      timerStart.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        props.roundEndCallback.current();
      }, timerRemaining.current);
    }
    setPlaying((prev) => !prev);
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

  const roundTimeout = () => {
    post('/api/quiz/answer/', navigate, { 'Content-Type': 'application/json' },
      {
        give_up: true,
      },
    ).then(res => res.json()).then(data => {
      endRound(data.song);
    })
  }
  const endRound = (track: Track) => {
    setIsQuestion(false);
    setTrack(track);
    if (track.spotify_id) {
      getSongLiked(track.spotify_id);
    }
    const roundEndTimer = totalTimer.current ? totalTimer.current - (Date.now() - timerStart.current) : ROUND_SEPARATION_TIMER;
    startTimer(roundEndTimer);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setGuesses([]);
      props.roundEndCallback.current();
    }, roundEndTimer);
  }

  useEffect(() => {
    if (!props.accessToken) {
      return;
    }
    getUserData();
  }, [props.accessToken])


  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center">
      <div className="relative flex flex-col w-full items-center pl-20 pr-20 gap-6">
        <div className="w-140 h-15 flex items-end">
          {props.accessToken && (!isQuestion ?
            <div className="text-greenblue flex flex-row items-center justify-between border-5 border-greenblue rounded-xl p-2 w-full">
              <div className="cursor-pointer">
                {
                  songLiked === 'true' ? <div className="w-8 h-8 rounded-2xl bg-greenblue flex items-center justify-center">
                    <Check className="text-beige w-6 h-6" onClick={toggleSongLiked} /></div> :
                    songLiked === 'false' ? <CirclePlus className="w-8 h-8" onClick={toggleSongLiked} /> :
                      <Spinner className="w-8 h-8" />
                }
              </div>
              <div className="cursor-pointer">
                {
                  props.roomStatus != 'follower' && (playing ? <Pause className="w-8 h-8" onClick={togglePlaying} /> : <Play className="w-8 h-8" onClick={togglePlaying} />)
                }
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Plus className="w-8 h-8 cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    {
                      spotifyPlaylists.map((playlist) => <DropdownMenuItem key={playlist.id} onSelect={() => addToPlaylist(playlist.id)}>{playlist.name}</DropdownMenuItem>)
                    }
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            :
            <Button className="hover:cursor-pointer w-full bg-greenblue" onClick={roundTimeout}>Give Up</Button>)
          }
        </div>
        <TrackCard track={track} />
        <div className="flex flex-col items-center h-1/3">
          <p>{!isQuestion ? "Next round in" : "Round ends in"}</p>
          <p className="text-greenblue font-bold text-4xl">{timer}</p>
        </div>
        <div className="w-full">
          <div className="h-3 w-full rounded overflow-hidden">
            {isQuestion ? <div className='h-full bg-darkblue animate-fillBar' style={{ animationDuration: `${timerLength}ms` }}></div> : ''}
          </div>
          <GuessInput value={text} onChange={(e) => setText(e.target.value)} labelColor={answerStatus === 'correct' ? 'green' : answerStatus === 'wrong' ? 'red' : 'black'} onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendResponse(text);
            }
          }} />
        </div>
        {guesses.length > 0 &&
          <div className="absolute pt-5 top-full flex flex-col gap-1 w-140 items-center">
            <span className='text-greenblue text-2xl'>Guesses :</span>
            {guesses.map((guess, index) => <span key={index}>{guess}</span>)}
          </div>
        }
      </div>
    </div>
  );
}

export default QuizInterface