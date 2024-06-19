(SolverBase, game) => {
    class Minimax extends SolverBase {
        constructor(game) {
            super(game);
        }
    
        // this function should use the generated expansions to generate an "optimal" play sequence
        // expand() should not be called in this function
        getPlaySequence(position) {
            this.dfsMinimax(position, 0, true);
            let playSequence = [];
            let current = position;
            let move = current.data["bestMove"];
            while (move) {
                playSequence.push(move);
                current = move.position;
                move = current.data["bestMove"];
            }
            return playSequence;
        }

        // this function should prepare the position tree for the play algorithm
        // call and yield the result of expand() to interactively let the user expand nodes
        // depending on the user's expansion/time limit, expand() may yield empty expansions even if the node isn't terminal
        *runExpansion(node) {
            // iterative deepening approach
            // This avoids having massive queues in memory, which end up slowing down the algorithm
            // This is also a common approach in practice for memory reasons, though since visualizations require storing all positions, this isn't much of a benefit here.
            let maxNodesFound = -1;
            let maxDepthAllowed = 4;
            let nodesFound = 0;
            while (nodesFound > maxNodesFound) {
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
            let expansion = this.expand(node);
            yield expansion;
            for (let move of expansion.moves) {
                yield* this.dfs(move.position, depth + 1, maxDepth);
            }
        }

        // you may extend expansion logic, but you should always return the result of super.expand
        expand(node) {
            let result = super.expand(node);
            // the "data" field should always be safe to use for storing custom data
            node.data["moves"] = result.moves;
            return result;
        }

        dfsMinimax(node) {
            if (node.isTerminal()) {
                return node.getScore();
            }
            // expansion budget unavailable for this node
            if (!node.data["moves"]) {
                // here, you can return a heuristic value for the node
                // or you can just return 0 to assume a draw
                return 0;
            }
            let currentPlayer = node.data["position"].getPlayer();
            let maximizingPlayer;
            if (currentPlayer == 1) {
                maximizingPlayer = true;
            } else if (currentPlayer == -1) {
                maximizingPlayer = false;
            } else {
                throw new Error("Invalid player for minimax algorithm.");
            }

            let bestScore = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
            let bestMove = undefined;
            for (let move of node.data["moves"]) {
                let score = this.dfsMinimax(move.position);
                if (maximizingPlayer ? score > bestScore : score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            node.data["bestMove"] = bestMove;
            return bestScore;
        }        
    }

    return new Minimax(game);
}