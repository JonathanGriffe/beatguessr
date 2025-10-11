import './Login.css';
import { Button } from './components/ui/button';

function Login() {
  const scopes = 'user-read-playback-state user-modify-playback-state user-library-read streaming user-read-email user-read-private';
  return (
    <div className="Login">
      <header className="Login-header">
        <Button onClick={() => {
          window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&scope=${scopes}&redirect_uri=${window.location.origin}/callback/`;
        }}>
          Login with Spotify
        </Button>
      </header>
    </div>
  );
}

export default Login;
