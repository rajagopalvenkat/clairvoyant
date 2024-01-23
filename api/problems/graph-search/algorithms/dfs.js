let Solution = class extends GraphSearchSolution {
    constructor(graph) {
        this.visited = {};
        this.graph = graph;
    }
    
    solve(start, goal) {
        this.visited[start.id] = true;
        if (this.solve_internal(start, goal, graph)) {
            return success(); // Success is an external function in GraphSearchSolution that enables visualization
        }
        return failure(); // Failure is an external function in GraphSearchSolution that enables visualization
    }

    solve_internal(current, goal, graph) {
        expand(current) // Expand is an external function in GraphSearchSolution that enables visualization
        if (current.id == goal.id) {
            return true;
        }
        
        for (let adj of graph.getAdjacentNodes(current)) {
            if (adj.id in visited) {continue;}
            visit(adj) // Visit is an external function in GraphSearchSolution that enables visualization
            this.visited[adj.id] = true;
            if (this.solve(adj, goal, graph)) {
                return true;
            }
        }

        return false;
    }
}
