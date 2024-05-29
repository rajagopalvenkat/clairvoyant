import { NotImplementedError, ParsingError, RuntimeError } from "../errors/error";
import { colorWithAlpha } from "../utils/colors";
import { Command, CommandHandler } from "../utils/commands";
import { genericFromGraphNotation, gridGraphFromNotation, notationFromGenericGraph, notationFromGridGraph } from "./parsing";

export const ADJACENT_DELTAS = [
    [0, 1], [0, -1], [1, 0], [-1, 0]
];
export const ADJACENT_POSITIVE_DELTAS = [
    [0, 1], [1, 0]
];

export class GraphCommand extends Command<Graph> {
    constructor(name: string, cmd_do: (g: Graph) => void, cmd_undo: (g: Graph) => void) {
        super(name, cmd_do, cmd_undo);
    }
}

export class NodeTraverseToggleCommand extends GraphCommand {
    node: GraphNode;
    constructor(node: GraphNode) {
        super("Toggle Traverse", (g: Graph) => {
            node.data["traversable"] = !node.data["traversable"];
            g.markDirtyLookup();
        }, (g: Graph) => {
            node.data["traversable"] = !node.data["traversable"];
            g.markDirtyLookup();
        });
        this.node = node;
    }
}

export abstract class Graph {
    protected _nodeLookup = new Map<string, GraphNode>(); // Used for data/existence access
    protected _edgeLookup = new Map<string, GraphEdge[]>(); // Used to look up connections to/from nodes
    protected isDirtyLookup: boolean = false;
    protected isDirtyRender: boolean = false;
    protected _startNode: GraphNode | null = null;
    protected _endNode: GraphNode | null = null;
    protected _commandHandler: CommandHandler<Graph> = new CommandHandler<Graph>();
    protected _searchResult: string = "";
    
    get isDirty() {return this.isDirtyLookup || this.isDirtyRender;}
    get dirtyRender() {return this.isDirtyRender}
    get dirtyLookup() {return this.isDirtyLookup}
    get searchResult() {return this._searchResult}

    markDirtyLookup() {
        this.isDirtyLookup = true;
    }
    markDirtyRender() {
        this.isDirtyRender = true;
    }
    markDirtyAll() {
        this.markDirtyLookup();
        this.markDirtyRender();
    }
    markCleanRender() {
        this.isDirtyRender = false;
    }
    ensureLookupClean() {
        if (this.isDirtyLookup) {
            this.isDirtyLookup = false;
            const allEdges: GraphEdge[] = [];
            for (let edges of Object.values(this._edgeLookup)) {
                for (let edge of edges) {
                    if (edge.isRef) continue;
                    allEdges.push(edge);
                } 
            }
            this._edgeLookup.clear()
            for (let edge of allEdges) {
                this.addEdge(edge);
            }
        }
    }

    // Node Operations
    public addNode(node: GraphNode) {
        this._nodeLookup.set(node.id, node);
        //console.log(JSON.stringify([...this._nodeLookup.entries()]));
        this.markDirtyRender();
    }
    public removeNode(node: GraphNode): boolean;
    public removeNode(nodeId: string): boolean;
    public removeNode(val: GraphNode | string): boolean {
        if (val instanceof GraphNode) {val = val.id;}
        if (!this._nodeLookup.has(val)) return false;
        this.clearAllEdgesWith(val);
        this._nodeLookup.delete(val);
        this.markDirtyRender();
        return true;
    }

    get startNode() {return this._startNode}
    set startNode(node) {this._startNode = node; this.markDirtyRender();}
    get endNode() {return this._endNode}
    set endNode(node) {this._endNode = node; this.markDirtyRender();}

    // Command handling
    get commandHandler() {return this._commandHandler;}
    
    visitNode(node: GraphNode) {
        this.setNodeState(node, "visited");
    }
    unvisitNode(node: GraphNode) {
        this.setNodeState(node, "");
    }
    expandNode(node: GraphNode) {
        this.setNodeState(node, "expanded");
    }
    unexpandNode(node: GraphNode) {
        this.setNodeState(node, "visited");
    }
    complete() {
        this._searchResult = "success"
    }
    uncomplete() {
        this._searchResult = ""
    }
    fail() {
        this._searchResult = "failure"
    }
    unfail() {
        this._searchResult = ""
    }
    setNodeState(node: GraphNode, state: any) {
        node.data["state"] = state;
        this.markDirtyRender();
    }

    public resetStepData() {
        for (let node of this.getAllNodes()) {
            this.setNodeState(node, "");
        }
        this._searchResult = "";
    }

    // Edge operations
    public clearAllEdgesWith(nodeId: string) {
        this.ensureLookupClean();
        if (!(nodeId in this._edgeLookup)) return;
        for (let edge of this._edgeLookup.get(nodeId)!) {
            this._edgeLookup.set(edge.target.id, this._edgeLookup.get(edge.target.id)!.filter(e => {
                e.target.id != nodeId;
            }))
        }
        this._edgeLookup.delete(nodeId);
        this.markDirtyRender();
    }

    protected ensureEdgeLookupExists(id: string) {
        if (!this._edgeLookup.has(id)) {
            this._edgeLookup.set(id, [])
        }
    }

    public addEdge(edgeData: GraphEdge) {
        this.ensureEdgeLookupExists(edgeData.source.id);
        this._edgeLookup.get(edgeData.source.id)!.push(edgeData);
        this.ensureEdgeLookupExists(edgeData.target.id);
        this._edgeLookup.get(edgeData.target.id)!.push(edgeData.reverse());
        this.markDirtyRender();
    }

    public removeEdge(edgeData: GraphEdge) {
        this.ensureLookupClean();
        const srcEdgeList = this._edgeLookup.get(edgeData.source.id)!
        srcEdgeList.splice(srcEdgeList.indexOf(edgeData), 1);
        const tarEdgeList = this._edgeLookup.get(edgeData.target.id)!
        tarEdgeList.splice(tarEdgeList.indexOf(edgeData.reverse()), 1);
        this.markDirtyRender();
    }

    public getEdge(sourceNode: GraphNode, targetNode: GraphNode): GraphEdge | undefined {
        this.ensureLookupClean();
        let edges = this._edgeLookup.get(sourceNode.id);
        console.log(edges);
        if (!edges) return undefined;
        for (let edge of edges) {
            if (edge.target.id == targetNode.id && edge.traversable()) return edge;
        }
        return undefined;
    }

    public getAllEdges(): GraphEdge[] {
        let edges: GraphEdge[] = [];
        for (let nodeEdgeList of this._edgeLookup.values()) {
            edges.push(...nodeEdgeList.filter(e => !e.isRef));
        }
        return edges;
    }

    public getAllNodes(): GraphNode[] {
        let nodes: GraphNode[] = []
        for (let node of this._nodeLookup.values()) {
            nodes.push(node);
        }
        return nodes;
    }

    // Useful functions for algorithms
    /// Generates nodes which are adjacent to the given node
    public *getAdjacentNodes(node: GraphNode): Generator<GraphNode> {
        for (let [n, _] of this.getAdjacentData(node)) {
            yield n;
        }
    }

    /// Generates pairs node-weight, useful for edge-cost-sensitive solutions
    public *getAdjacentData(node: GraphNode): Generator<[GraphNode, number]> {
        this.ensureLookupClean();
        //console.log(this._edgeLookup.keys())
        if (!this._edgeLookup.has(node.id)) return;
        let adjEdges = this._edgeLookup.get(node.id) || [];
        //console.log("Adjacent edges: ", adjEdges);
        for (let edge of adjEdges) {
            //console.log("Edge: ", edge, "Traversable: ", edge.traversable());
            if (!edge.traversable()) continue;
            yield [edge.target, edge.weight];
        }
    }

    public getNodeById(id: string): GraphNode | undefined {
        if (!this._nodeLookup.has(id)) return undefined;
        return this._nodeLookup.get(id);
    }

    public getNextIdentifier() {
        let potentialIdNum = Object.keys(this._nodeLookup).length;
        while (this._nodeLookup.has(String(potentialIdNum))) {potentialIdNum++;}
        return String(potentialIdNum);
    }

    // Graph notation functions
    public static parseGraph(text: string): Graph {
        const lines = text.split(/\r?\n/);
        if (lines.length == 0) throw new ParsingError("The graph expression must have at least 1 line indicating the graph type.", 0, 0);
        if (lines[0].startsWith("GENERIC")) {
            return GenericGraph.fromGraphNotation(lines);
        } else if (lines[0].startsWith("GRID")) {
            return GridGraph.fromGraphNotation(lines);
        } else {
            throw new ParsingError(`Unable to find graph type ${lines[0]}, currently supported graph types are ${GRAPH_TYPE_NAMES.join(", ")}`, 0, 0);
        }
    }

    abstract stringify(): string;
}

export const GRAPH_TYPE_NAMES: string[] = ["GRID", "GENERIC"];

export class GridGraph extends Graph {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        super()
        this.width = width;
        this.height = height;
    }

    static fromGraphNotation(lines: string[]): GridGraph {
        return gridGraphFromNotation(lines);
    }

    static idFromCoords(x: number, y: number): string {
        return `${x}_${y}`;
    }

    createNode(x: number, y: number, data: Object = {}): GraphNode {
        let node = new GraphNode(this, GridGraph.idFromCoords(x, y), x, y, data);
        this.addNode(node);
        return node;
    }

    getNodeByCoords(x: number, y: number): GraphNode | undefined {
        return this.getNodeById(GridGraph.idFromCoords(x, y));
    }
    ensureGetNodeByCoords(x: number, y: number) : GraphNode {
        const node = this.getNodeByCoords(x, y);
        if (node == undefined) throw new RuntimeError(`Error during node fetching. Attempted to read node ${GridGraph.idFromCoords(x, y)}. Node lookup: ${JSON.stringify([...this._nodeLookup.entries()].map(([id, node]) => {return `${id}=>${JSON.stringify(node)}`}))}`);
        return node;
    }

    stringify(): string {
        return notationFromGridGraph(this);
    }
}

export class GenericGraph extends Graph {
    constructor() {
        super();
    }

    static fromGraphNotation(lines: string[]): GenericGraph {
        return genericFromGraphNotation(lines);
    }

    stringify(): string {
        return notationFromGenericGraph(this);
    }
}

class ReverseGraphEdgeRef implements GraphEdge {
    protected ref: GraphEdgeSimple;
    constructor(reference: GraphEdgeSimple) {
        this.ref = reference;
    }
    
    get source() {return this.ref.target;}
    set source(node: GraphNode) {this.ref.target = node;}
    get target() {return this.ref.source;}
    set target(node: GraphNode) {this.ref.source = node;}
    get isBidirectional() {return this.ref.isBidirectional;}
    set isBidirectional(bidirectional: boolean) {this.ref.isBidirectional = bidirectional;}
    get data() {return this.ref.data}
    set data(d) {this.ref.data = d}
    get style() {return this.ref.style}
    set style(s) {this.ref.style = s}
    get weight() {return this.ref.weight}
    set weight(w) {this.ref.weight = w}
    get isRef() {return true;}
    reverse() {
        return this.ref;
    }
    traversable() {
        return this.ref.isBidirectional;
    }
    renderingAttributes(): Record<string, any> {
        return this.ref.renderingAttributes();
    }
    getId(): string {
        return `${this.ref.source.id}_${this.ref.target.id}`;
    }
}

export class GraphEdgeSimple implements GraphEdge {
    protected _source: GraphNode;
    protected _target: GraphNode;
    protected _isBidirectional: boolean;
    protected _data: Record<string, any>;
    protected _style: GraphEdgeStyle;
    private _reverse: ReverseGraphEdgeRef;

    constructor(source: GraphNode, target: GraphNode, isBidirectional: boolean = false, data: Record<string, any> = {}) {
        this._source = source;
        this._target = target;
        this._isBidirectional = isBidirectional;
        this._data = data;
        this._style = {};
        this._reverse = new ReverseGraphEdgeRef(this);
    }
    
    get source() {return this._source;}
    set source(node: GraphNode) {
        this._source = node;
        node.graph.markDirtyAll();
    }
    get target() {return this._target;}
    set target(node: GraphNode) {
        this._target = node;
        node.graph.markDirtyAll();
    }
    get isBidirectional() {return this._isBidirectional;}
    set isBidirectional(bidirectional: boolean) {
        this.isBidirectional = bidirectional;
        this._source.graph.markDirtyRender();
    }

    get data() {return this._data}
    set data(d) {this._data = d}
    get style() {return this._style}
    set style(s) {this._style = s}

    get weight() {
        if ("w" in this._data) {return (this._data["w"] as number) || 1}
        return 1;
    }
    set weight(w) {this._data["w"] = w}

    get isRef() {return false;}

    reverse(): GraphEdge {
        return this._reverse; 
    }

    traversable(): boolean {
        return true;
    }

    renderingAttributes(): Record<string, any> {
        return {};
    }

    getId(): string {
        return `${this.source.id}_${this.target.id}`;
    }
}

export interface GraphEdge {
    getId(): string;
    get source(): GraphNode
    set source(node: GraphNode)
    get target(): GraphNode
    set target(node: GraphNode)
    get isBidirectional(): boolean
    set isBidirectional(bidirectional: boolean)
    get weight(): number
    set weight(w: number)
    get data(): Record<string, any>
    set data(data: Record<string, any>)
    get style(): GraphEdgeStyle
    set style(style: GraphEdgeStyle)

    get isRef(): boolean

    reverse(): GraphEdge
    traversable(): boolean
    renderingAttributes(): Record<string, any>;
}

export class GraphNode {
    id: string;
    x: number;
    y: number;
    private _graph: Graph;
    data: Record<string, any>;
    style: GraphNodeStyle = {};

    constructor(graph: Graph, id: string, x: number = 0, y: number = 0, data: Record<string, any> = {}) {
        this._graph = graph;
        this.id = id;
        this.x = x;
        this.y = y;
        this.data = data;
    }

    get graph() {return this._graph;}
}

export interface GraphNodeStyle {
    color?: string;
    borderColor?: string;
    borderThickness?: number;
    size?: number;
}

export interface GraphEdgeStyle {
    color?: string;
    thickness?: number;
}