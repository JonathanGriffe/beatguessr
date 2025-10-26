import { useEffect, useState } from 'react';
import './Login.css';
import { Button } from './components/ui/button';
import { Spinner } from './components/ui/spinner';

function Login() {
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    fetch('/api/accounts/client_id/').then(res => res.json()).then(data => {
      setClientId(data.client_id);
    });
  }, []);

  const scopes = 'user-read-playback-state user-modify-playback-state user-library-read user-library-modify streaming user-read-email user-read-private playlist-read-private playlist-modify-public playlist-modify-private';
  return (
    <div className="flex items-center justify-center min-h-screen">
      {clientId ?
        <Button className="bg-corange" onClick={() => {
          window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${window.location.origin}/callback/`;
        }}>
          Login with Spotify
        </Button> : <Spinner />
      }
    </div>
  );
}

export default Login;
