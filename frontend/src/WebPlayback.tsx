import React, { useState, useEffect } from 'react';
import GuessInput from './GuessInput';
import { successOrRedirect } from './utils/utils';
import { useNavigate } from 'react-router';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: any;
  }
}

function getCookie(name: string) {
  const parts = document.cookie.split(`${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    return part ? part.split(';').shift() : undefined;
  }
  return undefined;
}

function WebPlayback(props: { token: string }) {
    const navigate = useNavigate();

    const [player, setPlayer] = useState(undefined);
    const [questionId, setQuestionId] = useState<string | null>(null);
    const [text, setText] = useState("");
    const [answerStatus, setAnswerStatus] = useState<'default' | 'correct' | 'wrong'>('default');
    const timeoutRef: { current: number | undefined } = React.useRef(undefined);
    const deviceId = React.useRef<string | null>(null);

    const changeTrack = () => {
        setText("");
        fetch(`/api/quiz/question/?device_id=${deviceId.current}`, {
            method: 'GET',
            credentials: 'include',
        }).then(successOrRedirect(navigate)).catch(err => console.error(err)).then(res => res.json())
          .then(data => {
            setQuestionId(data.question_id);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(changeTrack, data.timer_ms);
          });
    };


    const sendResponse = (text: string) => {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json');
        const cookie = getCookie('csrftoken');
        if (!cookie) {
            console.error("No CSRF token found in cookies");
            return;
        }
        requestHeaders.set('X-CSRFToken', cookie);
        fetch('/api/quiz/answer/', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                question_id: questionId,
                text: text,
            }),
            headers: requestHeaders,
        }).then(successOrRedirect(navigate)).then(res => res.json())
          .then(data => {
            let status: 'correct' | 'wrong' = data.is_correct ? "correct" : "wrong";
            setAnswerStatus(status);
            setTimeout(() => setAnswerStatus('default'), 3000);
            if (data.is_correct) {
                setText("");
                changeTrack();
            }
        }).catch(err => console.error(err));


    }
    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: (cb: (token: string) => void): void => { cb(props.token); },
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
      <>
        <div className="container">
            <GuessInput value={text} onChange={(e) => setText(e.target.value)} status={answerStatus} onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    sendResponse(text);
                }
            }} />
        </div>
      </>
    );
}

export default WebPlayback