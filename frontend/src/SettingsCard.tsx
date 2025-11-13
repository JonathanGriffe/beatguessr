import { Slider } from "./components/ui/slider";
import type { Settings } from "./lib/types";

export default function SettingsCard(props: { settings: Settings, setVolume: (value: number[]) => void }) {

    return (
        <div className="h-60 w-140 border-5 border-greenblue rounded-xl flex flex-col justify-center items-center p-5 text-darkblue font-bold">
            <div className="w-full flex flex-col justify-center items-center gap-1">
                <span className="font-light text-md">Volume</span>
                <Slider
                    defaultValue={[props.settings.volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={props.setVolume}
                />
            </div>
        </div>
    )
}
