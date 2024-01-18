import {Graph} from "@/lib/graphs/graph"

export default function GraphView({graph}: {graph: Graph}) {
    return <p>
        {graph.stringify()}
    </p>    
}