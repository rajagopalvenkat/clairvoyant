"use client"

import { DocsClass } from "@/app/components/docs/docsClass";
import { DocsContainer } from "@/app/components/docs/docsContainer";
import { DocsFunction } from "@/app/components/docs/docsFunction";
import { DocsInterface } from "@/app/components/docs/docsInterface";
import DocsProperty from "@/app/components/docs/docsProperty";
import DocsRef from "@/app/components/docs/docsReference";
import { DocsWarning } from "@/app/components/docs/docsSections";
import Header from "@/app/components/header";
import { ConstDocAny, ConstDocBoolean, ConstDocGenerator, ConstDocMap, ConstDocNumber, ConstDocRecord, ConstDocString, GenericDocType, IDocType, TupleArrayDocType, UnionDocType, docArrayOf, docMaybeUndefined } from "@/lib/docs/doclib";
import { EditableComponentType } from "../page";

const GraphNodeType = new IDocType("GraphNode", "", "GraphNode");
const GraphEdgeType = new IDocType("GraphEdge", "", "GraphEdge");
const GraphType = new IDocType("Graph", "", "Graph");
const ItemPropertyChangeType = new IDocType("ItemPropertyChange", "", "ItemPropertyChange");
const ItemPropertySetType = new IDocType("ItemPropertySet", "", "ItemPropertySet");

export default function GraphSearchDocs() {
    return (
        <div>
            <Header selectedPage="graphsearch"></Header>
            <DocsContainer title={"Graph Search Documentation"}>
                <div>
                    <p>
                        This documentation refers to the Graph Search problem. Your solution class 
                        will <b>automatically</b> extend <a href="#GraphSearchSolution">GraphSearchSolution</a>, 
                        and must override the following functions:
                    </p>
                    <ul className="list-disc *:ml-5">
                        <li><a href="#GraphSearchSolution.constructor">constructor</a></li>
                        <li><a href="#GraphSearchSolution.solve">solve</a></li>
                    </ul>
                    <p>
                        Your script should evaluate to the prototype of your defined class.
                    </p>
                </div>
                <DocsWarning>At present, your code is run as-is on your web client. <b>Long-running or infinite</b> loops will therefore crash your web client. Take appropriate actions to mitigate this issue when writing custom code. </DocsWarning>
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
                    <DocsFunction clazzName="GraphSearchSolution" functionName="success" args={[
                        {name: "debugValue", type: ConstDocAny, default: null}
                    ]}>
                        <p>This function declares the successful completion of the algorithm.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="failure" args={[
                        {name: "debugValue", type: ConstDocAny, default: null}
                    ]}>
                        <p>This function declares the unsuccessful completion of the algorithm.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="expand" args={[
                        {name: "node", type: GraphNodeType},
                        {name: "debugValue", type: ConstDocAny, default: null}
                    ]}>
                        <p>This will mark a node as expanded in the graphical interface</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="visit" args={[
                        {name: "node", type: GraphNodeType},
                        {name: "debugValue", type: ConstDocAny, default: null}
                    ]}>
                        <p>This will mark a node as visited in the graphical interface</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="log" args={[
                        {name: "debugValue", type: ConstDocAny, default: null}
                    ]}>
                        <p>This allows you to display some value without advancing the algorithm</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="highlight" args={[
                        {name: "components", type: docArrayOf(new UnionDocType([GraphNodeType, GraphEdgeType]))},
                        {name: "debugValue", type: ConstDocAny, default: null}
                    ]}>
                        <p>This will highlight the given components in the graphical interface</p>
                    </DocsFunction>
                    <DocsFunction clazzName="GraphSearchSolution" functionName="alter" args={[
                        {name: "changes", type: docArrayOf(ItemPropertySetType)},
                        {name: "debugValue", type: ConstDocAny, default: null}
                    ]}>
                        <p>This is an advanced way to interact with the properties of components</p>
                        <p>It allows you to alter any settable property of a component as part of the algorithm.</p>
                    </DocsFunction>
                </DocsClass>
                <DocsClass clazzName={"Graph"} implementz={[EditableComponentType]}>
                    <DocsFunction clazzName="Graph" functionName="*getAdjacentNodes" args={[
                        {name: "node", type: GraphNodeType}
                    ]} returnType={new GenericDocType(ConstDocGenerator, [GraphNodeType])}>
                        <p>This allows you to iterate over all nodes which are accessible from one given node.</p>
                    
                        <p>Note: if multiple traversable edges connect the nodes, the generator will generate duplicate entries.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="*getAdjacentEdges" args={[
                        {name: "node", type: GraphNodeType},
                        {name: "includeUntraversable", type: ConstDocBoolean, default: false}
                    ]} returnType={new GenericDocType(ConstDocGenerator, [GraphEdgeType])}>
                        <p>This allows you to iterate over all edges that originate from a given node.</p>
                    
                        <p>Note: if multiple traversable edges connect the nodes, the generator will generate duplicate entries, with potentially differing weights.</p>

                        <p>If <code>includeUntraversable</code> is set to <code>true</code>, the result will include edges (including virtual edges) which cannot be traversed.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="*getIncomingNodes" args={[
                        {name: "node", type: GraphNodeType}
                    ]} returnType={new GenericDocType(ConstDocGenerator, [GraphNodeType])}>
                        <p>Functions just like <DocsRef refs="Graph.getAdjacentNodes">getAdjacentNodes</DocsRef>, but uses reversed edges.</p>

                        <p>In practice, this means one obtains the nodes that can directly reach the given node, as opposed to the reciprocal case.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="*getIncomingEdges" args={[
                        {name: "node", type: GraphNodeType},
                        {name: "includeUntraversable", type: ConstDocBoolean, default: false}
                    ]} returnType={new GenericDocType(ConstDocGenerator, [GraphEdgeType])}>
                        <p>Functions just like <DocsRef refs="Graph.getAdjacentEdges">getAdjacentEdges</DocsRef>, but uses reversed edges.</p>

                        <p>In practice, this means one obtains the edges whose <DocsRef refs="GraphEdge.target">target</DocsRef> is the given node, as opposed to the <DocsRef refs="GraphEdge.source">source</DocsRef>.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="getNodeById" args={[
                        {name: "nodeId", type: ConstDocString}
                    ]} returnType={docMaybeUndefined(GraphNodeType)}>
                        <p>This allows you to get a reference to any node in the graph by its string ID.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="getEdgeById" args={[
                        {name: "edgeId", type: ConstDocNumber}
                    ]} returnType={docMaybeUndefined(GraphEdgeType)}>
                        <p>This allows you to get a reference to any edge in the graph by its numeric ID.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="getEdge" args={[
                        {name: "source", type: GraphNodeType},
                        {name: "target", type: GraphNodeType},
                        {name: "includeUntraversable", type: ConstDocBoolean, default: false}
                    ]} returnType={docMaybeUndefined(GraphEdgeType)}>
                        <p>This function will return the first edge found that goes from the source to the target, and which is traversable (unless includeUntraversable is true).</p>
                        <p>If no such edge exists, it will return undefined instead.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="Graph" functionName="*getEdges" args={[
                        {name: "source", type: GraphNodeType},
                        {name: "target", type: GraphNodeType},
                        {name: "includeUntraversable", type: ConstDocBoolean, default: false}
                    ]} returnType={new GenericDocType(ConstDocGenerator, [GraphEdgeType])}>
                        <p>This function will yield all edges that go from the source to the target, and which are traversable (unless includeUntraversable is true).</p>
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
                <DocsClass clazzName={"GraphNode"} implementz={[EditableComponentType]}>
                    <p>The Node is the most basic element in the graph, every node has an <DocsRef refs="GraphNode.id">id</DocsRef> which uniquely identifies it.</p>
                    <DocsProperty property={{name: "id", type: ConstDocString}}>
                        <p>The unique identifier of this node in the graph.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "graph", type: GraphType}}>
                        <p>A reference to the graph that contains this node.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "heuristic", type: GraphType}}>
                        <p>This is either the automatically calculated heuristic based on <DocsRef refs="GraphNode.x">x</DocsRef> and <DocsRef refs="GraphNode.y">y</DocsRef> and its graph&apos;s goal node, or the one determined by <DocsRef refs="GraphNode.data">data</DocsRef>.h. Defaults to 0.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "x", type: ConstDocNumber}}>
                        <p>For grid graphs, the 0-indexed x coordinate of this node.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "y", type: ConstDocNumber}}>
                        <p>For grid graphs, the 0-indexed y coordinate of this node.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "data", type: new GenericDocType(ConstDocRecord, [ConstDocString, ConstDocAny])}}>
                        <p>Arbitrary data stored in this node. Grid graphs guarantee a key named <i>traversable</i>, which is false only if the node is a wall in the grid graph.</p>

                        <p>You may use this field to store data in the graph. Note that it must be serializable, so you should avoid cyclical data.</p>
                        <DocsWarning>Modifying some of these values may result in the graph being broken. Modify with caution.</DocsWarning>
                    </DocsProperty>
                </DocsClass>
                <DocsClass clazzName={"GraphEdge"} implementz={[EditableComponentType]}>
                    <p>Edges are slightly complicated, but very powerful! Edges always have a mirrored version which we will call a virtual edge.</p>
                    <p>Edges connect pairs of nodes. For bidirectional edges, both the regular and virtual edges are traversable. For directed edges, only the regular edge is traversable, but a virtual edge still exists! This can help you identify the in-degree of a node for directed graphs.</p>
                    <p>Edges provide a series of helpful properties and functions that should allow you to use them effectively.</p>
                    <DocsProperty property={{name: "id", type: ConstDocNumber}}>
                        <p>A unique numeric ID for this edge. Read-only.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "source", type: GraphNodeType}}>
                        <p>The source of this edge, that is, the node to which it adds an out-degree.</p>
                        <p>In the case of bidirectional edges, the source is arbitrary</p>
                        <p>In the case of flipped edges, the source and target are swapped.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "target", type: GraphNodeType}}>
                        <p>The target of this edge, that is, the node to which it adds an in-degree.</p>
                        <p>In the case of bidirectional edges, the source is arbitrary</p>
                        <p>In the case of flipped edges, the source and target are swapped.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "weight", type: ConstDocNumber}}>
                        <p>The weight associated with this edge. For bidirectional edges, it is the same in both directions.</p>
                        <p>If you wish to simulate a bidirectional edge with different weights, use two directed edges instead. (Useful for case editing)</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "isBidirectional", type: ConstDocBoolean}}>
                        <p>Indicates whether this edge is bidirectional. Read-only.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "isRef", type: ConstDocBoolean}}>
                        <p>Indicates whether this edge is virtual. Read-only.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "data", type: new GenericDocType(ConstDocRecord, [ConstDocString, ConstDocAny])}}>
                        <p>Arbitrary data stored in this edge.</p>
                        <p>Notably, data stores some critical information about the edge, such as whether it is flipped.</p>
                        <p>You may use this field to store data in the graph. Note that it must be serializable, so you should avoid cyclical data. Use IDs to refer to nodes or edges..</p>
                        <DocsWarning>Modifying some of these values may result in the graph being broken. Modify with caution.</DocsWarning>
                    </DocsProperty>
                    <DocsFunction functionName={"traversable"} returnType={ConstDocBoolean}>
                        <p>This tells you whether an edge is traversable from source to target.</p>
                    </DocsFunction>
                    <DocsFunction functionName={"reverse"} returnType={GraphEdgeType}>
                        <p>This function allows you to obtain the mirror of an edge. For regular edges, this returns the virtual edge. For virtual edges, this returns a regular edge.</p>
                    </DocsFunction>
                </DocsClass>
                <DocsInterface clazzName={"ItemPropertySet"}>
                    <DocsProperty property={{name: "property", type: ConstDocString}}>
                        <p>The name of the property that was changed.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "value", type: ConstDocAny}}>
                        <p>The new value of the property.</p>
                    </DocsProperty>
                    <DocsProperty property={{name: "target", type: new UnionDocType([GraphNodeType, GraphEdgeType])}}>
                        <p>The target of the property change.</p>
                    </DocsProperty>
                </DocsInterface>
            </DocsContainer>
        </div>
    )
}