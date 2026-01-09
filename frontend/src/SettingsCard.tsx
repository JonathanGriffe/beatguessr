import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { ButtonGroup } from "./components/ui/button-group";
import { Slider } from "./components/ui/slider";
import type { Settings } from "./lib/types";

export interface SettingsCardProps {
    settingsRef: React.RefObject<Settings>;
    setVolume: (value: number[]) => void;
    roomStatus: string;

}
export default function SettingsCard({ settingsRef, setVolume, roomStatus }: SettingsCardProps) {
    const [roundTimerValue, setRoundTimerValue] = useState(settingsRef.current.roundTimer ?? 25);
    const [modeValue, setModeValue] = useState(settingsRef.current.mode ?? 'casual');
    const bubbleRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const updateBubble = (val: number) => {
        if (bubbleRef.current && trackRef.current) {
            const percent = (val - 10) / 50;
            const bubbleWidth = bubbleRef.current.offsetWidth;
            const trackWidth = trackRef.current.offsetWidth;
            const leftPx = percent * trackWidth - percent * bubbleWidth;
            bubbleRef.current.style.left = `${leftPx}px`;
        }
    };

    const buttonStyle = (isSelected: boolean) => {
        if (isSelected) {
            return "bg-greenblue text-white hover:bg-greenblue";
        } else {
            return "bg-white text-greenblue hover:bg-gray-200";
        }
    }

    const setMode = (mode: 'casual' | 'training') => {
        setModeValue(mode);
        settingsRef.current.mode = mode;
    }

    useEffect(() => {
        updateBubble(roundTimerValue);
    })

    return (
        <div className="h-60 w-110 border-5 border-greenblue rounded-xl flex flex-col justify-center items-center p-5 gap-5 text-darkblue font-bold relative">
            <span className="absolute top-0 font-bold text-2xl">Settings</span>
            <div className="w-full flex flex-col justify-center items-center gap-1">
                <span className="font-light text-md">Volume</span>
                <Slider
                    defaultValue={[settingsRef.current.volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={setVolume}
                />
            </div>
            {
                roomStatus !== 'follower' &&
                <>
                    <div className="w-full flex flex-col justify-center items-center relative pb-7">
                        <div className="flex w-full justify-between items-end" ref={trackRef}>
                            <span>10</span>
                            <span className="font-light text-md mb-1">Quiz timer</span>
                            <span>60</span>
                        </div>
                        <Slider
                            defaultValue={[settingsRef.current.roundTimer]}
                            min={10}
                            max={60}
                            step={5}
                            onValueChange={(v) => {
                                const newVal = v[0];
                                setRoundTimerValue(newVal);
                                settingsRef.current.roundTimer = newVal;
                                updateBubble(newVal);
                            }}
                        />
                        <div ref={bubbleRef} className="absolute bottom-0">{roundTimerValue}</div>

                    </div></>
            }
            <div className="h-9">
                {roomStatus === 'none' &&
                    <ButtonGroup>
                        <Button className={buttonStyle(modeValue === "casual")} onClick={() => setMode('casual')}>Casual</Button>
                        <Button className={buttonStyle(modeValue === "training")} onClick={() => setMode('training')}>Training</Button>
                    </ButtonGroup>}
            </div>
        </div >
    )
}
