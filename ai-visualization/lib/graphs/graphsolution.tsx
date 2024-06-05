import { Command, PropertyChangeCommand } from "../utils/commands";
import { ItemPropertyChange } from "../utils/properties";
import { EditableGraphComponent, Graph, GraphNode } from "./graph";

const GSR_SUCCESS = "success";
const GSR_FAILURE = "failure";
const GSR_VISIT = "visit";
const GSR_EXPAND = "expand";
const GSR_NONE = "none";

export class GraphSearchResult {
    actType: string;
    cell: GraphNode | null;
    debugValue: any;
    command?: Command<Graph>;
    constructor(actType: string, cell: GraphNode | null = null, debugValue: any = null, command?: Command<Graph>) {
        this.actType = actType;
        this.cell = cell;
        this.debugValue = debugValue;
        this.command = command;
    }

    isTerminal(): boolean {
        return this.actType === GSR_SUCCESS || this.actType === GSR_FAILURE;
    }
}

export class GraphSearchSolution {
    private __steps: GraphSearchResult[] = [];
    constructor(graph: Graph | null = null) {
    }

    solve(start: GraphNode, end: GraphNode): boolean {
        return this.failure();
    }

    getSolutionSteps(start: GraphNode, end: GraphNode): GraphSearchResult[] {
        this.__steps = [];
        this.solve(start, end);
        if (this.__steps.length === 0) { 
            throw new Error("No steps were recorded. Did you invoke failure or success?");
        }
        let lastStep = this.__steps[this.__steps.length - 1];
        if (!lastStep.isTerminal()) {
            throw new Error("Last step is not a terminal step. Ensure you finish solving by returning a success or failure.");
        }
        console.log("Solution steps: ", this.__steps);
        return this.__steps;
    }

    failure(debugValue: any = null): boolean {
        this.__steps.push(new GraphSearchResult(GSR_FAILURE, null, debugValue));
        return false;
    }
    success(debugValue: any = null): boolean {
        this.__steps.push(new GraphSearchResult(GSR_SUCCESS, null, debugValue));
        return true;
    }
    visit(cell: GraphNode, debugValue: any = null): void {
        this.__steps.push(new GraphSearchResult(GSR_VISIT, cell, debugValue));
    }
    expand(cell: GraphNode, debugValue: any = null): void {
        this.__steps.push(new GraphSearchResult(GSR_EXPAND, cell, debugValue));
    }
    highlight(components: EditableGraphComponent[], debugValue: any = null): void {
        this.alter(components.map(c => {return {target: c, property: "highlighted", oldValue: false, newValue: true}}), debugValue);
    }
    alter(changes: ItemPropertyChange<EditableGraphComponent>[], debugValue: any = null): void {
        this.__steps.push(new GraphSearchResult(GSR_NONE, null, debugValue, new PropertyChangeCommand(changes)));
    }
    log(debugValue: any) {
        this.__steps.push(new GraphSearchResult(GSR_NONE, null, debugValue));
    }
}

export function buildGraphSearchSolution(code: string, graph: Graph) : GraphSearchSolution {
    let result;
    try {
        "use strict";
        let solverClass: any = eval?.(code);
        Object.setPrototypeOf(solverClass, GraphSearchSolution.prototype);
        let solver = Object.create(solverClass);
        let finalProto = Object.getPrototypeOf(solver);
        console.log(finalProto);
        if (!Object.hasOwn(finalProto, "constructor")) {
            throw new Error("constructor function is not defined.");
        }
        if (solver.constructor!.length !== 1) {
            throw new Error("constructor must accept only the graph as a parameter.");
        }
        if (!Object.hasOwn(finalProto, "solve")) {
            throw new Error("solve method is not defined.");
        }
        if (solver.solve.length !== 2) {
            throw new Error("solve method must accept exactly two parameters.");
        }
        console.log("Checks succeeded!");
        result = new solver.constructor(graph);
    } catch (e) {
        throw new Error("Error evaluating code: " + e);
    }
    
    return result;
}