import { useEffect, useState } from 'react';
import './Login.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Spinner } from './components/ui/spinner';

function Login() {
  const [clientId, setClientId] = useState('');
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    fetch('/api/accounts/client_id/').then(res => res.json()).then(data => {
      setClientId(data.client_id);
    });
  }, []);

  const scopes = 'user-read-playback-state user-modify-playback-state user-library-read user-library-modify streaming user-read-email user-read-private playlist-read-private playlist-modify-public playlist-modify-private';
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-15">
      {clientId ?
        <Button className="bg-sgreen text-black hover:bg-green-500 hover:cursor-pointer shadow-md hover:shadow-lg" onClick={() => {
          window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${window.location.origin}/callback/`;
        }}>
          Login with Spotify
        </Button> : <Spinner />
      }
      <span>or</span>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="w-52 h-11 p-1 bg-gray-500/20 rounded-lg backdrop-blur-md">
          <Input className="w-50 bg-white border-4 border-amber-50/0 backdrop-blur-sm" placeholder='Username' onChange={e => setUsername(e.target.value)}></Input>
        </div>
        <div className="w-52 h-11 p-1 bg-gray-500/20 rounded-lg backdrop-blur-md">
          <Input className="w-50 bg-white" placeholder='Room Code' onChange={e => setRoomName(e.target.value)}></Input>
        </div>
        <Button className="text-black bg-orange-400 hover:bg-orange-500 hover:cursor-pointer shadow-md hover:shadow-lg" onClick={() => {
          window.location.href = `/quiz/?room=${roomName}&username=${username}`;
        }}>
          Join Room as Guest
        </Button>
      </div>
    </div>
  );
}

export default Login;
