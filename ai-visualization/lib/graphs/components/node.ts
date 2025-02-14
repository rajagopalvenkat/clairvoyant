import { Mathlib } from "@/lib/utils/math";
import { EditableGraphComponent, GenericGraph, Graph, GridGraph } from "../graph";
import { NotImplementedError } from "@/lib/errors/error";
import { canSetProps, ItemProperty } from "@/lib/utils/properties";

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
            {name: "is_start", type: "boolean", value: this._graph.startNode?.id === this.id, trigger: true},
            {name: "is_goal", type: "boolean", value: this._graph.endNode?.id === this.id, trigger: true},
            {name: "h", type: "number", value: this.heuristic},
            {name: "traversable", type: "boolean", value: this.traversable},
            {name: "highlighted", type: "boolean", value: this.data["highlighted"] ?? false, hidden: false},
            {name: "state", type: "string", options: ["", "visited", "expanded"], value: this.data["state"] ?? "", hidden: true},
        ];
        if (this._graph instanceof GridGraph) {
            result.push({name: "x", type: "number", value: this.x, fixed: true});
            result.push({name: "y", type: "number", value: this.y, fixed: true});
        }
        return result;
    }
    getProp(name: string) {
        if (name === "id") return this.id;
        if (name === "is_start") return this._graph.startNode?.id === this.id;
        if (name === "is_goal") return this._graph.endNode?.id === this.id;
        if (name === "label") return this.data["label"] ?? this.id;
        if (name === "h") return this.heuristic;
        if (name === "traversable") return this.traversable;
        if (name === "highlighted") return this.data["highlighted"] ?? false;
        if (name === "state") return this.data["state"] ?? "";
        if (this._graph instanceof GridGraph) {
            if (name === "x") return this.x;
            if (name === "y") return this.y;
        }
        throw new NotImplementedError(`Property ${name} is not implemented for GraphNode`);
    }
    setProp(name: string, value: any): boolean {
        let setAnalysis = canSetProps(this.properties, {[name]: value});
        if (!setAnalysis.success) throw new Error(setAnalysis.errors.join("\n"));
        
        if (name === "label") {
            this.data["label"] = value;
        } else if (name === "is_start") {
            // Initial checks ensure that this is set to true
            this._graph.startNode = this;
        } else if (name === "is_goal") {
            // Initial checks ensure that this is set to true
            this._graph.endNode = this;
        } else if (name === "h") {
            this.data["h"] = value;
        } else if (name === "traversable") {
            this.data["traversable"] = value;
        } else if (name === "highlighted") {
            this.data["highlighted"] = value;
        } else if (name === "state") {
            this.data["state"] = value;
        } else {
            return false;
        }
        return true;
    }

    delete(): void {
        if (this._graph instanceof GridGraph) { 
            throw new Error("Grid Graph nodes may not be deleted, modify the grid size instead.");
        }
        if (this._graph.endNode?.id === this.id) {
            throw new Error("Cannot delete the goal node of the graph. Set another node as the goal first.");
        }
        if (this._graph.startNode?.id ===   this.id) {
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
            if (this.data[key] !== undefined) {
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