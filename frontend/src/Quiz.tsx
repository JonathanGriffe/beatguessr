import { useSearchParams } from 'react-router';
import './Quiz.css';
import WebPlayback from './WebPlayback';

function Quiz() {
  const [queryParams] = useSearchParams();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <WebPlayback playlist_id={queryParams.get("playlist_id")}/>
    </div>
  );
}

export default Quiz;

