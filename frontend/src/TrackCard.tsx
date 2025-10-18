import { Skeleton } from "./components/ui/skeleton";
import type { Track } from "./lib/types";

function TrackCard (props: { track: Track }) {
    return (
        <div className="h-60 w-140 border-5 border-corange rounded-xl flex flex-col justify-center items-center p-5 text-darkblue font-bold">
            <div className="flex flex-row w-full h-full">
                <div className="h-full aspect-square">
                    { props.track.image_link ? <img src={props.track.image_link} /> : <Skeleton className="h-full bg-[#e0c7a8]"/>}
                </div>
                <div className="flex flex-col justify-center gap-15 pl-5 w-full">
                    <div className="h-5">
                        { props.track.title ? <p>{props.track.title}</p> : <Skeleton className="h-full bg-[#e0c7a8]"/> }
                    </div>
                    <div className="h-5">
                        { props.track.artist ? <p>{props.track.artist}</p> : <Skeleton className="h-full bg-[#e0c7a8]"/> }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackCard