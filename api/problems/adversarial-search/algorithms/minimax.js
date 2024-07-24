(SolverBase, game) => {
    const FLOAT_EPSILON = 1e-10;

    class Minimax extends SolverBase {
        constructor(game) {
            super(game);
        }
    
        // this function should use the generated expansions to generate an "optimal" play sequence
        // expand() should not be called in this function
        getPlaySequence(position) {
            position.utility = this.dfsMinimax(position, 0, true);
            console.log(`Utility from node: ${position.utility}`);
            let playSequence = [];
            let current = position;
            let moves = current.bestMoves[0];
            while (moves && moves.length > 0) {
                playSequence.push(moves[0]);
                current = moves[0].position;
                moves = current.bestMoves;
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

        /** @param {Position} node */
        dfsMinimax(node) {
            // This value is used to render the best move(s) from any given position
            node.bestMoves = [];

            if (node.isTerminal()) {
                node.utility = node.getScore();
                return node.utility;
            }
            // expansion budget unavailable for this node
            if (!node.moves) {
                // here, you can return a heuristic value for the node
                // or you can just return 0 to assume a draw
                node.utility = 0;
                if (typeof node.getHeuristic === "function") {
                    node.utility = node.getHeuristic();
                }
                return node.utility;
            }
            let currentPlayer = node.getPlayer();
            let maximizingPlayer;
            if (currentPlayer === 1) {
                maximizingPlayer = true;
            } else if (currentPlayer === -1) {
                maximizingPlayer = false;
            } else {
                throw new Error("Invalid player for minimax algorithm.");
            }

            node.utility = maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
            let bestMoves = [];
            for (let move of node.moves) {
                let score = this.dfsMinimax(move.position);
                if (Math.abs(score - node.utility) < FLOAT_EPSILON) {
                    bestMoves.push(move);
                } else if (maximizingPlayer ? score > node.utility : score < node.utility) {
                    node.utility = score;
                    bestMoves = [move];
                }
            }
            node.bestMoves = bestMoves;
            return node.utility;
        }        
    }

    return new Minimax(game);
}