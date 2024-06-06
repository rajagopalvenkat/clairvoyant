import { Graph, GridGraph, GenericGraph, GraphNode, EditableGraphComponent, GraphEdge } from "@/lib/graphs/graph"
import { renderValue } from "@/lib/strings/pretty"
import { useCallback, useEffect, useState } from "react";
import VisGraph, { GraphData, Options as VisGraphOptions } from "react-vis-graph-wrapper"
import Stepper from "./stepper";
import { Font, NodeOptions } from "vis-network";
import { colorWithAlpha } from "@/lib/utils/colors";
import "./graphView.css"
import { buttonStyleClassNames, dangerButtonStyleClassNames, getButtonStyleClassNamesForColor } from "@/lib/statics/styleConstants";
import { PropertyInspector } from "@/app/components/data/propertyEditor";
import { ensureError } from "@/lib/errors/error";
import { toast } from "react-toastify";
import { showConfirmation } from "@/app/components/dialogs/comfirm";
import { showInspectorDialog } from "@/app/components/dialogs/inspectorDialog";
import { ItemProperty } from "@/lib/utils/properties";

const edgeScaleFactor = 2;
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


    let traversabilityAlpha = node.traversable ? 0xff : 0x70;
    c = colorWithAlpha(c, traversabilityAlpha);
    let borderColor = node.data["highlighted"] ? "#ff0000" : c;
    result.borderWidth = node.data["highlighted"] ? 3 : 1;
    result.color = {border: borderColor, background: c};
    result.font = {
        "color": colorWithAlpha((globals.nodes!.font! as Font).color!, traversabilityAlpha),
        "strokeColor": colorWithAlpha((globals.nodes!.font! as Font).strokeColor!, traversabilityAlpha),
    };

    if (node.graph instanceof GridGraph) {
        result.shape = "box";
        result.x = node.x * GRIDGRAPH_SCALE_FACTOR;
        result.y = node.y * GRIDGRAPH_SCALE_FACTOR;
        
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
    return result;
}

function getEdgeAttributes(edge: GraphEdge): Record<string, any> {
    let result : Record<string, any> = {};
    let c = "#ffffff";
    if (edge.getProp("highlighted")) {
        c = "#ff0000";
    }
    if (!edge.traversable() && !edge.reverse().traversable()) {
        c = colorWithAlpha(c, 0x10);
    }
    result.color = c;
    return result;
}

export function GraphComponentInspector({components, onChanges, onDeletionRequested}: {
    components: EditableGraphComponent[], 
    onChanges: (property: string, oldValue: any, newValue: any) => void,
    onDeletionRequested: () => void,
}) {
    if (components.length == 0) {
        return <></>
    }
    if (components.length > 1) {
        return <p>Multi-editing is not yet supported</p>
    }
    let name: string;
    try {
        name = components[0].getProp("id");
    } catch {
        name = "Unknown"
    }

    return <>
        <div className="flex flex-row justify-center mb-2">
            <h2 className="text-xl">{name}</h2>
        </div>
        <PropertyInspector properties={components[0].properties} onChange={onChanges} />
        <div className="flex flex-row justify-end my-1">
            <button className={`${dangerButtonStyleClassNames} px-1`} onClick={onDeletionRequested}>Delete</button>
        </div>
    </>
}

const nodeCreationProperties: ItemProperty[] = [
    {name: "id", type: "string", value: "", dynamic: true},
]

export default function GraphView({graph, logData, stepIndex, totalSteps, onGraphChanged, stepHandler}: {
    graph: Graph | null,
    logData: any,
    stepIndex: number,
    totalSteps: number,
    onGraphChanged: (graph: Graph) => void,
    stepHandler: (step: number) => void,
    }) {
    const stringifySteps = () => {
        return `${stepIndex}/${totalSteps}`
    }

    let [visGraphData, setVisGraphData] = useState<GraphData>({nodes: [], edges: []});
    let [visGraphOptions, setVisGraphOptions] = useState(getVisOptions(graph));

    const renderGraph = useCallback(() => {
        if (graph) {
            let allGraphEdges = graph.getAllEdges();
            let tempIndex = new Map(allGraphEdges.map((edge, index) => [index, edge]));
            setVisGraphData({
                nodes: graph.getAllNodes().map((node, _idx) => {
                    return {id: node.id, label: node.getProp("label"), ...getNodeAttributes(node, visGraphOptions)}
                }),
                edges: allGraphEdges.map((edge, index) => {
                    let [source, target] = edge.data["flipped"] ? [edge.target.id, edge.source.id] : [edge.source.id, edge.target.id];
                    return {id: edge.id, from: source, to: target, width: edge.weight * edgeScaleFactor, arrows: (edge.isBidirectional ? '' : 'to'), ...getEdgeAttributes(edge)}
                })
            });
            let oldOptions = visGraphOptions;
            let newOptions = getVisOptions(graph);
            if (JSON.stringify(oldOptions) == JSON.stringify(newOptions)) return;
            setVisGraphOptions(newOptions);
        }
        console.log("Re-rendering graph")
    }, [graph, visGraphOptions])

    useEffect(() => {
        renderGraph();
    }, [renderGraph, stepIndex])

    const graphChangedCallback = useCallback((g: Graph) => {
        onGraphChanged(g);
        renderGraph();
    }, [onGraphChanged, renderGraph])
    const handleStepCallback = useCallback((step: number) => {
        stepHandler(step);
        // Using effect to ensure that the graph is re-rendered after the step is handled
    }, [stepHandler])
    
    const createNodeRequested = useCallback(async () => {
        if (!graph) {
            toast.error("No valid graph loaded."); return;
        }
        let newData = await showInspectorDialog(nodeCreationProperties, "Node ID", "Enter the ID for the new node");
        if (newData == null) {return;} // cancelled
        if (!newData) {
            toast.error("No data entered, node creation cancelled."); return;
        }
        if (!newData.id) {
            toast.error("No ID entered, node creation cancelled."); return;
        }
        if (graph.getNodeById(newData.id)) {
            toast.error("Node with that ID already exists."); return;
        }
        let newNode = new GraphNode(graph, newData.id);
        graph.addNode(newNode);
        graphChangedCallback(graph);
    }, [graph, graphChangedCallback])

    //console.log(visGraphData);
    const [selectedComponents, setSelectedComponents] = useState([] as EditableGraphComponent[]);
    const visGraphEvents = {
        select: (event: any) => {
            if (!graph) return;
            var { nodes, edges } = event;
            let selectedNodes = nodes.map((node: string) => graph.getNodeById(node)!);
            if (selectedNodes.length > 0) { setSelectedComponents(selectedNodes); return; }
            else {setSelectedComponents(edges.map((edge: number) => graph.getEdgeById(edge)!))};
        },
        doubleClick: (event: any) => {
            if (!graph) return;
            var { nodes, edges } = event;
            let selectedNodes: GraphNode[] = nodes.map((node: string) => graph.getNodeById(node)!);
            if (selectedNodes.length > 0) {
                for (let node of selectedNodes) {
                    if (node) {
                        node.setProp("traversable", !node.traversable);
                    }
                    graphChangedCallback(graph);
                }
            } else if (selectedNodes.length == 0 && edges.length > 0) {
                for (let edgeId of edges) {
                    let edge = graph.getEdgeById(edgeId);
                    if (edge) {
                        edge.setProp("forbidden", !edge.getProp("forbidden"));
                    }
                    graphChangedCallback(graph);
                }
            } else {
                // double click on empty space
                if (graph instanceof GenericGraph) {
                    createNodeRequested();
                }
            }
        }
    }

    const gridOnly = graph instanceof GridGraph ? "" : "hidden";
    const genericOnly = graph instanceof GenericGraph ? "" : "hidden";
    const hideIfNothingSelected = selectedComponents.length > 0 ? "" : "hidden";

    return ( 
    <div className="flex flex-col h-full">
        <div className="flex-grow relative">
            <VisGraph
                style={{height: "100%", maxHeight: "75vh"}}
                graph={visGraphData}
                options={visGraphOptions}
                events={visGraphEvents}
                getNetwork={network => {
                    //  if you want access to vis.js network api you can set the state in a parent component using this property
                }}
            ></VisGraph>
            <div className={`graph-helper bg-secondary-100 dark:bg-secondary-900 rounded-xl px-2 py-1`}>
                <PropertyInspector properties={graph?.properties ?? []} onChange={(propertyName: string, oldValue: any, newValue: any) => {
                    try {
                        graph?.setProp(propertyName, newValue);
                        graphChangedCallback(graph!);
                    } catch (e) {
                        let err = ensureError(e);
                        toast.error(err.message);
                    }
                }} />
                <div className={`${genericOnly} flex flex-col items-end`}>
                    <button className={`${getButtonStyleClassNamesForColor("primary")} px-2 py-1 rounded-xl`} onClick={createNodeRequested}>Create Node</button>
                </div>
            </div>
            <div className={`edit-menu bg-secondary-100 dark:bg-secondary-900 rounded-xl px-2 py-1 ${hideIfNothingSelected}`}>
                <GraphComponentInspector components={selectedComponents} onChanges={(property: string, oldValue: any, newValue: any) => {
                    // Will have to be edited to support undo/redo
                    console.log("Changing property", property, "from", oldValue, "to", newValue)
                    for (let component of selectedComponents) {
                        component.setProp(property, newValue);
                    }
                    graphChangedCallback(graph!);
                }} onDeletionRequested={async () => {
                    let confirm = await showConfirmation(`Are you sure you want to delete the selected components (${selectedComponents.map(c => c.id).join(", ")})?`)
                    if (!confirm) return;

                    for (let component of selectedComponents) {
                        component.delete();
                    }
                    setSelectedComponents([]);
                    graphChangedCallback(graph!);
                }} />
            </div>
        </div>
        <div className="h-16">
            {logData !== undefined && logData !== null ? (<div className="flex flex-row items-stretch rounded-xl border-2 p-1 border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950">
                {renderValue(logData)}
            </div>) : <></>}
        </div>
        <Stepper stepHandler={handleStepCallback} step={stepIndex} maxSteps={totalSteps}></Stepper>
    </div>
    )
}