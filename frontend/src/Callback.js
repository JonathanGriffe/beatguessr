import { useEffect } from 'react';
import './Callback.css';
import { successOrRedirect } from './utils/utils';
import { useNavigate } from 'react-router';

function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
            
        if (code) {
            // Exchange the authorization code for an access token
            fetch(`${process.env.REACT_APP_BACKEND_URL}/accounts/callback?code=${code}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(successOrRedirect(navigate)).then(res => res.json()).then(() => {
                navigate('/');
            });
        }
    });

    return (
        <div className="Callback">
      <header className="Callback-header">
        LOGGING IN...
      </header>
    </div>
  );
}

export default Callback;
