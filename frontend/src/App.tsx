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
    <div className="flex h-screen min-w-screen gap-10 items-center justify-center p-10 bg">
      <div className="w-full flex flex-col m-15 gap-5">
        <div className="flex flex-row gap-3 items-center h-11">
          <div className="flex w-52 h-11 p-1 bg-gray-500/20 rounded-lg backdrop-blur-md">
            <Input className=" h-full w-50 bg-white" placeholder='Room Code' ref={inputRef}></Input>
          </div>
          <Button onClick={joinRoom} className="w-30 h-10 text-black bg-orange-400 hover:bg-orange-500 hover:cursor-pointer shadow-md hover:shadow-lg">Join Room</Button>
        </div>
        <PlaylistSelector />
      </div>
      <div className="border-6 border-cpurple flex flex-col gap-4 ml-auto  mr-10 p-4 rounded-lg">
        <h1 className="font-bold inline text-lighterblue text-5xl">{UserData?.name}</h1>
        <div className="flex flex-col items-center">
          <span className="font-light text-md">Rounds played</span>
          <span className="font-bold text-lg">{UserData?.question_count}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-light text-md">Unique songs guessed</span>
          <span className="font-bold text-lg">{UserData?.song_count}</span>
        </div>
        <Button className="bg-purple-800 hover:bg-purple-900 hover:cursor-pointer" onClick={logout}>Logout</Button>
      </div>
    </div >
  );
}

export default App;
