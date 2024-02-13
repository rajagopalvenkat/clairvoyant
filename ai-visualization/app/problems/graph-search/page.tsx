"use client"

import Header from "@/app/components/header";
import GraphView from "./components/graphView";
import SolutionEditor from "@/app/components/data/solutionEditor";
import CaseEditor from "@/app/components/data/problemEditor";
import { Graph, GridGraph } from "@/lib/graphs/graph";
import { useState } from "react";
import { ensureError } from "@/lib/errors/error";
import { VDivider } from "@/app/components/divider";

const init_graph : Graph | null = null;

export default function GraphSearchPage() {
    let [graph, setGraph] = useState(init_graph);
    let [graphErrorMessage, setGraphErrorMessage] = useState("")
    function onGraphDataChanged(rawData: string) {
        setGraphData(rawData);
        try {
            setGraph(Graph.parseGraph(rawData));
            setGraphErrorMessage("");
        }
        catch (err) {
            let error = ensureError(err);
            setGraphErrorMessage(error.message);
        }
    }
    let [graphData, setGraphData] = useState("");
    let [leftWidth, setLeftWidth] = useState(480);

    return (
        <div className="flex flex-col h-dvh">
            <Header selectedPage="graphsearch"></Header>
            <div className="flex flex-row items-stretch flex-grow">
                <div className="flex flex-col justify-stretch" style={{"width": `${leftWidth}px`}}>
                    <div className="flex-grow">
                        <SolutionEditor problem={"graph-search"}></SolutionEditor>
                    </div>
                    <div className="flex-grow">
                        <CaseEditor problem={"graph-search"} caseData={graphData} onCaseDataChanged={onGraphDataChanged} errorMessage={graphErrorMessage}></CaseEditor>
                    </div>
                </div>
                <VDivider onWidthChangeRequest={(v => {
                    setLeftWidth(leftWidth + v);
                })}></VDivider>
                <div className="p-3 m-2 rounded-md border-accent dark:border-accent-200 border-solid border flex-grow">
                    <GraphView graph={graph}></GraphView>
                </div>
            </div>
        </div>
    )
}