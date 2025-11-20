import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import type { Playlist } from "./PlaylistCard";
import PlaylistCard from "./PlaylistCard";
import PlaylistImporterCard from "./PlaylistImporter";
import { get } from "./utils/utils";

function PlaylistSelector() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<{ [key: string]: Playlist[] }>({});


    const addPlaylist = (playlist: Playlist) => {
        setCategories((prevCategories) => {
            return {
                ...prevCategories,
                "My Playlists": [...prevCategories["My Playlists"], playlist]
            }

        })
    }

    const sortCategories = (values: string[]) => {
        return values.sort((a, b) => {
            if (a === "My Playlists") return 1;
            if (b === "My Playlists") return -1;
            return 0;
        });
    }

    useEffect(() => {
        get(`/api/quiz/playlists/`, navigate).then(res => res.json()).then(data => {
            if (!("My Playlists" in data)) {
                data["My Playlists"] = [];
            }
            setCategories(data);
        })
    }, []);

    return (<div className="h-160 rounded-2xl border-8 border-cred p-4">
        {Object.keys(categories).length > 0 &&
            <Tabs defaultValue={sortCategories(Object.keys(categories))[0]}>
                <TabsList className="bg-greenblue">
                    {sortCategories(Object.keys(categories)).map((category) => (
                        <TabsTrigger key={category} value={category} className="text-beige data-[state=active]:bg-cred">{category}</TabsTrigger>
                    ))}
                </TabsList>
                {Object.entries(categories).map(([name, playlists]) => (
                    <TabsContent key={name} value={name} className="flex flex-wrap gap-4">
                        {playlists.map((playlist) => (
                            <PlaylistCard key={playlist.id} playlist={playlist} />
                        ))}
                        {(name === "My Playlists" && playlists.length < 10) &&
                            <PlaylistImporterCard addPlaylist={addPlaylist} />
                        }
                    </TabsContent>
                ))}
            </Tabs>}
    </div>
    )
}

export default PlaylistSelector;