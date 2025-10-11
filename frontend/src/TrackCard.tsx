import { useEffect, useState } from "react";
import type { Track } from "./lib/types";

function TrackCard (props: {track?: Track, timerLength: number}) {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        setTimer(props.timerLength);
        const timerId = setInterval(() => {
            setTimer((prev) => {
                if (prev > 0) {
                    return prev - 1;
                }
                return 0;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [props.timerLength]);

    return (
        <div className="h-80 w-140 border-2 border-corange rounded-xl flex flex-col justify-center items-center p-5">
            {props.track ?
            <div className="flex flex-row w-full h-2/3">
                <img src={props.track.image_link} className="h-full rounded-lg p-5" />
                <div className="flex flex-col justify-center p-5 gap-5 text-darkblue font-bold">
                    <p>{props.track.title}</p>
                    <p>{props.track.artist}</p>
                </div>
            </div>
            : 
            <div className="flex flex-row w-full h-2/3 justify-center items-center">
                <span className="justify-center">Currently guessing...</span>
            </div>
        }
            <div className="flex flex-col items-center h-1/3">
                <p>{props.track ? "Next round in" : "Rounds ends in"}</p>
                <p className="text-greenblue font-bold text-4xl">{timer}</p>
            </div>
        </div>
    )
}

export default TrackCard