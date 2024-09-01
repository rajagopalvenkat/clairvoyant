import {expect, jest, test} from '@jest/globals';
import { GenericGraph, Graph, GraphEdgeSimple, GraphNode, GridGraph } from '../graph';

// test parsing
test("Generic Parsing", () => {
    const graph = GenericGraph.fromNotation(`GENERIC
        NODE A {"a": "hello world"}
        NODE B
        NODE C
        NODE D

        EDGE A B {"w": 2, "edgeTest": true}
        EDGE B C -b
        EDGE B D

        START A
        GOAL C

        # Extra edges
        EDGE B D -b {"w": 3, "secondary": true}

        # Data!
        NODE A {"x": 1}
    `);
    // basic contents
    expect(graph.getAllNodes()).toHaveLength(4);
    expect(graph.getAllEdges()).toHaveLength(4);
    // node fetching
    let nodeA = graph.getNodeById("A");
    let nodeB = graph.getNodeById("B");
    let nodeC = graph.getNodeById("C");
    let nodeD = graph.getNodeById("D");
    expect(nodeA).toBeDefined();
    expect(nodeB).toBeDefined();
    expect(nodeC).toBeDefined();
    expect(nodeD).toBeDefined();
    // edges
    let edgeBC = graph.getEdge(nodeB!, nodeC!);
    expect(edgeBC).toBeDefined();
    expect(edgeBC!.isBidirectional).toBeTruthy();
    let edgeBA = graph.getEdge(nodeB!, nodeA!, true);
    expect(edgeBA).toBeDefined();
    expect(edgeBA!.traversable()).toBeFalsy();
    expect([...graph.getEdges(nodeB!, nodeD!)]).toHaveLength(2);
    // start, end, and referential equality
    expect(Object.is(graph.startNode, nodeA)).toBe(true);
    expect(Object.is(graph.endNode, nodeC)).toBe(true);
    // data
    expect(nodeA?.data["a"]).toEqual("hello world");
    expect(nodeA?.data["x"]).toEqual(1);
    expect(edgeBA!.data["edgeTest"]).toEqual(true); // note that it is the opposite orientation as that given in the parse!
    expect(edgeBA!.weight).toEqual(2);
})

test("Grid Parsing", () => {
    const graph = GridGraph.fromNotation(`GRID 3x2
        1 0 1
        1 1 1
        DIAGONAL MANHATTAN
        START 0 0
        GOAL 2 0

        # Merges data to existing components
        NODE 0 0 {"test": "isStart"}
        EDGE 2 1 2 0 {"w": 3.5}
    `);

    expect(graph.getAllNodes()).toHaveLength(6);
    expect(graph.getAllEdges()).toHaveLength(11); // 7 orthogonal + 4 diagonal

    let nodeTL = graph.getNodeByCoords(0, 0);
    let nodeTC = graph.getNodeByCoords(1, 0);
    let nodeTR = graph.getNodeByCoords(2, 0);
    let nodeBL = graph.getNodeByCoords(0, 1);
    let nodeBC = graph.getNodeByCoords(1, 1);
    let nodeBR = graph.getNodeByCoords(2, 1);
    [nodeTL, nodeTC, nodeTR, nodeBL, nodeBC, nodeBR].forEach(n => {
        expect(n).toBeDefined();
    })

    // traversability
    expect(nodeTL!.traversable).toBeTruthy();
    expect(nodeTC!.traversable).toBeFalsy();
    
    // edges and diagonal weights
    let edgeTLTC = graph.getEdge(nodeTL!, nodeTC!, true);
    expect(edgeTLTC).toBeDefined();
    expect(edgeTLTC!.traversable()).toBeFalsy();
    expect(edgeTLTC!.weight).toEqual(1);
    let edgeTLBC = graph.getEdge(nodeTL!, nodeBC!);
    expect(edgeTLBC).toBeDefined();
    expect(edgeTLBC!.traversable()).toBeTruthy();
    expect(edgeTLBC!.weight).toEqual(2);

    // start, end, and referential equality
    expect(Object.is(graph.startNode, nodeTL)).toBe(true);
    expect(Object.is(graph.endNode, nodeTR)).toBe(true);

    // custom data
    expect(nodeTL!.data["test"]).toEqual("isStart");
    let edgeBRTR = graph.getEdge(nodeBR!, nodeTR!, true);
    expect(edgeBRTR).toBeDefined();
    expect(edgeBRTR!.weight).toEqual(3.5);
})

function expectGraphAdjacencies(graph: Graph, node: GraphNode, adjacent: number, incoming: number) {
    expect([...graph.getAdjacentNodes(node)]).toHaveLength(adjacent);
    expect([...graph.getAdjacentEdges(node)]).toHaveLength(adjacent);
    expect([...graph.getIncomingEdges(node)]).toHaveLength(incoming);
    expect([...graph.getIncomingNodes(node)]).toHaveLength(incoming);
}

test("Graph Adjacencies", () => {
    const graph = new GenericGraph();
    const nodeA = new GraphNode(graph, "A");
    const nodeB = new GraphNode(graph, "B");
    const nodeC = new GraphNode(graph, "C");
    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addNode(nodeC);
    const edgeAB = new GraphEdgeSimple(1, nodeA, nodeB, true);
    const edgeBC = new GraphEdgeSimple(2, nodeB, nodeC, false);
    graph.addEdge(edgeAB);
    graph.addEdge(edgeBC);
    // adjacencies

    expectGraphAdjacencies(graph, nodeA, 1, 1); // adj to B, accessible from B
    expectGraphAdjacencies(graph, nodeB, 2, 1); // adj to A and C, accessible from A
    expectGraphAdjacencies(graph, nodeC, 0, 1); // adj to none, accessible from B
})