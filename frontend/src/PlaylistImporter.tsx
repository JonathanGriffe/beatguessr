import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Spinner } from "./components/ui/spinner";
import { post } from "./utils/utils";

const PlaylistImporterCard = (props: { addPlaylist: (playlist: any) => void }) => {
    const navigate = useNavigate();

    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleImport = () => {
        if (!inputValue) return;

        const playlist_id = inputValue.trim();
        setLoading(true);
        post(`/api/quiz/playlist/`, navigate, { 'Content-Type': 'application/json' },
            {
                playlist_id: playlist_id,
            }
        ).then(res => {
            setInputValue('');
            setLoading(false);
            if (res.status === 200) {
                res.json().then(playlist => {
                    props.addPlaylist(playlist);
                })
            }
        });
    };

    return (
        <div className="rounded-xl border-lighterblue border-6 bg-beige w-60 h-60 flex flex-col items-center justify-center text-cyan">
            {loading ? <Spinner className="w-1/3 h-1/3" /> :
                <div className="p-10 flex flex-col items-center justify-center w-full h-full gap-20">
                    <div className="flex w-52 h-11 p-1 bg-gray-500/20 rounded-lg backdrop-blur-md">
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder="Playlist id"
                            className="w-full px-3 py-2 text-base bg-white"
                        />
                    </div>
                    <Button onClick={handleImport} className="w-full text-black bg-orange-400 hover:bg-orange-500 hover:cursor-pointer shadow-md hover:shadow-lg">
                        Import
                    </Button>
                </div>
            }
        </div>
    );
};

export default PlaylistImporterCard;
