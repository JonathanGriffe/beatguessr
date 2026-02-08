import { useRef, useState } from 'react';
import './Login.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { post } from './utils/utils';


function Login() {
  const [errorLabel, setErrorLabel] = useState<string | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const event = e.nativeEvent as SubmitEvent;
    const buttonName = (event.submitter as HTMLButtonElement).name;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    post(`/api/accounts/${buttonName}/`, null,
      { 'Content-Type': 'application/json' }, { username, password },).then(res => {
        if (res.status < 400) {
          window.location.href = '/';
        } else {
          res.json().then(data => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            setErrorLabel(data.error);
            timeoutRef.current = setTimeout(() => setErrorLabel(null), 3000);
          })
        }
      });
  };

  const guestLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    fetch(`/api/accounts/guest_user/?guest_username=${username}`).then(res => {
      if (res.status === 200) {
        window.location.href = `/?guest_username=${username}`;
      }
    });
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-15">
      <form className="flex flex-col w-50 gap-1" onSubmit={handleLogin}>
        <div className="h-5">
          <Label className="text-sm text-red-500">{errorLabel}</Label>
        </div>
        <div className="h-11 p-1 bg-gray-500/20 rounded-lg backdrop-blur-md">
          <Input name="username" placeholder='Username' className=" bg-white border-4 border-amber-50/0 backdrop-blur-sm" required />
        </div>
        <div className="h-11 p-1 bg-gray-500/20 rounded-lg backdrop-blur-md">
          <Input name="password" type="password" className="bg-white border-4 border-amber-50/0 backdrop-blur-sm" required />
        </div>
        <div className="flex flex-row gap-1">
          <Button name="login" type="submit" className='flex-1 text-black bg-purple-500 hover:bg-purple-600 hover:cursor-pointer shadow-lg hover:shadow-xl'>Login</Button>
          <Button name="signup" type="submit" className='flex-1 border-2 border-purple-600 text-black bg-purple-200 hover:bg-purple-300 hover:cursor-pointer shadow-lg hover:shadow-xl hover:border-purple-800'>Sign Up</Button>
        </div>
      </form>

      <span>or</span>
      <form className="flex flex-col items-center justify-center gap-1 w-50" onSubmit={guestLogin}>
        <div className="h-11 p-1 bg-gray-500/20 rounded-lg backdrop-blur-md">
          <Input className="bg-white border-4 border-amber-50/0 backdrop-blur-sm" placeholder='Username' required name="username"></Input>
        </div>
        <Button type="submit" className="w-full text-black bg-orange-400 hover:bg-orange-500 hover:cursor-pointer shadow-lg hover:shadow-xl">
          Continue as Guest
        </Button>
      </form>
    </div >
  );
}

export default Login;
