import { dijsktra } from "@/lib/graphs/algorithms"
import { Graph, GraphEdge, GraphNode } from "@/lib/graphs/graph"
import { colorLerp, colorWithAlpha } from "@/lib/utils/colors";
import { useEffect, useState } from "react"
import VisGraph, { GraphData, Options as VisGraphOptions } from "react-vis-graph-wrapper"
import { Font, NodeOptions } from "vis-network";
import { GraphEvents } from "@/lib/graphs/vis-events";
import { AdversarialSearchPosition } from "@/lib/adversarial/adversarialCase";

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
        },
        layout: { 
            hierarchical: {
                enabled: true,
                levelSeparation: 120,
                nodeSpacing: 30,
                treeSpacing: 200,
                blockShifting: true,
                edgeMinimization: true,
                parentCentralization: true,
                direction: "UD",
                sortMethod: "directed"
            }
        },
    }
    return base;
};

function getNodeAttributes(node: GraphNode, globals: VisGraphOptions): NodeOptions {
    let result : NodeOptions = {};
    let c = "#888888";
    let pos : AdversarialSearchPosition = node.data["position"];
    if (pos.isTerminal()) {
        c = colorLerp("#ff0000", "#00ff00", (pos.getScore() / 2 + 0.5));
    }

    let shape = "ellipse";
    let player = pos.getPlayer();
    if (player === 1) {
        shape = "triangle";
    } else if (player === -1) {
        shape = "triangleDown";
    }
    result.shape = shape;
    result.size = 12;

    let borderColor = node.data["highlighted"] ? "#ff0000" : c;
    result.borderWidth = node.data["highlighted"] ? 3 : 1;
    result.color = {border: borderColor, background: c, highlight: {border: borderColor}};
    result.font = {
        "color": (globals.nodes!.font! as Font).color!,
        "strokeColor": (globals.nodes!.font! as Font).strokeColor!,
    };

    if (pos.style) {
        for (let key in Object.keys(pos.style)) {
            // We have to do this because typescript doesn't know that the key is a valid key of NodeOptions
            (result as any)[key] = (pos.style as any)[key];
        }
    }

    return result;
}

function getEdgeAttributes(edge: GraphEdge): Record<string, any> {
    let result : Record<string, any> = {};
    let c = "#ffffff";
    if (edge.getProp("highlighted")) {
        c = "#ff0000";
    }
    result.color = c;
    result.label = edge.data["action"]["label"] ?? edge.data["action"]["name"] ?? "";
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

export default function TreeView({graph, onNodeSelected = (x) => {}, renderKey}: {
    graph: Graph | null,
    onNodeSelected?: (node: GraphNode | null) => void,
    renderKey: number
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
            let label = ""; node.getProp("label");
            let pos : AdversarialSearchPosition = node.data["position"];
            if (expandedNodes.has(node.id)) {
                q.push(...[...graph.getAdjacentNodes(node)].map(n => ({node: n, distance: distance + 1})));
            } else if (!pos.isTerminal()) {
                let children = countChildren(node);
                label = `${label} (${children})`.trimStart();
            }
            data.nodes.push({id: node.id, label: label, level: distance, ...getNodeAttributes(node, visGraphOptions)});
            for (let edge of graph.getIncomingEdges(node)) {
                data.edges.push({id: edge.id, from: edge.source.id, to: edge.target.id, arrows: 'to', ...getEdgeAttributes(edge)});
            }
        }
        console.log(data);
        setGraphData(data);
        console.log(visGraphOptions);
        setGraphOptions(visGraphOptions);
    }, [expandedNodes, graph, renderKey])

    let events: GraphEvents = {
        click: (event) => {
            
        },
        doubleClick: (event) => {
            if (event.nodes.length <= 0) return;
            let nodeId = event.nodes[0] as string;
            let node = graph?.getNodeById(nodeId);
            if (!node) return;
            let pos : AdversarialSearchPosition = node.data["position"];
            if (pos.isTerminal()) return;
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