import { Button, IconButton, IconButtonPropsColorOverrides } from "@mui/material"
import PlayIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import StepIcon from '@mui/icons-material/Redo';
import { OverridableStringUnion } from '@mui/types';

type ButtonSizeType = "small" | "medium" | "large";
type ButtonColorType = OverridableStringUnion<"inherit" | "success" | "primary" | "default" | "secondary" | "error" | "info" | "warning", IconButtonPropsColorOverrides> | undefined

export default function PlayControls({play, stop, step, playing, color="primary", buttonSizes = "small"}: {
    play: () => void,
    stop: () => void,
    step?: () => void,
    playing: boolean,
    color?: ButtonColorType,
    buttonSizes?: ButtonSizeType
}) {
    return <div className="flex flex-row gap-1 p-2">
        {playing 
            ? <IconButton onClick={stop} size={buttonSizes} color={color} aria-label="Pause"><PauseIcon/></IconButton>
            : <IconButton onClick={play} size={buttonSizes} color={color} aria-label="Play"><PlayIcon/></IconButton>
        }
        {step
            ? <IconButton onClick={step} size={buttonSizes} color={color} aria-label="Step"><StepIcon/></IconButton>
            : <></>
        }
    </div>
}