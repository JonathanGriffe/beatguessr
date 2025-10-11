import { useEffect } from 'react';
import { get } from './utils/utils';
import { useNavigate } from 'react-router';

function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
            
        if (code) {
            // Exchange the authorization code for an access token
            get(`/api/accounts/callback/?code=${code}`, navigate, {'Content-Type': 'application/json'}).then(res => res.json()).then(() => {
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
