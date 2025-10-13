import { useState, useEffect } from 'react';
import { get, post } from './utils/utils';
import { useNavigate } from 'react-router';
import './App.css';
import { Button } from './components/ui/button';
import PlaylistSelector from './PlaylistSelector';

interface UserData {
  name: string;
  question_count: number;
  song_count: number;
}


function App() {
  const navigate = useNavigate();
  let [UserData, setUserData] = useState<UserData | null>(null);

  function logout() {
    post(`/api/accounts/logout/`, navigate).then(() => navigate('/login'));
  }

  useEffect(() => {
    get(`/api/accounts/user/`, navigate).then(res => res.json())
    .then(data => setUserData(data));
  }, []);
  return (
    <div className="flex h-screen min-w-screen gap-10 items-center justify-center p-10">
      <PlaylistSelector/>
      <div className="border-2 border-cred flex flex-col gap-4 ml-auto  mr-10 p-4 rounded-lg">
        <h1 className="font-bold inline text-greenblue text-5xl">{UserData?.name}</h1>
        <div className="flex flex-col items-center">
          <span className="font-light text-md">Rounds played</span>
          <span className="font-bold text-lg">{UserData?.question_count}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-light text-md">Unique songs guessed</span>
          <span className="font-bold text-lg">{UserData?.song_count}</span>
        </div>
        <Button className="bg-cred" onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}

export default App;
