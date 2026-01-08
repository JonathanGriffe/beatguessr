import { Music } from 'lucide-react';
import { Link } from 'react-router';

function Header() {
    return <header className="flex flex-row justify-left items-center bg-beige text-darkblue font-bold text-2xl border-b-2 border-lighterblue pl-6">
        <Link to='/' className="flex flex-row p-1 items-center">
            <Music size="40" />
            <h1>Beat<span className="text-greenblue">G</span>uessr</h1>
        </Link>
    </header>
}

export default Header