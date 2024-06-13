"use client"

import Header from "@/app/components/header";
import TreeView from "./components/treeView";
import SolutionEditor from "@/app/components/data/solutionEditor";
import CaseEditor from "@/app/components/data/problemEditor";
import { Graph, GridGraph } from "@/lib/graphs/graph";
import { GraphSearchResult, GraphSearchSolution, buildGraphSearchSolution } from "@/lib/graphs/graphsolution"; // Import the missing class
import { useCallback, useState } from "react";
import { ensureError } from "@/lib/errors/error";
import { HDivider, VDivider } from "@/app/components/divider";
import { toast } from "react-toastify";
import Canvas from "@/app/components/graphics/canvas";

export default function GraphSearchPage() {
    let [leftWidth, setLeftWidth] = useState(480);
    let [solHeight, setSolHeight] = useState(520);
    let [caseErrorMessage, setCaseErrorMessage] = useState("");
    let [algoErrorMessage, setAlgoErrorMessage] = useState("");
    let [debugData, setDebugData] = useState<any>(null);
    let [algoData, setAlgoData] = useState("");
    let [caseData, setCaseData] = useState("");
    let [canvasDraw, setCanvasDraw] = useState<(ctx: CanvasRenderingContext2D) => void>((_) => {});
    let [graph, setGraph] = useState<Graph | null>(null);

    function runAlgo() {
        // Try to parse and run the code from case
        // Try to parse and run the code from algorithm
        // If successful, store the relevant classes
    }

    const onCaseDataChanged = useCallback((rawData: string) => {
        setCaseData(rawData);
        setCaseErrorMessage("");
        // For this problem, this is code that runs with the algorithm
    }, []);

    const onAlgoDataChanged = useCallback((rawData: string) => {
        setAlgoData(rawData);
        setAlgoErrorMessage("");
    },[]);

    return (
        <div className="flex flex-col h-dvh">
            <Header selectedPage="adversarialsearch"></Header>
            <div className="flex flex-row items-stretch flex-grow">
                <div className="flex flex-col justify-stretch" style={{"width": `${leftWidth}px`}}>
                    <SolutionEditor solutionHeight={solHeight} problem={"adversarial-search"} onSolutionChanged={onAlgoDataChanged} runner={runAlgo} errorMessage={algoErrorMessage}></SolutionEditor>
                    <HDivider onWidthChangeRequest={function (v: number): void {
                        setSolHeight(solHeight + v);
                    } }></HDivider>
                    <CaseEditor problem={"adversarial-search"} caseData={caseData} onCaseDataChanged={onCaseDataChanged} errorMessage={caseErrorMessage}></CaseEditor>
                </div>
                <VDivider onWidthChangeRequest={(v => {
                    setLeftWidth(leftWidth + v);
                })}></VDivider>
                <div className="p-3 m-2 rounded-md border-accent dark:border-accent-200 border-solid border flex-grow">
                    <div>
                        <TreeView graph={graph}></TreeView>
                    </div>
                    <div className="relative w-1/2 h-full">
                        <Canvas className="absolute left-0 top-0 right-0 bottom-0" draw={canvasDraw} width={500} height={500}></Canvas>
                        <div className="absolute left-0 top-0 right-0 bottom-0" id="gameDiv"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}