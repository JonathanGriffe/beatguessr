import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import './App.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import PlaylistSelector from './PlaylistSelector';
import { get, post } from './utils/utils';

interface UserData {
  name: string;
  question_count: number;
  song_count: number;
}


function App() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  let [UserData, setUserData] = useState<UserData | null>(null);

  function logout() {
    post(`/api/accounts/logout/`, navigate).then(() => navigate('/login'));
  }

  function joinRoom() {
    const roomCode = inputRef.current?.value;
    if (roomCode) {
      navigate(`/quiz/?room=${roomCode}`);
    }
  }

  useEffect(() => {
    get(`/api/accounts/user/`, navigate).then(res => res.json())
      .then(data => setUserData(data));
  }, []);
  return (
    <div className="flex h-screen min-w-screen gap-10 items-center justify-center p-10">
      <div className="w-full flex flex-col m-15 gap-5">
        <div className="h-10 flex flex-row">
          <Input className="w-50 text-white bg-cred" placeholder='Room Code' ref={inputRef}></Input>
          <Button onClick={joinRoom} className="w-30 bg-corange hover:cursor-pointer p-4">Join Room</Button>
        </div>
        <PlaylistSelector />
      </div>
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
    </div >
  );
}

export default App;
