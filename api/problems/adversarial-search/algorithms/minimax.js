(SolverBase, game) => {
    const FLOAT_EPSILON = 1e-10;

    class Minimax extends SolverBase {
        constructor(game) {
            super(game);
        }
    
        // this function should use the generated expansions to find out node utilities
        // expand() should not be called in this function
        // use yield this.algoStep() to provide a "step" to the visualizer
        *runAlgorithm(position) {
            yield* this.dfsMinimax(position, new Set());
            console.log(`Utility from node: ${position.utility}`);
        }

        // this function should prepare the position tree for the play algorithm
        // call and yield the result of this.expand() to interactively let the user expand nodes
        *runExpansion(node) {
            // iterative deepening approach
            // This avoids having massive queues in memory, which end up slowing down the algorithm
            // This is also a common approach in practice for memory reasons, though since visualizations require storing all positions, this isn't much of a benefit here.
            let maxNodesFound = -1;
            let maxDepthAllowed = 1;
            let nodesFound = 0;
            while (nodesFound > maxNodesFound) {
                console.log(`Starting deepening expansion with depth ${maxDepthAllowed}, last nodes found ${nodesFound}.`)
                maxNodesFound = nodesFound;
                nodesFound = 0;
                for (let expansion of this.dfs(node, 0, maxDepthAllowed)) {
                    yield expansion;
                    nodesFound++;
                }
                maxDepthAllowed++;
            }
        }

        *dfs(node, depth, maxDepth) {
            if (node.isTerminal() || depth === maxDepth) {
                return;
            }
            yield this.expand(node);
            for (let move of node.moves) {
                yield* this.dfs(move.position, depth + 1, maxDepth);
            }
        }

        // you may extend expansion logic, but you should always return the result of super.expand
        expand(node) {
            let result = super.expand(node);
            // you can add additional data to the node here
            return result;
        }

        /** 
         * @param {Position} node
         * @param {Set<string>} visited
         */
        *dfsMinimax(node, visited) {
            // This value is used to render the best move(s) from any given position
            let nodeId = node.id;
            if (visited.has(nodeId)) {
                // case for infinite loops, assume a draw
                if (node.utility < Number.MIN_SAFE_INTEGER || node.utility > Number.MAX_SAFE_INTEGER) {
                    node.utility = 0;
                    console.log(`Found node with forced draw by repetition: ${nodeId}`);
                } else {
                    //console.log(`Repeated: utility = ${node.utility}, ID = ${nodeId}`);
                }
                return;
            }
            visited.add(nodeId);
            node.bestMoves = [];

            if (node.isTerminal()) {
                node.utility = node.getScore();
                yield this.algoStep();
                return;
            }

            // expansion budget unavailable for this node
            if (node.moves === undefined || node.moves.length == 0) {
                // here, you can return a heuristic value for the node
                // or you can just return 0 to assume a draw
                node.utility = 0;
                if (typeof node.getHeuristic === "function") {
                    node.utility = node.getHeuristic();
                }
                //console.log(`Calculated heuristic utility of ${node.id} = ${node.utility}`);
                yield this.algoStep();
                return;
            }

            let currentPlayer = node.getPlayer();
            let maximizingPlayer;
            if (currentPlayer === 1) {
                maximizingPlayer = true;
            } else if (currentPlayer === -1) {
                maximizingPlayer = false;
            } else {
                throw new Error(`Invalid player for minimax algorithm: ${currentPlayer}`);
            }

            node.utility = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
            let bestMoves = [];
            for (let move of node.moves) {
                yield* this.dfsMinimax(move.position, visited);
                let score = move.position.utility;
                if (Math.abs(score - node.utility) < FLOAT_EPSILON) {
                    bestMoves.push(move);
                } else if (maximizingPlayer ? score > node.utility : score < node.utility) {
                    node.utility = score;
                    bestMoves = [move];
                }
            }
            node.bestMoves = bestMoves;
            yield this.algoStep();
        }
    }

    return new Minimax(game);
}