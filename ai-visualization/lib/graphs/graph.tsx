import { NotImplementedError, ParsingError, RuntimeError } from "../errors/error";
import { Command, CommandHandler } from "../utils/commands";
import { EditableComponent, ItemProperty, canSetProps } from "../utils/properties";
import { Mathlib } from "../utils/math";

export const DIAGONAL_WEIGHT_DISABLED = -1;
export const DIAGONAL_WEIGHT_CHEBYSHEV = 1;
export const DIAGONAL_WEIGHT_EUCLIDEAN = 1.4142135623730951;
export const DIAGONAL_WEIGHT_MANHATTAN = 2;
export const defaultDiagWeightNames: Record<string, number> = {
    "disabled": DIAGONAL_WEIGHT_DISABLED,
    "manhattan": DIAGONAL_WEIGHT_MANHATTAN,
    "euclidean": DIAGONAL_WEIGHT_EUCLIDEAN,
    "chebyshev": DIAGONAL_WEIGHT_CHEBYSHEV
}

export const ADJACENT_DELTAS_ORTHO: [number, number][] = [
    [0, 1], [0, -1], [1, 0], [-1, 0]
];
export const ADJACENT_DELTAS: [number, number][] = [
    [0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]
];

import { genericFromGraphNotation, gridGraphFromNotation, notationFromGenericGraph, notationFromGridGraph } from "./parsing";

export interface GraphUIContext {
    heldNode?: GraphNode;
    heldEdge?: GraphEdge;
    hoveredNode?: GraphNode;
    hoveredEdge?: GraphEdge;
    draggingNode?: GraphNode;
}

export abstract class Graph implements EditableComponent {
    protected _nodeLookup = new Map<string, GraphNode>(); // Used for data/existence access
    protected _edgeLookup = new Map<string, GraphEdge[]>(); // Used to look up connections to/from nodes
    protected _edgeIdLookup = new Map<number, GraphEdge>(); // Used to look up edges by id
    protected isDirtyLookup: boolean = false;
    protected isDirtyRender: boolean = false;
    protected _startNode: GraphNode | null = null;
    protected _endNode: GraphNode | null = null;
    protected _commandHandler: CommandHandler<Graph> = new CommandHandler<Graph>();
    protected _searchResult: string = "";
    public defaultBidirectional: boolean = false;
    public physicsEnabled: boolean = true;
    public context: GraphUIContext = {};

    get isDirty() {return this.isDirtyLookup || this.isDirtyRender;}
    get dirtyRender() {return this.isDirtyRender}
    get dirtyLookup() {return this.isDirtyLookup}
    get searchResult() {return this._searchResult}

    get id(): string | number {
        return 0;
    }
    get properties(): ItemProperty[] {
        return [
            {name: "start", type: "string", value: this.startNode?.id},
            {name: "end", type: "string", value: this.endNode?.id},
            {name: "physics_enabled", type: "boolean", value: this.physicsEnabled},
            {name: "default_bidirectional", type: "boolean", value: this.defaultBidirectional, description: "Whether to make newly created edges bidirectional by default"}
        ]
    }
    getProp(name: string) {
        let properties = this.properties;
        let prop = properties.find(p => p.name == name);
        if (!prop) throw new Error(`Property ${name} is not implemented for Graph`);
        return prop.value;
    }
    setProp(name: string, value: any): boolean {
        let analysis = canSetProps(this.properties, {[name]: value});
        if (!analysis.success) throw new Error(analysis.errors.join("\n"));

        if (name == "start") {
            let n = this.getNodeById(value);
            if (n == undefined) throw new Error(`Node ${value} does not exist in the graph.`);
            this.startNode = n;
        } else if (name == "end") {
            let n = this.getNodeById(value);
            if (n == undefined) throw new Error(`Node ${value} does not exist in the graph.`);
            this.endNode = n;
        } else if (name == "default_bidirectional") {
            this.defaultBidirectional = value;
        } else if (name == "physics_enabled") {
            this.physicsEnabled = value;
        } else {
            return false;
        }
        return true;
    }

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
            for (let edge of Object.values(this._edgeIdLookup)) {
                if (edge.isRef) continue;
                allEdges.push(edge);
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
            node.data["highlighted"] = false;
        }
        for (let edge of this.getAllEdges()) {
            edge.data["highlighted"] = false;
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
        this._edgeIdLookup.set(edgeData.id as number, edgeData);
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
        this._edgeIdLookup.delete(edgeData.id as number);
        this.markDirtyRender();
    }

    public getEdge(sourceNode: GraphNode, targetNode: GraphNode, includeUntraversable: boolean = false): GraphEdge | undefined {
        this.ensureLookupClean();
        let edges = this._edgeLookup.get(sourceNode.id);
        // console.log(edges);
        if (!edges) return undefined;
        for (let edge of edges) {
            if (edge.target.id == targetNode.id && (edge.traversable() || includeUntraversable)) return edge;
        }
        return undefined;
    }

    public getEdgeById(id: number): GraphEdge | undefined {
        return this._edgeIdLookup.get(id);
    }

    public getAllEdges(): GraphEdge[] {
        return [...this._edgeIdLookup.values()].filter(e => !e.isRef);
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
        for (let edge of this.getAdjacentEdges(node)) {
            yield edge.target;
        }
    }
    public *getIncomingNodes(node: GraphNode): Generator<GraphNode> {
        for (let edge of this.getIncomingEdges(node)) {
            yield edge.target;
        }
    }

    public *getAdjacentEdges(node: GraphNode, includeUntraversable = false): Generator<GraphEdge> {
        this.ensureLookupClean();
        //console.log(this._edgeLookup.keys())
        if (!this._edgeLookup.has(node.id)) return;
        let adjEdges = this._edgeLookup.get(node.id) || [];
        //console.log("Adjacent edges: ", adjEdges);
        for (let edge of adjEdges) {
            //console.log("Edge: ", edge, "Traversable: ", edge.traversable());
            if (!includeUntraversable && !edge.traversable()) continue;
            yield edge;
        }
    }
    public *getIncomingEdges(node: GraphNode, includeUntraversable = false): Generator<GraphEdge> {
        this.ensureLookupClean();
        if (!this._edgeLookup.has(node.id)) return;
        let adjEdges = this._edgeLookup.get(node.id) || [];
        for (let edge of adjEdges) {
            let rev = edge.reverse();
            if (!includeUntraversable && !rev.traversable()) continue;
            yield rev;
        }
    }

    public getNodeById(id: string): GraphNode | undefined {
        if (!this._nodeLookup.has(id)) return undefined;
        return this._nodeLookup.get(id);
    }

    public getNextNodeIdentifier() {
        let potentialIdNum = Object.keys(this._nodeLookup).length;
        while (this._nodeLookup.has(String(potentialIdNum))) {potentialIdNum++;}
        return String(potentialIdNum);
    }
    private _edgeIdCounter: number = 1;
    public getNextEdgeIdentifier(): number {
        return this._edgeIdCounter++;
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
    diagonalWeights: number;

    constructor(width: number, height: number, diagonalWeights: number = DIAGONAL_WEIGHT_DISABLED) {
        super()
        this.width = width;
        this.height = height;
        this.diagonalWeights = diagonalWeights;
    }

    static fromGraphNotation(lines: string[]): GridGraph {
        return gridGraphFromNotation(lines);
    }

    static idFromCoords(x: number, y: number): string {
        return `${x}_${y}`;
    }

    override get properties(): ItemProperty[] {
        return [
            ...super.properties,
            {name: "width", type: "number", value: this.width, check: (v: any) => v > 0 && Math.floor(v) == v},
            {name: "height", type: "number", value: this.height, check: (v: any) => v > 0 && Math.floor(v) == v},
            {name: "diagonal_weights", type: "number", value: this.diagonalWeights}
        ]
    }

    override setProp(name: string, value: any): boolean {
        if (super.setProp(name, value)) return true;

        if (name == "width") {
            this.setDimensions(value, this.height);
        } else if (name == "height") {
            this.setDimensions(this.width, value);
        } else if (name == "diagonal_weights") {
            this.diagonalWeights = value;
            this.updateAllTraversableEdges();
        } else {
            return false;
        }
        return true;
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

    updateAllTraversableEdges() {
        for (let node of this.getAllNodes()) {
            this.updateBaseEdges(node);
        }
    }
    updateBaseEdges(node: GraphNode) {
        // Edge traversability is not DYNAMIC!
        // Edges don't need to be removed, they'll be grayed out if they're not usable
        // All we have to do is ensure that they exist.
        
        /*if (node.data["traversable"] == false) {
            this.clearAllEdgesWith(node.id);
            return;
        }*/
        for (let [dx, dy] of ADJACENT_DELTAS) {
            let nx = node.x + dx;
            let ny = node.y + dy;
            if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
            let target = this.ensureGetNodeByCoords(nx, ny);
            // if (!target.data["traversable"]) continue;
            let edge = this.getEdge(node, target, true)
            if (edge == undefined) {
                edge = new GraphEdgeSimple(this.getNextEdgeIdentifier(), node, target, true);
                this.addEdge(edge);
            }
            if (Math.abs(dx) + Math.abs(dy) > 1) {
                edge.data["w"] = this.diagonalWeights;
                edge.data["forbidden"] = this.diagonalWeights < 0;
            }
        }
    }

    stringify(): string {
        return notationFromGridGraph(this);
    }

    private setDimensions(newWidth: number, newHeight: number) {
        let nodes = this.getAllNodes();
        let nodesToRemove = nodes.filter(n => n.x >= newWidth || n.y >= newHeight);
        // Initial check
        for (let node of nodesToRemove) {
            if (node.id == this.startNode?.id || node.id == this.endNode?.id) {
                throw new Error("Cannot remove start or end node when resizing the grid graph.");
            }
        }
        // Add new nodes
        for (let x = 0; x < newWidth; x++) {
            for (let y = 0; y < newHeight; y++) {
                if (this.getNodeByCoords(x, y) == undefined) {
                    this.createNode(x, y);
                }
            }
        }
        // Remove bad nodes
        for (let node of nodesToRemove) {
            this.removeNode(node);
        }
        this.width = newWidth;
        this.height = newHeight;
        this.updateAllTraversableEdges();
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

function getEdgeProperties(edge: GraphEdge): ItemProperty[] {
    return [
        {name: "id", type: "number", value: edge.id, fixed: true},
        {name: "source", type: "string", value: edge.source.id, fixed: true},
        {name: "target", type: "string", value: edge.target.id, fixed: true},
        {name: "weight", type: "number", value: edge.weight},
        {name: "bidirectional", type: "boolean", value: edge.isBidirectional},
        {name: "flipped", type: "boolean", value: edge.data["flipped"] ?? false},
        {name: "highlighted", type: "boolean", value: edge.data["highlighted"] ?? false, hidden: false},
        {name: "forbidden", type: "boolean", value: edge.data["forbidden"] ?? false, hidden: false}
    ]
}
function setEdgeProperty(edge: GraphEdge, name: string, value: any): boolean {
    let setAnalysis = canSetProps(getEdgeProperties(edge), {[name]: value});
    if (!setAnalysis.success) throw new Error(setAnalysis.errors.join("\n"));
    if (name == "weight") {
        edge.weight = value;
    } else if (name == "bidirectional") {
        edge.isBidirectional = value;
    } else if (name == "flipped") {
        edge.data["flipped"] = value;
    } else if (name == "highlighted") {
        edge.data["highlighted"] = value;
    } else if (name == "forbidden") {
        edge.data["forbidden"] = value;
    } else {
        return false;
    }
    return true;
}
function getEdgeProperty(edge: GraphEdge, name: string) {
    if (name == "id") {
        return edge.id;
    } else if (name == "source") {
        return edge.source.id;
    } else if (name == "target") {
        return edge.target.id;
    } else if (name == "weight") {
        return edge.weight;
    } else if (name == "bidirectional") {
        return edge.isBidirectional;
    } else if (name == "flipped") {
        return edge.data["flipped"];
    } else if (name == "highlighted") {
        return edge.data["highlighted"] ?? false;
    } else if (name == "forbidden") {
        return edge.data["forbidden"] ?? false;
    }
    throw new Error(`Property ${name} is not implemented for GraphEdge`);
}

class ReverseGraphEdgeRef implements GraphEdge {
    protected ref: GraphEdgeSimple;
    constructor(reference: GraphEdgeSimple) {
        this.ref = reference;
    }
    get id() {return -this.ref.id;}
    
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
        if (!this.source.traversable || !this.target.traversable || this.data["forbidden"]) return false;
        return this.ref.isBidirectional || this.ref.data["flipped"];
    }
    getId(): string {
        return `${this.ref.source.id}_${this.ref.target.id}`;
    }

    get properties(): ItemProperty[] {
        return getEdgeProperties(this);
    }
    getProp(name: string) {
        return getEdgeProperty(this, name);
    }
    setProp(name: string, value: any): boolean {
        return setEdgeProperty(this, name, value);
    }
    delete(): void {
        this.source.graph.removeEdge(this);
    }
}

export class GraphEdgeSimple implements GraphEdge {
    protected _id: number;
    protected _source: GraphNode;
    protected _target: GraphNode;
    protected _isBidirectional: boolean;
    protected _data: Record<string, any>;
    protected _style: GraphEdgeStyle;
    private _reverse: ReverseGraphEdgeRef;

    get id() {return this._id;}

    constructor(id: number, source: GraphNode, target: GraphNode, isBidirectional: boolean = false, data: Record<string, any> = {}) {
        if (id <= 0) {throw new Error("Non-positive IDs are reserved for reverse edge references.");}
        this._id = id;
        this._source = source;
        this._target = target;
        this._isBidirectional = isBidirectional;
        this._data = data;
        this._style = {};
        this._reverse = new ReverseGraphEdgeRef(this);
    }
    get properties(): ItemProperty[] {
        return getEdgeProperties(this);
    }
    getProp(name: string) {
        return getEdgeProperty(this, name);
    }
    setProp(name: string, value: any): boolean {
        return setEdgeProperty(this, name, value);
    }
    delete(): void {
        this.source.graph.removeEdge(this);
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
        this._isBidirectional = bidirectional;
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
        if (!this.source.traversable || !this.target.traversable || this.data["forbidden"]) return false;
        return this.isBidirectional || !this.data["flipped"];
    }

    getId(): string {
        return `${this.source.id}_${this.target.id}`;
    }
}

export interface GraphEdge extends EditableGraphComponent {
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
}

export interface EditableGraphComponent extends EditableComponent {
    delete(): void;
}

export class GraphNode implements EditableGraphComponent {
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

    get properties(): ItemProperty[] {
        let result: ItemProperty[] = [
            {name: "id", type: "string", value: this.id, fixed: true},
            {name: "label", type: "string", value: this.data["label"] ?? this.id},
            {name: "is_start", type: "boolean", value: this._graph.startNode?.id == this.id, trigger: true},
            {name: "is_goal", type: "boolean", value: this._graph.endNode?.id == this.id, trigger: true},
            {name: "h", type: "number", value: this.heuristic},
            {name: "traversable", type: "boolean", value: this.traversable},
            {name: "highlighted", type: "boolean", value: this.data["highlighted"] ?? false, hidden: false}
        ];
        if (this._graph instanceof GridGraph) {
            result.push({name: "x", type: "number", value: this.x, fixed: true});
            result.push({name: "y", type: "number", value: this.y, fixed: true});
        }
        return result;
    }
    getProp(name: string) {
        if (name == "id") return this.id;
        if (name == "is_start") return this._graph.startNode?.id == this.id;
        if (name == "is_goal") return this._graph.endNode?.id == this.id;
        if (name == "label") return this.data["label"] ?? this.id;
        if (name == "h") return this.heuristic;
        if (name == "traversable") return this.traversable;
        if (name == "highlighted") return this.data["highlighted"] ?? false;
        if (this._graph instanceof GridGraph) {
            if (name == "x") return this.x;
            if (name == "y") return this.y;
        }
        throw new NotImplementedError(`Property ${name} is not implemented for GraphNode`);
    }
    setProp(name: string, value: any): boolean {
        let setAnalysis = canSetProps(this.properties, {[name]: value});
        if (!setAnalysis.success) throw new Error(setAnalysis.errors.join("\n"));
        
        if (name == "label") {
            this.data["label"] = value;
        } else if (name == "is_start") {
            // Initial checks ensure that this is set to true
            this._graph.startNode = this;
        } else if (name == "is_goal") {
            // Initial checks ensure that this is set to true
            this._graph.endNode = this;
        } else if (name == "h") {
            this.data["h"] = value;
        } else if (name == "traversable") {
            this.data["traversable"] = value;
        } else if (name == "highlighted") {
            this.data["highlighted"] = value;
        } else {
            return false;
        }
        return true;
    }

    delete(): void {
        if (this._graph instanceof GridGraph) { 
            throw new Error("Grid Graph nodes may not be deleted, modify the grid size instead.");
        }
        if (this._graph.endNode?.id == this.id) {
            throw new Error("Cannot delete the goal node of the graph. Set another node as the goal first.");
        }
        if (this._graph.startNode?.id == this.id) {
            throw new Error("Cannot delete the start node of the graph. Set another node as the start first.");
        }
        this._graph.removeNode(this);
    }

    get graph() {return this._graph;}
    get heuristic() {
        if (this.data["h"] != undefined) return this.data["h"];
        if (this._graph instanceof GridGraph) {
            let goal = this._graph.endNode;
            if (!goal) return 0;
            let dx = Math.abs(this.x - goal.x);
            let dy = Math.abs(this.y - goal.y);
            let diagWeights = (this._graph as GridGraph).diagonalWeights;
            let effectiveDiagonalCost = diagWeights  >= 0 ? diagWeights : Number.POSITIVE_INFINITY;
            return Mathlib.distanceWithDiagonalCost([dx, dy], effectiveDiagonalCost);
        }
        return 0;
    }
    get traversable() {
        if (this.data["traversable"] === false) return false;
        return true; 
    }

    getSerializableData(): Record<string, any> {
        let innerData: Record<string, any> = {};
        if (this.style && Object.keys(this.style).length > 0)
            innerData.style = this.style;
        if (this.graph instanceof GenericGraph) {
            if (!this.traversable) innerData.traversable = false;
        }
        for (let key of ["label", "h"]) {
            if (this.data[key] != undefined) {
                innerData[key] = this.data[key];
            }
        }
        return innerData;
    }
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