"use client"

import Header from "@/app/components/header";
import GraphView from "./components/graphView";
import SolutionEditor from "@/app/components/data/solutionEditor";
import CaseEditor from "@/app/components/data/problemEditor";
import { Graph, GridGraph } from "@/lib/graphs/graph";
import { useState } from "react";

const init_graph : Graph | null = null;

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
    let [graph, setGraph] = useState(init_graph);
    
    return (
        <div className="flex flex-col h-dvh">
            <Header selectedPage="graphsearch"></Header>
            <div className="flex flex-row items-stretch flex-grow">
                <div className="flex flex-col justify-stretch">
                    <div className="flex-grow">
                        <SolutionEditor problem={"graph-search"}></SolutionEditor>
                    </div>
                    <div className="flex-grow">
                        <CaseEditor problem={"graph-search"}></CaseEditor>
                    </div>
                </div>
                <div className="p-3 m-2 rounded-md border-accent dark:border-accent-200 border-solid border flex-grow">
                    <GraphView graph={graph}></GraphView>
                </div>
            </div>
        </div>
    )
}