import { AdversarialSearchCase, AdversarialSearchPosition, requiredGameMethods, requiredPositionMethods } from "./adversarialCase";
import { EditableComponent, ItemProperty } from "../../lib/utils/properties";
import { GenericGraph, GraphEdgeSimple, GraphNode } from "../graphs/graph";

interface AdversarialSearchAction {
    name?: string;
    [key: string]: any;
}

interface AdversarialSearchMove {
    position: AdversarialSearchPosition;
    action: AdversarialSearchAction;
}

export class AdversarialExpansion {
    position: AdversarialSearchPosition;
    moves: AdversarialSearchMove[];
    constructor(position: AdversarialSearchPosition, moves: AdversarialSearchMove[]) {
        this.position = position;
        this.moves = moves;
    }
}

export abstract class AdversarialSearchSolution implements EditableComponent {
    game!: AdversarialSearchCase;
    gameTree!: GenericGraph; 
    allowedExpansions: number = 1;
    initialized: boolean = false;
    bestAction?: AdversarialSearchAction;
    constructor(game: AdversarialSearchCase) {
        if (!this.initialized) {
            this.initialize(game);
        }
    }
    initialize(game: AdversarialSearchCase) {
        if (this.initialized) return;
        this.game = game;
        this.gameTree = new GenericGraph();
        let initPosition = game.getInitialPosition();
        let startNode = new GraphNode(this.gameTree, initPosition.getId(), 0, 0, {position: initPosition, expanded: false});
        this.gameTree.addNode(startNode);
        this.gameTree.startNode = startNode;
        this.gameTree.endNode = startNode;
        this.initialized = true;
    }
    get id(): string | number {
        return "";
    }
    get properties(): ItemProperty[] {
        return [];
    }
    getProp(name: string): any {
        let props = this.properties;
        for (let prop of props) {
            if (prop.name === name) {
                return prop.value;
            }
        }
        throw new Error("Property not found: " + name);
    }
    setProp(name: string, value: any): boolean {
        return false;
    }

    abstract getPlaySequence(position: AdversarialSearchPosition): AdversarialSearchMove[];
    abstract runExpansion(position: AdversarialSearchPosition): Generator<AdversarialExpansion>;
    expand(position: AdversarialSearchPosition): AdversarialExpansion {
        let posId = position.getId();
        let curNode = this.gameTree.getNodeById(posId);
        if (!curNode) {
            curNode = new GraphNode(this.gameTree, posId, 0, 0, {position: position, expanded: false});
            this.gameTree.addNode(curNode);
        }

        // already expanded
        if (curNode.data["expanded"]) {
            let cache = [...this.gameTree.getAdjacentEdges(curNode)];
            return {position: position, moves: cache.map(edge => {return {position: edge.target.data["position"], action: edge.data["action"]}})};
        }

        if (this.allowedExpansions-- == 0) {
            this.allowedExpansions = 0;
            return {position: position, moves: []};
        }

        let actions = this.game.getActions(position);
        let moves = actions.map(action => {
            let result = this.game.getResult(position, action);
            let move = {position: result, action: action};
            return move;
        });

        for (let s of moves) {
            // In case of converging lines, we need to check if the node already exists
            let nextNode = this.gameTree.getNodeById(s.position.getId());
            if (!nextNode) {
                nextNode = new GraphNode(this.gameTree, s.position.getId(), 0, 0, {position: s.position, expanded: false});
                this.gameTree.addNode(nextNode);
            }
            let edge = new GraphEdgeSimple(this.gameTree.getNextEdgeIdentifier(), curNode, nextNode, false, {action: s.action});
            this.gameTree.addEdge(edge);
        }

        curNode.data["expanded"] = true;
        return {position: position, moves: moves};
    }
}

const requiredSolverMethods = [
    {name: "getPlaySequence", args: 1},
    {name: "runExpansion", args: 1}
]

export class AdversarialSearchBuildError extends Error {
    fault: string;
    constructor(message: string, fault: string) {
        super(message);
        this.fault = fault;
    }
}

export function buildAdversarialSolution(solutionCode: string, gameCode: string) : [AdversarialSearchSolution, AdversarialSearchCase] {
    let solver: AdversarialSearchSolution;
    let game: AdversarialSearchCase;
    try {
        "use strict";
        let gameBuilder: (clazz1: any, clazz2: any) => AdversarialSearchCase = eval?.(gameCode);
        game = gameBuilder(AdversarialSearchCase, AdversarialSearchPosition);
        let gameProto = Object.getPrototypeOf(game);
        let initialPosition = game.getInitialPosition();
        let posProto = Object.getPrototypeOf(initialPosition);

        for (let method of requiredGameMethods) {
            if (!Object.hasOwn(gameProto, method.name) || gameProto[method.name].length !== method.args) {
                throw new Error(`${method.name} method is not defined in the Case class or has the wrong number of arguments, it should expect ${method.args} argument${method.args == 1 ? "" : "s"}.`);
            }
        }
        for (let method of requiredPositionMethods) {
            if (!Object.hasOwn(posProto, method.name) || posProto[method.name].length !== method.args) {
                throw new Error(`${method.name} method is not defined in the Position class returned from getInitialPosition or has the wrong number of arguments, it should expect ${method.args} argument${method.args == 1 ? "" : "s"}.`);
            }
        }
    }
    catch (e) {
        throw new AdversarialSearchBuildError("Error evaluating code: " + e, "case");
    }

    try {
        "use strict";
        let solverBuilder: (base: any, game: AdversarialSearchCase) => AdversarialSearchSolution = eval?.(solutionCode);
        solver = solverBuilder(AdversarialSearchSolution, game);
        let solverProto = Object.getPrototypeOf(solver);

        for (let method of requiredSolverMethods) {
            if (!Object.hasOwn(solverProto, method.name) || solverProto[method.name].length !== method.args) {
                throw new Error(`${method.name} method is not defined in the Solution class or has the wrong number of arguments, it should expect ${method.args} argument${method.args == 1 ? "" : "s"}.`);
            }
        }
    } catch (e) {
        throw new AdversarialSearchBuildError("Error evaluating code: " + e, "solver");
    }

    return [solver, game];
}
