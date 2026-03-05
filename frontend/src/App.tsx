import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import './App.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
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

  const [roomErrorLabel, setRoomErrorLabel] = useState<string | null>(null);
  const roomTimeoutRef = useRef<number | undefined>(undefined);

  const searchParams = new URLSearchParams(window.location.search);
  const guestUsername = searchParams.get('guest_username');

  function logout() {
    post(`/api/accounts/logout/`, navigate).then(() => navigate('/login'));
  }

  function joinRoom() {
    const roomCode = inputRef.current?.value;
    if (roomCode) {
      fetch(`/api/quiz/room/?room=${roomCode}`).then(res => {
        if (res.status === 404) {
          setRoomErrorLabel("Room not found");
          if (roomTimeoutRef.current) {
            clearTimeout(roomTimeoutRef.current);
          }
          roomTimeoutRef.current = setTimeout(() => setRoomErrorLabel(null), 3000);
        } else if (res.status === 200) {
          navigate(`/quiz/?room=${roomCode}`);
        }
      });
    }
  }

  useEffect(() => {
    if (!guestUsername) {
      get(`/api/accounts/user/`, navigate).then(res => res.json())
        .then(data => setUserData(data));
    }
  }, []);
  return (
    <div className="flex flex-col-reverse md:flex-row h-screen min-w-screen gap-3 md:gap-10 items-center justify-start p-5 pb-0 pt-20 md:p-10 bg">
      <div className="w-full flex flex-col m-2 md:m-15 gap-3 md:gap-5">
        <div className="w-full flex flex-col">
          <div className="h-5">
            <Label className="text-sm text-red-500">{roomErrorLabel}</Label>
          </div>
          <div className="flex flex-row gap-3 items-center h-11">
            <div className="flex w-52 h-11 p-1 bg-gray-500/20 rounded-lg backdrop-blur-md">
              <Input className=" h-full w-50 bg-white" placeholder='Room Code' ref={inputRef}></Input>
            </div>
            <Button onClick={joinRoom} className="w-30 h-10 text-black bg-orange-400 hover:bg-orange-500 hover:cursor-pointer shadow-md hover:shadow-lg">Join Room</Button>
          </div>

        </div>
        <PlaylistSelector authenticated={!guestUsername} />
      </div>
      <div className="border-3 md:border-6 border-cpurple flex flex-col gap-4 ml-auto md:mr-10 p-4 rounded-lg w-92 md:w-100 items-center">
        <h1 className="font-bold inline text-lighterblue text-4xl overflow-hidden">{UserData?.name}</h1>
        <div className="flex flex-row md:flex-col items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="font-light text-md">Rounds played</span>
            <span className="font-bold text-lg">{UserData?.question_count}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-light text-md">Unique songs guessed</span>
            <span className="font-bold text-lg">{UserData?.song_count}</span>
          </div>
        </div>
        <Button className="bg-purple-800 hover:bg-purple-900 hover:cursor-pointer" onClick={logout}>Logout</Button>
      </div>
    </div >
  );
}

export default App;
