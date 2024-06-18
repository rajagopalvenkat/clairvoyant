import { dijsktra } from "@/lib/graphs/algorithms"
import { Graph, GraphEdge, GraphNode } from "@/lib/graphs/graph"
import { colorWithAlpha } from "@/lib/utils/colors";
import { useEffect, useState } from "react"
import VisGraph, { GraphData, Options as VisGraphOptions } from "react-vis-graph-wrapper"
import { Font, NodeOptions } from "vis-network";
import { GraphEvents } from "@/lib/graphs/vis-events";

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

function countChildren(node: GraphNode, visited: Set<string> = new Set()): number {
    let count = 0;
    for (let child of node.graph.getAdjacentNodes(node)) {
        if (!visited.has(child.id)) {
            visited.add(child.id);
            count += 1 + countChildren(child, visited);
        }
    }
    return count;
}

export default function TreeView({graph, onNodeSelected = (x) => {}}: {
    graph: Graph | null,
    onNodeSelected?: (node: GraphNode | null) => void
}) {
    let [graphData, setGraphData] = useState<GraphData>({nodes: [], edges: []})
    let [graphOptions, setGraphOptions] = useState<VisGraphOptions>(getVisOptions(graph));
    let [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!graph || !graph.startNode) { return; }

        let visGraphOptions = getVisOptions(graph);
        let data: GraphData = {nodes:[], edges:[]};

        let startPos = graph.startNode;
        let q = [{node: startPos, distance: 0}];
        while (q.length > 0) {
            let {node, distance} = q.shift()!;
            let label = node.getProp("label");
            if (expandedNodes.has(node.id)) {
                q.push(...[...graph.getAdjacentNodes(node)].map(n => ({node: n, distance: distance + 1})));
            } else {
                let children = countChildren(node);
                label = `${label} (${children})`.trimStart();
            }
            data.nodes.push({id: node.id, label: label, level: distance, ...getNodeAttributes(node, visGraphOptions)});
            for (let edge of graph.getIncomingEdges(node)) {
                data.edges.push({id: edge.id, from: edge.source.id, to: edge.target.id, arrows: 'to', ...getEdgeAttributes(edge)});
            }
        }

        setGraphData(data);
        setGraphOptions(visGraphOptions);
    }, [expandedNodes, graph])

    let events: GraphEvents = {
        click: (event) => {
            
        },
        doubleClick: (event) => {
            if (event.nodes.length <= 0) return;
            let nodeId = event.nodes[0] as string;
            if (expandedNodes.has(nodeId)) {
                expandedNodes.delete(nodeId);
            } else {
                expandedNodes.add(nodeId);
            }
            setExpandedNodes(new Set(expandedNodes));
        },
        selectNode: (event) => {
            if (event.nodes.length <= 0) return;
            let nodeId = event.nodes[0] as string;
            let node = graph?.getNodeById(nodeId);
            if (!node) return;
            onNodeSelected(node);            
        },
        deselectNode: (event) => {
            onNodeSelected(null);
        }
    }
    
    return <VisGraph 
        graph={graphData} 
        options={graphOptions}
        events={events}
    />
}