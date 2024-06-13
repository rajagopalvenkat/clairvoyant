import { dijsktra } from "@/lib/graphs/algorithms"
import { Graph, GraphEdge, GraphNode } from "@/lib/graphs/graph"
import { colorWithAlpha } from "@/lib/utils/colors";
import { useEffect, useState } from "react"
import VisGraph, { GraphData, Options as VisGraphOptions } from "react-vis-graph-wrapper"
import { Font, NodeOptions } from "vis-network";

function getVisOptions(graph: Graph | null = null): VisGraphOptions {
    let fontColor = "#7777ff";
    let fontStrokeColor = "#000000";
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
        interaction: {
            hover: true
        }
    }
    return base;
};

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

function getNodeAttributes(node: GraphNode, globals: VisGraphOptions): NodeOptions {
    let result : NodeOptions = {};
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

    let borderColor = node.data["highlighted"] ? "#ff0000" : c;
    result.borderWidth = node.data["highlighted"] ? 3 : 1;
    result.color = {border: borderColor, background: c, highlight: {border: borderColor}};
    result.font = {
        "color": (globals.nodes!.font! as Font).color!,
        "strokeColor": (globals.nodes!.font! as Font).strokeColor!,
    };

    result.physics = node.graph?.physicsEnabled && node.graph.context.draggingNode != node; 

    return result;
}

function getEdgeAttributes(edge: GraphEdge): Record<string, any> {
    let result : Record<string, any> = {};
    let c = "#ffffff";
    if (edge.getProp("highlighted")) {
        c = "#ff0000";
    }
    result.color = c;
    return result;
}


export default function TreeView({graph}: {
    graph: Graph | null
}) {
    let [graphData, setGraphData] = useState<GraphData>({nodes: [], edges: []})
    let [graphOptions, setGraphOptions] = useState<VisGraphOptions>(getVisOptions(graph));

    useEffect(() => {
        if (!graph || !graph.startNode) { return; }

        let visGraphOptions = getVisOptions(graph);
        let distanceFromStart = dijsktra(graph, graph.startNode, false);
        setGraphData({
            nodes: graph.getAllNodes().map((node, _idx) => {
                return {id: node.id, label: node.getProp("label"), level: distanceFromStart.get(node.id), ...getNodeAttributes(node, visGraphOptions)}
            }),
            edges: graph.getAllEdges().map((edge, index) => {
                let [source, target] = edge.data["flipped"] ? [edge.target.id, edge.source.id] : [edge.source.id, edge.target.id];
                return {id: edge.id, from: source, to: target, arrows: (edge.isBidirectional ? '' : 'to'), ...getEdgeAttributes(edge)}
            })
        })
        setGraphOptions(visGraphOptions);
    }, [graph])
    
    return <VisGraph graph={graphData} />
}