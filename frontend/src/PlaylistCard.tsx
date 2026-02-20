import { Link } from "react-router"

export interface Playlist {
  id: number,
  title: string,
  image_link: string
}

function PlaylistCard(props: { playlist: Playlist }) {
  return (
    <Link to={`/quiz/?playlist_id=${props.playlist.id}`}>
      <div style={{ backgroundImage: `url(${props.playlist.image_link})` }} className="bg-cover rounded-xl border-lighterblue border-6 hover:border-corange hover:text-beige w-60 h-60 flex justify-center items-center text-corange">
        <span className="p-1 bg-white/50 backdrop-blur-md rounded-lg text-2xl font-bold text-lighterblue text-center">{props.playlist.title}</span>
      </div>
    </Link>
  )
}


export default PlaylistCard