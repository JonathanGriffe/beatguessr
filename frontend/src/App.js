import { useState, useEffect } from 'react';
import './App.css';
import { successOrRedirect } from './utils/utils';
import { useNavigate } from 'react-router';
import WebPlayback from './WebPlayback';

function App() {
  const navigate = useNavigate();
  let [name, setName] = useState("...");
  let [token, setToken] = useState(null);

  useEffect(() => {
    fetch(`/api/accounts/refresh/`, {
      method: 'GET',
      credentials: 'include',
    }).then(successOrRedirect(navigate)).then(res => res.json())
    .then(data => setToken(data.access_token)).catch(err => console.error(err));

    fetch(`/api/accounts/user/`, {
      method: 'GET',
      credentials: 'include',
    }).then(successOrRedirect(navigate)).then(res => res.json())
    .then(data => setName(data.name)).catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        LOGGED IN AS {name}
      </header>
      <>{ token ? <WebPlayback token={token} /> : '' }</>
    </div>
  );
}

export default App;
