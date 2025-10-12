import type { Track } from "./lib/types";

function TrackCard (props: {track?: Track}) {
    return (
        <div className="h-60 w-140 border-5 border-corange rounded-xl flex flex-col justify-center items-center p-5 text-darkblue font-bold">
            {props.track ?
            <div className="flex flex-row w-full h-full">
                <img src={props.track.image_link} className="h-full rounded-lg" />
                <div className="flex flex-col justify-center gap-5 pl-5">
                    <p>{props.track.title}</p>
                    <p>{props.track.artist}</p>
                </div>
            </div>
            : 
            <span className="justify-center">Currently guessing...</span>
        }
        </div>
    )
}

export default TrackCard