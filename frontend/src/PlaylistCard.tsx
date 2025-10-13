import { Link } from "react-router"
import { Button } from "./components/ui/button"

export interface Playlist {
    id: number,
    title: string,
    image_link: string
}

function PlaylistCard (props: {playlist: Playlist}) {
    return (
        <Link to={`/quiz/?playlist_id=${props.playlist.id}`}>
          <Button className="rounded-xl border-corange border-2 bg-beige hover:bg-darkblue hover:text-beige w-60 h-60 flex flex-col text-corange">
            <img src={props.playlist.image_link} className="flex-1 min-w-full "/>
            <span>{props.playlist.title}</span>
          </Button>
        </Link>
    )
}


export default PlaylistCard