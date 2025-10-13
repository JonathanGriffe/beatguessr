import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { useEffect, useState } from "react";
import { get } from "./utils/utils";
import type { Playlist } from "./PlaylistCard";
import PlaylistCard from "./PlaylistCard";

function PlaylistSelector() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<{ [key: string]: Playlist[] }>([]);

    useEffect(() => {
        get(`/api/quiz/playlists/`, navigate).then(res => res.json()).then(data => {
        setCategories(data);
        })
    }, []);
    

    return (<div className="h-150 rounded-2xl border-8 border-cred p-4 flex-1 m-15">
        {Object.keys(categories).length > 0 && 
            <Tabs defaultValue={Object.keys(categories)[0]}>
                <TabsList className="bg-greenblue">
                    {Object.keys(categories).map((category) => (
                        <TabsTrigger key={category} value={category} className="text-beige data-[state=active]:bg-cred">{category}</TabsTrigger>
                    ))}
                </TabsList>
                {Object.entries(categories).map(([name, playlists]) => (
                    <TabsContent  key={name} value={name} className="flex flex-wrap gap-4">
                        {playlists.map((playlist) => (
                            <PlaylistCard key={playlist.id} playlist={playlist} />
                        ))}
                    </TabsContent>
                ))}
            </Tabs>}
    </div>
    )
}

export default PlaylistSelector;