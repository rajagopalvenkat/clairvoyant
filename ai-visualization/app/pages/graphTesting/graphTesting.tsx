import { GridGraph } from "@/lib/graphs/graph";
import GraphView from "./components/graphView";

export default function GraphTester() {
    return <div>
        <h1>This is the Graph Tester</h1>
        <GraphView graph={new GridGraph(10, 10)}></GraphView>
    </div>
}

