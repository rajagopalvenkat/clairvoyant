import { Graph, GridGraph, GenericGraph, GRIDGRAPH_SCALE_FACTOR } from "@/lib/graphs/graph"
import { renderValue } from "@/lib/strings/pretty"
import { useState } from "react";
import VisGraph, { GraphData, Options as VisGraphOptions } from "react-vis-graph-wrapper"
import Stepper from "./stepper";

function getVisOptions(graph: Graph | null = null): VisGraphOptions {
    let base = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 20
            },
            color: "white"
        },
        nodes: {
            font: '12px roboto black',
            scaling: {
                label: true
            },
            shape: 'circle'
        },
        physics: {
            barnesHut: {
                gravitationalConstant: -500,
                springConstant: 0.006,
                springLength: 35,
                centralGravity: 0.4,
            }
        },
        height: "100%",
    }
    if (graph instanceof GridGraph) {
        base.nodes.shape = 'box';
        base.physics = {
            barnesHut: {
                gravitationalConstant: 0,
                springConstant: 0,
                springLength: GRIDGRAPH_SCALE_FACTOR,
                centralGravity: 0.4
            }
        }
    }
    return base;
};

export default function GraphView({graph, logData, stepIndex, totalSteps, stepHandler}: {
    graph: Graph | null,
    logData: any,
    stepIndex: number,
    totalSteps: number,
    stepHandler: (step: number) => void,
    }) {
    const stringifySteps = () => {
        return `${stepIndex}/${totalSteps}`
    }

    //let [visGraphData, setVisGraphData] = useState({nodes: [], edges: []} as GraphData);
    let visGraphData: GraphData = {nodes: [], edges: []}
    if (graph) {
        visGraphData = {
            nodes: graph.getAllNodes().map((node, _idx) => {
                return {id: node.id, label: node.id, ...node.renderingAttributes()}
            }),
            edges: graph.getAllEdges().map((edge, index) => {
                return {id: edge.getId(), from: edge.source.id, to: edge.target.id, value: edge.weight, arrows: (edge.isBidirectional ? '' : 'to'), ...edge.renderingAttributes()}
            })
        };
    }
    //console.log(visGraphData);
    const visGraphOptions = getVisOptions(graph);
    const visGraphEvents = {select: function(event: any) {
        var { nodes, edges } = event;
    }}

    return ( 
    <div className="flex flex-col h-full">
        {/*{graph?.stringify().split("\n").map((ln,idx) => {return (<span key={idx}>{ln}<br/></span>)}) ?? "Loading..."}*/}
        <VisGraph
            style={{flexGrow: 1, maxHeight: "75vh"}}
            graph={visGraphData}
            options={visGraphOptions}
            events={visGraphEvents}
            getNetwork={network => {
                //  if you want access to vis.js network api you can set the state in a parent component using this property
            }}
        ></VisGraph>
        <div className="h-16">
            {logData !== undefined && logData !== null ? (<div className="flex flex-row items-stretch rounded-xl border-2 p-1 border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950">
                {renderValue(logData)}
            </div>) : <></>}
        </div>
        <Stepper stepHandler={stepHandler} step={stepIndex} maxSteps={totalSteps}></Stepper>
    </div>
    )
}