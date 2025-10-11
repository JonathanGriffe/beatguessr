import { useState, useEffect } from 'react';
import { successOrRedirect } from './utils/utils';
import { useNavigate } from 'react-router';
import WebPlayback from './WebPlayback';
import './App.css';

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
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
      <div className="text-6xl text-darkblue"><span>
        Logged in as </span><h1 className="font-bold inline text-greenblue">{name}</h1>
      </div>
      <>{ token ? <WebPlayback token={token} /> : '' }</>
    </div>
  );
}

export default App;
