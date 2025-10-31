import { canSetProps, ItemProperty } from "@/lib/utils/properties";
import { EditableGraphComponent } from "../graph";
import { GraphNode } from "./node";

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
    if (name === "weight") {
        edge.weight = value;
    } else if (name === "bidirectional") {
        edge.isBidirectional = value;
    } else if (name === "flipped") {
        edge.data["flipped"] = value;
    } else if (name === "highlighted") {
        edge.data["highlighted"] = value;
    } else if (name === "forbidden") {
        edge.data["forbidden"] = value;
    } else {
        return false;
    }
    return true;
}
function getEdgeProperty(edge: GraphEdge, name: string) {
    if (name === "id") {
        return edge.id;
    } else if (name === "source") {
        return edge.source.id;
    } else if (name === "target") {
        return edge.target.id;
    } else if (name === "weight") {
        return edge.weight;
    } else if (name === "bidirectional") {
        return edge.isBidirectional;
    } else if (name === "flipped") {
        return edge.data["flipped"];
    } else if (name === "highlighted") {
        return edge.data["highlighted"] ?? false;
    } else if (name === "forbidden") {
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

export interface GraphEdgeStyle {
    color?: string;
    thickness?: number;
}
