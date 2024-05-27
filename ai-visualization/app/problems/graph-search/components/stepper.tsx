import "./stepper.css"
import { range } from "@/lib/collections/arrays";
import { buttonStyleClassNames } from "@/lib/statics/styleConstants";
import { useState } from "react";

export default function Stepper({stepHandler, step, maxSteps}: {
    stepHandler: (step: number) => void,
    step: number,
    maxSteps: number
}) {
    const setStepAndNotify = (step: number) => {
        let s = Math.max(0, Math.min(step, maxSteps));
        stepHandler(s);
    }
    const onStepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let str = event.target.value;
        if (str === "") {setStepAndNotify(0); return;}
        let newStep = parseInt(str);
        if (isNaN(newStep)) {return;}        
        setStepAndNotify(newStep)
    }
    const onStepSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setStepAndNotify(step);
    }
    const onStepDelta = (delta: number) => {
        setStepAndNotify(step + delta);
    }

    let sliderClasses: string[] = [];
    let globalClasses: string[] = [];
    if (maxSteps == 0) {
        sliderClasses.push("slider-disabled");
        globalClasses.push("opacity-50");
    }

    return (
        <div className={`${globalClasses} flex flex-col`}>
            <div className="w-full flex justify-stretch">
                <input type="range"
                    min={0}
                    max={maxSteps}
                    value={step}
                    step={1}
                    onChange={(e) => setStepAndNotify(parseInt(e.target.value))}
                    className={`${sliderClasses.join(" ")} w-full h-8`}
                    >
                </input>
            </div>
            <div className="w-full flex justify-center">
                <button onClick={() => onStepDelta(-1)} className={`${buttonStyleClassNames} px-2 mx-1 text-xl`}>&laquo;</button>
                <input type="numeric" value={step} onChange={onStepChange} onSubmit={onStepSubmit} className="w-12 text-center bg-secondary-100 text-secondary-950 dark:bg-secondary-900 dark:text-secondary-50" />
                <button onClick={() => onStepDelta(+1)} className={`${buttonStyleClassNames} px-2 mx-1 text-xl`}>&raquo;</button>
            </div>
        </div>
    )
}