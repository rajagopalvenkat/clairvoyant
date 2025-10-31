import { Command } from "../utils/commands";
import { Graph, GraphContext, GridGraph } from "./graph";
import { GraphNode } from "./components/node";

export class GraphCommand extends Command<GraphContext> {
    constructor(name: string, cmd_do: (g: Graph) => void, cmd_undo: (g: Graph) => void) {
        super(name, (ctx) => cmd_do(ctx.graph!), (ctx) => cmd_undo(ctx.graph!));
    }
}

export class MetaGraphCommand extends Command<GraphContext> {
    constructor(name: string, cmd_do: (g: GraphContext) => void, cmd_undo: (g: GraphContext) => void) {
        super(name, cmd_do, cmd_undo);
    }
}

export class NodeTraverseToggleCommand extends GraphCommand {
    node: GraphNode;
    constructor(node: GraphNode) {
        super("Toggle Traverse", (g: Graph) => {
            node.data["traversable"] = !node.data["traversable"];
            (g as GridGraph)?.updateBaseEdges(node);
        }, (g: Graph) => {
            node.data["traversable"] = !node.data["traversable"];
            (g as GridGraph)?.updateBaseEdges(node);
        });
        this.node = node;
    }
}

export class LayerGraphCommand extends MetaGraphCommand {
    layer: Graph;
    constructor(graph: Graph) {
        super("Set Graph", (ctx: GraphContext) => {
            ctx.push(this.layer);
        }, (ctx: GraphContext) => {
            ctx.pop();
        });
        this.layer = graph;
    }
}

export class GraphSuccessCommand extends GraphCommand {
    constructor() {
        super("Mark Graph Successful", (graph: Graph) => {
            graph.complete();
        }, (graph: Graph) => {
            graph.uncomplete();
        })
    }
}

export class GraphFailureCommand extends GraphCommand {
    constructor() {
        super("Mark Graph Successful", (graph: Graph) => {
            graph.fail();
        }, (graph: Graph) => {
            graph.unfail();
        })
    }
}
