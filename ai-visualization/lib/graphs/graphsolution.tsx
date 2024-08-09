import { ensureError } from "../errors/error";
import { Command, PropertyChangeCommand } from "../utils/commands";
import { ItemPropertySet } from "../utils/properties";
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
    private __propertyStore: Map<EditableGraphComponent, Record<string, any>> = new Map();
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
        this.alter(components.map(c => {return {target: c, property: "highlighted", value: true}}), debugValue);
    }
    unhighlight(components: EditableGraphComponent[], debugValue: any = null): void {
        this.alter(components.map(c => {return {target: c, property: "highlighted", value: false}}), debugValue);
    }
    alter(changes: ItemPropertySet<EditableGraphComponent>[], debugValue: any = null): void {
        if (!this.__propertyStore) this.__propertyStore = new Map();
        let contextfulChanges = changes.map(change => {
            let oldValue = this.__propertyStore.get(change.target)?.[change.property] ?? change.target.getProp(change.property);
            return {oldValue: oldValue, newValue: change.value, property: change.property, target: change.target};            
        });
        for (let change of changes) {
            let store = this.__propertyStore.get(change.target) ?? {};
            store[change.property] = change.value;
            this.__propertyStore.set(change.target, store);
        }
        this.__steps.push(new GraphSearchResult(GSR_NONE, null, debugValue, new PropertyChangeCommand(contextfulChanges)));
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
        if (solverClass === undefined) {
            throw new Error("Received undefined on eval. Ensure the last line of your algorithm evaluates to the prototype of your solver class.");
        }
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
        let err = ensureError(e);
        throw new Error("Error evaluating code: " + err.stack ?? err.message);
    }
    
    return result;
}