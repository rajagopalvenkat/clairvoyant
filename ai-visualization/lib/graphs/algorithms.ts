import { GraphNode } from "./components/node";
import { Graph } from "./graph";

export function dijsktra(graph: Graph, start: GraphNode, useWeights: boolean = true): Map<string, number> {
    let distanceFromStart = new Map<string, number>();
    let unvisited = new Set<string>();
    let visited = new Set<string>();
    let current = start;
    graph.getAllNodes().forEach(node => {
        distanceFromStart.set(node.id, Infinity);
        unvisited.add(node.id);
    });
    distanceFromStart.set(start.id, 0);

    while (unvisited.size > 0) {
        let neighbors = [...graph.getAdjacentEdges(current)];
        neighbors.forEach(neighbor => {
            let distance = distanceFromStart.get(current.id)! + (useWeights ? neighbor.weight : 1);
            if (distance < distanceFromStart.get(neighbor.target.id)!) {
                distanceFromStart.set(neighbor.target.id, distance);
            }
        });

        visited.add(current.id);
        unvisited.delete(current.id);

        let minDistance = Infinity;
        let nextNode = "";
        unvisited.forEach(node => {
            if (distanceFromStart.get(node)! < minDistance) {
                minDistance = distanceFromStart.get(node)!;
                nextNode = node;
            }
        });

        // End early for disconnected graphs
        if (minDistance === Infinity) {break;}

        current = graph.getNodeById(nextNode)!;
    }

    return distanceFromStart;
}