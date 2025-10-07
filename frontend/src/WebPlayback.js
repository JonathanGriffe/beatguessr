import React, { useState, useEffect } from 'react';
import GuessInput from './GuessInput';
import { successOrRedirect } from './utils/utils';
import { useNavigate } from 'react-router';

function getCookie(name) {
  const value = `; ${document.cookie}`;      // add a leading `; ` to make splitting easier
  const parts = value.split(`; ${name}=`);  // split on the cookie name
  if (parts.length === 2) {
    return parts.pop().split(';').shift();  // get the value before the next `;`
  }
  return null;  // cookie not found
}

function WebPlayback(props) {
    const navigate = useNavigate();

    const [player, setPlayer] = useState(undefined);
    const [questionId, setQuestionId] = useState(null);
    const [text, setText] = useState("");
    const [answerStatus, setAnswerStatus] = useState(null);
    const timeoutRef = React.useRef(null);
    const deviceId = React.useRef(null);

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


    const sendResponse = (text) => {
        fetch('/api/quiz/answer/', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                question_id: questionId,
                text: text,
            }),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
        }).then(successOrRedirect(navigate)).then(res => res.json())
          .then(data => {
            let status = data.is_correct ? "correct" : "wrong";
            setAnswerStatus(status);
            setTimeout(() => setAnswerStatus(null), 3000);
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
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                deviceId.current = device_id;
                changeTrack();
            });

            player.addListener('not_ready', ({ device_id }) => {
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