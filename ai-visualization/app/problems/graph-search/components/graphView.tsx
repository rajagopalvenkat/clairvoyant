import {Graph} from "@/lib/graphs/graph"
import { renderValue } from "@/lib/strings/pretty"

export default function GraphView({graph, logData, stepIndex, totalSteps, resetHandler, stepHandler, solveHandler}: {
    graph: Graph | null,
    logData: any,
    stepIndex: number,
    totalSteps: number,
    resetHandler: () => void,
    stepHandler: (delta: number) => void,
    solveHandler: () => void
    }) {
    const stringifySteps = () => {
        return `${stepIndex}/${totalSteps}`
    }

    return ( 
    <div className="flex flex-col h-full">
        <p className="flex-grow">
            {graph?.stringify().split("\n").map((ln,idx) => {return (<span key={idx}>{ln}<br/></span>)}) ?? "Loading..."}
            {graph?.getRender()}
        </p>
        {logData !== undefined && logData !== null ? (<div className="flex flex-row items-stretch">
            {renderValue(logData)}
        </div>) : <></>}
        <div className="flex flex-row items-center w-full">
            <div className="flex-grow"></div> {/* Spacer */}
            <button className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 mx-2 rounded" onClick={() => {resetHandler()}}>Reset</button>
            <button className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 mx-2 rounded" onClick={() => {stepHandler(-1)}}>Step Back</button>
            <div>{stringifySteps()}</div>
            <button className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 mx-2 rounded" onClick={() => {stepHandler(1)}}>Step Forward</button>
            <button className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 mx-2 rounded" onClick={() => {solveHandler()}}>Solve</button>
        </div>
    </div>
    )
}