import { useState, useEffect } from 'react';
import './App.css';
import { successOrRedirect } from './utils/utils';
import { useNavigate } from 'react-router';

function App() {
  const navigate = useNavigate();
  let [name, setName] = useState("...");
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/`, {
      method: 'GET',
      credentials: 'include',
    }).then(successOrRedirect(navigate)).then(res => res.json())
    .then(data => setName(data.name)).catch(err => console.error(err));
  });

  return (
    <div className="App">
      <header className="App-header">
        LOGGED IN AS {name}
      </header>
    </div>
  );
}

export default App;
