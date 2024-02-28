"use client"

import { DocsClass } from "@/app/components/docs/docsClass";
import { DocsContainer } from "@/app/components/docs/docsContainer";
import { DocsFunction } from "@/app/components/docs/docsFunction";
import DocsProperty from "@/app/components/docs/docsProperty";
import DocsRef from "@/app/components/docs/docsReference";
import Header from "@/app/components/header";
import { ConstDocAny, ConstDocBoolean, ConstDocGenerator, ConstDocMap, ConstDocNumber, ConstDocString, GenericDocType, IDocType, TupleArrayDocType, docArrayOf, docMaybeUndefined } from "@/lib/docs/doclib";

const GraphNodeType = new IDocType("GraphNode", "", "GraphNode");
const GraphEdgeType = new IDocType("GraphEdge", "", "GraphEdge");
const GraphType = new IDocType("Graph", "", "Graph");

export default function GraphSearchDocs() {
    return (
        <div>
            <Header selectedPage="graphsearch"></Header>
            <DocsContainer title={"Graph Search Documentation"}>
                <div>
                This documentation refers to the Graph Search problem. Your solution should be a 
                class extending <a href="#GraphSearchSolution">GraphSearchSolution</a>, which overrides the following functions:
                </div>
                <ul className="list-disc *:ml-5">
                    <li><a href="#GraphSearchSolution.constructor">constructor</a></li>
                    <li><a href="#GraphSearchSolution.solve">solve</a></li>
                </ul>
                <DocsClass clazzName={"GraphSearchSolution"}>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="constructor" hideReturnType args={[
                        {name: "graph", type: GraphType}
                    ]}>
                        <p>The constructor of the GraphSearchSolution class provides the graph to you, you can use it to do preprocessing or simply store it as an instance variable.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="solve" args={[
                        {name: "start", type: GraphNodeType},
                        {name: "goal", type: GraphNodeType}
                    ]}>
                        <p>This will be called when you request a run of the algorithm. The function provides the start of the search and the target as parameters.</p>

                        <p>You can return <DocsRef refs="GraphSearchSolution.success">success()</DocsRef> or <DocsRef refs="GraphSearchSolution.failure">failure()</DocsRef> as a shorthand.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="success" args={[]}>
                        <p>This function declares the successful completion of the algorithm.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="failure" args={[]}>
                        <p>This function declares the unsuccessful completion of the algorithm.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="expand" args={[
                        {name: "node", type: GraphNodeType}
                    ]}>
                        <p>This will mark a node as expanded in the graphical interface</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="visit" args={[
                        {name: "node", type: GraphNodeType}
                    ]}>
                        <p>This will mark a node as visited in the graphical interface</p>
                    </DocsFunction>
                </DocsClass>
                <DocsClass clazzName={"Graph"}>
                    <DocsFunction clazzName="Graph" functionName="getAdjacentNodes" args={[
                        {name: "node", type: GraphNodeType}
                    ]} returnType={new GenericDocType(ConstDocGenerator, [GraphNodeType])}>
                        <p>This allows you to obtain an array of all nodes which are accessible from one given node.</p>
                    
                        <p>Note: if multiple traversable edges connect the nodes, the generator will generate duplicate entries.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="getAdjacentData" args={[
                        {name: "node", type: GraphNodeType}
                    ]} returnType={new GenericDocType(ConstDocGenerator, [new TupleArrayDocType([GraphNodeType, ConstDocNumber])])}>
                        <p>This function is similar to <DocsRef refs="Graph.getAdjacentNodes">getAdjacentNodes</DocsRef>, but also gives you the weight of the edge one would have to traverse to reach the target node.</p>
                    
                        <p>Note: if multiple traversable edges connect the nodes, the generator will generate duplicate entries, with potentially differing weights.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="getNodeById" args={[
                        {name: "nodeId", type: ConstDocString}
                    ]} returnType={docMaybeUndefined(GraphNodeType)}>
                        <p>This allows you to get a reference to any node in the graph by its string ID.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="getEdge" args={[
                        {name: "source", type: GraphNodeType},
                        {name: "target", type: GraphNodeType}
                    ]} returnType={docMaybeUndefined(GraphEdgeType)}>
                        <p>This function will return the first edge found that goes from the source to the target, and which is traversable.</p>
                        <p>If no such edge exists, it will return undefined instead.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="getAllNodes" args={[
                    ]} returnType={docArrayOf(GraphNodeType)}>
                        <p>This function returns all nodes in the graph.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="getAllEdges" args={[
                    ]} returnType={docArrayOf(GraphEdgeType)}>
                        <p>This function returns all edges in the graph, note that this includes edges which may be virtual or untraversable.</p>
                        <p>You can use the edge&apos;s <DocsRef refs="GraphEdge.isRef">isRef</DocsRef> property or its <DocsRef refs="GraphEdge.traversable">traversable()</DocsRef> function to check if it is a virtual edge or untraversable respectively.</p>
                    </DocsFunction>
                </DocsClass>
                <DocsClass clazzName={"GraphNode"}>
                    <p>The Node is the most basic element in the graph, every node has an <DocsRef refs="GraphNode.id">id</DocsRef> which uniquely identifies it.</p>
                    <DocsProperty property={{name: "id", type: ConstDocString}}>
                        <p>The unique identifier of this node in the graph.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "graph", type: GraphType}}>
                        <p>A reference to the graph that contains this node.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "x", type: ConstDocNumber}}>
                        <p>For grid graphs, the 0-indexed x coordinate of this node.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "y", type: ConstDocNumber}}>
                        <p>For grid graphs, the 0-indexed y coordinate of this node.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "data", type: new GenericDocType(ConstDocMap, [ConstDocString, ConstDocAny])}}>
                        <p>Arbitrary data stored in this node. Grid graphs guarantee a key named <i>traversable</i>, which is false only if the node is a wall in the grid graph.</p>

                        <p>You may use this field to store data in the graph. Note that it must be serializable, so you should avoid cyclical data. You may use node IDs to refer to other nodes.</p>
                    </DocsProperty>
                </DocsClass>
                <DocsClass clazzName={"GraphEdge"}>
                    <p>Edges are slightly complicated, but very powerful! Edges always have a mirrored version which we will call a virtual edge.</p>
                    <p>Edges connect pairs of nodes. For bidirectional edges, both the regular and virtual edges are traversable. For directed edges, only the regular edge is traversable, but a virtual edge still exists! This can help you identify the in-degree of a node for directed graphs.</p>
                    <p>Edges provide a series of helpful properties and functions that should allow you to use them effectively.</p>
                    <DocsProperty property={{name: "source", type: GraphNodeType}}>
                        <p>The source of this edge, that is, the node to which it adds an out-degree.</p>
                        <p>In the case of bidirectional edges, the source is arbitrary</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "target", type: GraphNodeType}}>
                        <p>The target of this edge, that is, the node to which it adds an in-degree.</p>
                        <p>In the case of bidirectional edges, the source is arbitrary</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "weight", type: ConstDocNumber}}>
                        <p>The weight associated with this edge. For bidirectional edges, it is the same in both directions.</p>
                        <p>If you wish to simulate a bidirectional edge with different weights, use two directed edges instead. (Useful for case editing)</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "isBidirectional", type: ConstDocBoolean}}>
                        <p>Indicates whether this edge is bidirectional.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "isRef", type: ConstDocBoolean}}>
                        <p>Indicates whether this edge is virtual.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "data", type: new GenericDocType(ConstDocMap, [ConstDocString, ConstDocAny])}}>
                        <p>Arbitrary data stored in this edge.</p>

                        <p>You may use this field to store data in the graph. Note that it must be serializable, so you should avoid cyclical data. You may use node IDs to refer to nodes, or pairs of nodeIDs to refer to edges.</p>
                    </DocsProperty>
                    <DocsFunction functionName={"traversable"} returnType={ConstDocBoolean}>
                        <p>This tells you whether a function is traversable, this is equivalent to <code>!isRef || isBidirectional</code>.</p>
                    </DocsFunction>
                    <DocsFunction functionName={"reverse"} returnType={GraphEdgeType}>
                        <p>This function allows you to obtain the mirror of an edge. For regular edges, this returns the virtual edge. For virtual edges, this returns a regular edge.</p>
                    </DocsFunction>
                </DocsClass>
            </DocsContainer>
        </div>
    )
}