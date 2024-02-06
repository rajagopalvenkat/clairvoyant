"use client"

import Header from "@/app/components/header";
import GraphView from "./components/graphView";
import SolutionEditor from "@/app/components/data/solutionEditor";
import ProblemEditor from "@/app/components/data/problemEditor";
import { Graph, GridGraph } from "@/lib/graphs/graph";
import { useState } from "react";

export default function GraphSearchPage() {
    const defaultGraph = GridGraph.parseGraph(
        `GRID 5x5
        0 1 1 1 0
        0 1 0 1 0
        1 1 0 1 0
        0 1 1 1 0
        0 1 0 1 1
        START 1 0
        GOAL 4 4
        `
    )
    let [graph, setGraph] = useState(defaultGraph);
    
    return (
        <div className="flex flex-col h-dvh">
            <Header selectedPage="graphsearch"></Header>
            <div className="flex flex-row items-stretch flex-grow">
                <div className="flex flex-col justify-stretch">
                    <div className="flex-grow">
                        <SolutionEditor></SolutionEditor>
                    </div>
                    <div className="flex-grow">
                        <ProblemEditor></ProblemEditor>
                    </div>
                </div>
                <div className="p-3 m-2 rounded-md border-accent dark:border-accent-dark border-solid border flex-grow">
                    <GraphView graph={graph}></GraphView>
                </div>
            </div>
        </div>
    )
}