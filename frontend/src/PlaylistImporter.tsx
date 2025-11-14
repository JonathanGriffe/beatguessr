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
            setLoading(false);
            if (res.status === 200) {
                res.json().then(playlist => {
                    props.addPlaylist(playlist);
                })
            }
        });
    };

    return (
        <div className="rounded-xl border-corange border-2 bg-beige w-60 h-60 flex flex-col items-center justify-center text-cyan">
            {loading ? <Spinner className="w-1/3 h-1/3" /> :
                <div className="p-10 flex flex-col items-center justify-center w-full h-full gap-20">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Input your playlist id"
                        className="w-full px-3 py-2 text-base bg-white"
                    />
                    <Button onClick={handleImport} className="bg-corange cursor-pointer hover:text-corange text-darkblue w-full">
                        Import
                    </Button>
                </div>
            }
        </div>
    );
};

export default PlaylistImporterCard;
