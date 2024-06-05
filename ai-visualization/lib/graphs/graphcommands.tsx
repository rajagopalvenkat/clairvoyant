import { Command } from "../utils/commands";
import { ItemPropertyChange, executePropertyChange, revertPropertyChange } from "../utils/properties";
import { EditableGraphComponent, Graph, GraphNode, GridGraph } from "./graph";

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
            (g as GridGraph)?.updateBaseEdges(node);
        }, (g: Graph) => {
            node.data["traversable"] = !node.data["traversable"];
            (g as GridGraph)?.updateBaseEdges(node);
        });
        this.node = node;
    }
}
