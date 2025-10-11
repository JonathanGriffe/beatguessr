import './Login.css';
import { Button } from './components/ui/button';

function Login() {
  const scopes = 'user-read-playback-state user-modify-playback-state user-library-read streaming user-read-email user-read-private';
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button className="bg-corange" onClick={() => {
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}&response_type=code&scope=${scopes}&redirect_uri=${window.location.origin}/callback/`;
      }}>
        Login with Spotify
      </Button>
    </div>
  );
}

export default Login;
