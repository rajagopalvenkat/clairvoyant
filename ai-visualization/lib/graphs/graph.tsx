import { NotImplementedError, ParsingError } from "../errors/error";

export abstract class Graph {
    protected _nodeLookup: Record<string, GraphNode> = {}; // Used for data/existence access
    protected _edgeLookup: Record<string, Record<string, GraphEdge>> = {} // Used to look up connections
    protected isDirty: boolean = false;
    protected _startNode: GraphNode | null = null;
    protected _endNode: GraphNode | null = null;
    
    markDirty() {
        this.isDirty = true;
    }
    recalculate() {
        this.isDirty = false;
        // ...
    }

    // NODE OPERATIONS
    addNode(node: GraphNode) {
        this._nodeLookup[node.id] = node;
        this.markDirty();
    }
    removeNode(node: GraphNode): boolean;
    removeNode(nodeId: string): boolean;
    removeNode(val: GraphNode | string): boolean {
        if (val instanceof GraphNode) {val = val.id;}
        if (!(val in this._nodeLookup)) return false;
        this.clearAllEdges(val);
        delete this._nodeLookup[val];
        this.markDirty();
        return true;
    }

    // Edge operations
    protected clearAllEdges(nodeId: string) {
        this._edgeLookup
    }

    getNodeById(id: string): GraphNode | null {
        if (!(id in this._nodeLookup)) return null;
        return this._nodeLookup[id];
    }

    getNextIdentifier() {
        let potentialIdNum = Object.keys(this._nodeLookup).length;
        while (String(potentialIdNum) in this._nodeLookup) {potentialIdNum++;}
        return String(potentialIdNum)
    }

    // Graph notation functions
    static parseGraph(text: string): Graph {
        let lines = text.split(/\r?\n/);
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
        let match = lines[0].match(/GRID\s+(\d+)x(\d+)/);
        if (match === null) throw new ParsingError("The GRID graph type requires two dimensions expressed in the format <WIDTH>x<HEIGHT> following the GRID specifier", 0, "GRID ".length, "GRID 10x8")
        let [width, height] = [match[1], match[2]].map(parseInt);
        let result = new GridGraph(width, height);
        // EXTRA LOGIC (TO BE IMPLEMENTED)
        throw new NotImplementedError("Grid Graph Parsing");
        return result;
    }

    stringify(): string {
        let lines = [`GRID ${this.width}x${this.height}`];
        throw new NotImplementedError("Generic Graph Stringification");
        return lines.join("\n");
    }
}

export class GenericGraph extends Graph {
    constructor() {
        super();
    }

    static fromGraphNotation(lines: string[]): GenericGraph {
        let result = new GenericGraph();
        for (let i = 1; i < lines.length; i++) {
            throw new NotImplementedError("Generic Graph Parsing");
        }
        return result;
    }

    stringify(): string {
        let lines = ["GENERIC"];
        throw new NotImplementedError("Generic Graph Stringification");
        return lines.join("\n");
    }
}

export class GraphEdge {
    private _source: GraphNode;
    private _target: GraphNode;
    private _isBidirectional: boolean;
    style: GraphEdgeStyle = {};

    constructor(source: GraphNode, target: GraphNode, isBidirectional: boolean = false) {
        this._source = source;
        this._target = target;
        this._isBidirectional = isBidirectional;
    }
    
    get source() {return this._source;}
    set source(node: GraphNode) {
        this._source = node;
        node.graph.markDirty();
    }
    get target() {return this._target;}
    set target(node: GraphNode) {
        this._target = node;
        node.graph.markDirty();
    }
    get isBidirectional() {return this._isBidirectional;}
    set isBidirectional(bidirectional: boolean) {
        this.isBidirectional = bidirectional;
        this._source.graph.markDirty();
    }
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