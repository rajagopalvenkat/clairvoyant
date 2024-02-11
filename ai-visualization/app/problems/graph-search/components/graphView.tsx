import {Graph} from "@/lib/graphs/graph"

export default function GraphView({graph}: {graph: Graph | null}) {
    return ( 
    <div>
        <p>
            {graph?.stringify().split("\n").map((ln,idx) => {return (<span key={idx}>{ln}<br/></span>)}) ?? "Loading..."}
        </p>
        <p>
            {JSON.stringify(graph)}
        </p>
    </div>
    )
}