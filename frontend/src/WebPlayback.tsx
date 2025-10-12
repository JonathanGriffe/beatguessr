import React, { useState, useEffect } from 'react';
import GuessInput from './GuessInput';
import { get, post } from './utils/utils';
import { useNavigate } from 'react-router';
import './WebPlayback.css';
import TrackCard from './TrackCard';
import type { Track } from './lib/types';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: any;
  }
}

const ROUND_SEPARATION_TIMER = 5000


function WebPlayback() {
    const navigate = useNavigate();

    const [player, setPlayer] = useState(undefined);
    const [questionId, setQuestionId] = useState<string | null>(null);
    const [text, setText] = useState("");
    const [answerStatus, setAnswerStatus] = useState<'default' | 'correct' | 'wrong'>('default');
    const timeoutRef: { current: number | undefined } = React.useRef(undefined);
    const deviceId = React.useRef<string | null>(null);

    const [timerLength, setTimerLength] = useState<number>(0);
    const [track, setTrack] = useState<Track>({});
    const [timer, setTimer] = useState<number>(0);
    const timerId = React.useRef<number | undefined>(undefined);

    const labelColor = answerStatus === 'correct' ? 'green' : answerStatus === 'wrong' ? 'red' : 'black';

    const changeTrack = () => {
        setText("");
        setTrack({});
        get(`/api/quiz/question/?device_id=${deviceId.current}`, navigate).then(res => res.json()).then(data => {
            setQuestionId(data.question_id);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => roundTimeout(data.question_id), data.timer_ms);
            setTimerLength(data.timer_ms);
            startTimer(data.timer_ms);
          });
    };

    const refresh = (cb: (token: string) => void) => {
      get(`/api/accounts/refresh/`, navigate).then(res => res.json())
        .then(data => cb(data.access_token))
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

    const startTimer = (duration: number) => {
      setTimer(duration / 1000);
      clearInterval(timerId.current);
      timerId.current = setInterval(() => {
        setTimer((prev) => {
          if (prev > 0) {
            return prev - 1;
          }
          return 0;
        });
      }, 1000);
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
      setQuestionId(null);
      startTimer(ROUND_SEPARATION_TIMER);
      setTimeout(() => {
        changeTrack();
      }, ROUND_SEPARATION_TIMER);
    }

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: (cb: (token: string) => void): void => { (refresh(cb)); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }: { device_id: string }) => {
                console.log('Ready with Device ID', device_id);
                deviceId.current = device_id;
                changeTrack();
            });

            player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                console.log('Device ID has gone offline', device_id);
            });


            player.connect();
        };
    }, []);

   return (
      <div className="flex flex-col w-full items-center m-20 gap-6">
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