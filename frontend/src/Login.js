import './Login.css';

function Login() {
  return (
    <div className="Login">
      <header className="Login-header">
        <button onClick={() => {
          window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${window.location.origin}/callback/`;
        }}>
          Login with Spotify
        </button>
      </header>
    </div>
  );
}

export default Login;
