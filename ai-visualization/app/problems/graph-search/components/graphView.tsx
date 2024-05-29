import { Graph, GridGraph, GenericGraph, GraphNode } from "@/lib/graphs/graph"
import { renderValue } from "@/lib/strings/pretty"
import { useState } from "react";
import VisGraph, { GraphData, Options as VisGraphOptions } from "react-vis-graph-wrapper"
import Stepper from "./stepper";
import { Font } from "vis-network";
import { colorWithAlpha } from "@/lib/utils/colors";

const edgeScaleFactor = 2;
function getVisOptions(graph: Graph | null = null): VisGraphOptions {
    let fontColor = "#7777ff";
    let fontStrokeColor = "black";
    let fontData : Font = {
        size: 14,
        color: fontColor,
        strokeWidth: 1,
        strokeColor: fontStrokeColor,
    };

    let base: VisGraphOptions = {
        edges: {
            labelHighlightBold: true,
            font: fontData,
            color: "white"
        },
        nodes: {
            font: fontData,
            scaling: {
                label: true
            }
        },
        height: "100%",
    }
    if (graph instanceof GridGraph) {
        base.physics = {
            barnesHut: {
                gravitationalConstant: 0,
                springConstant: 0,
                springLength: GRIDGRAPH_SCALE_FACTOR,
                centralGravity: 0.4
            }
        }
    }
    if (graph instanceof GenericGraph) {
        base.edges!.smooth = {
            enabled: true,
            type: "continuous",
            roundness: 0.5
        }
        base.physics = {
            barnesHut: {
                gravitationalConstant: -2000,
                springConstant: 0.006,
                springLength: 60,
                centralGravity: 0.4,
            }
        }
    }
    return base;
};

export const GRIDGRAPH_SCALE_FACTOR = 50;
function getColorByState(state: string | undefined): string {
    switch (state) {
        case "visited":
            return "#ffff00";
        case "expanded":
            return "#66ff66";
        default:
            return "#999999";
    }
}

function getNodeAttributes(node: GraphNode, globals: VisGraphOptions): Record<string, any> {
    let result : Record<string, any> = {};
    let c;
    switch (node.graph.searchResult) {
        case "success":
            c = "#3333ff";
            break;
        case "failure":
            c = "#ff3333";
            break;
        default:
            c = getColorByState(node.data.state);
            break;      
    } 

    if (node.graph instanceof GridGraph) {
        result.shape = "box";
        result.x = node.x * GRIDGRAPH_SCALE_FACTOR;
        result.y = node.y * GRIDGRAPH_SCALE_FACTOR;
        if (node.data["traversable"] == false) {
            c = colorWithAlpha(c, 0x80);
        }
    } else {
        result.shape = "dot";
        result.size = 8;
    }

    if (node.graph.startNode?.id == node.id) {
        result.shape = "diamond";
        result.size = 15;
    }
    if (node.graph.endNode?.id == node.id) {
        result.shape = "star";
        result.size = 15;
    }
    if (c) result.color = c; 
    return result;
}

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

    const visGraphOptions = getVisOptions(graph);

    //let [visGraphData, setVisGraphData] = useState({nodes: [], edges: []} as GraphData);
    let visGraphData: GraphData = {nodes: [], edges: []}
    if (graph) {
        visGraphData = {
            nodes: graph.getAllNodes().map((node, _idx) => {
                return {id: node.id, label: node.id, ...getNodeAttributes(node, visGraphOptions)}
            }),
            edges: graph.getAllEdges().map((edge, index) => {
                return {from: edge.source.id, to: edge.target.id, width: edge.weight * edgeScaleFactor, arrows: (edge.isBidirectional ? '' : 'to'), ...edge.renderingAttributes()}
            })
        };
    }
    //console.log(visGraphData);
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