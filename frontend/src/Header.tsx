import { Music } from 'lucide-react';
import { Link } from 'react-router';

function Header() {
    return <header className="flex flex-row justify-left items-center bg-cred text-darkblue font-bold text-2xl">
        <Link to='/' className="flex flex-row p-1 items-center">
            <Music size="40"/>
            <h1>BeatGuessr</h1>
        </Link>
    </header>
}

export default Header