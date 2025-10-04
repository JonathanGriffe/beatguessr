import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => {
          window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_BACKEND_URL}/api/callback`;
        }}>
          Login with Spotify
        </button>
      </header>
    </div>
  );
}

export default App;
