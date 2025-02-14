import { ParsingError } from "../errors/error";
import { mergeInPlace } from "../utils/objects";
import { GraphEdge, GraphEdgeSimple, GraphEdgeStyle, GraphNode, GraphNodeStyle } from "./components";
import { DIAG_WEIGHT_TERMS, GenericGraph, Graph, GridGraph } from "./graph";

function removeQuotes(s: string): string {
    if (s.startsWith("\"")) return s.substring(1, s.length - 1);
    return s;
}

function ensureArgsLength(args: Array<any>, expectedLength: number, phase: string, currentLineIdx: number, cmd: string) {
    if (args.length != expectedLength) throw new ParsingError(`Invalid argument count in ${phase}, expected ${expectedLength}, received ${args.length}`, currentLineIdx, cmd.length + 1);
}

function ensureGetNodeById(graph: Graph, nodeId: string, phase: string, currentLine: string, currentLineIdx: number): GraphNode {
    let node = graph.getNodeById(nodeId);
    if (node === undefined) throw new ParsingError(`Invalid node ID in ${phase}, received \"${nodeId}\"`, currentLineIdx, currentLine.indexOf(nodeId));
    return node;
}

function splitDataAndStyle<StyleT>(rawData: Object): [Object, StyleT] {
    if ("style" in rawData) {
        let style = rawData["style"] as StyleT;
        delete rawData["style"];
        return [rawData, style];
    }
    return [rawData, {} as StyleT];
}

function invalidCommandSyntax(lineIdx: number) {
    return new ParsingError("Couldn't parse line contents into a valid command, commands must contain an uppercase command and at least one argument.", lineIdx, 0, "CMD args -o --long-option {\"x\": 1, \"style\": {\"color\": \"red\"}}");
}

function ensureGetNodeByCoords(graph: GridGraph, x: number, y: number, phase: string, currentLineIdx: number): GraphNode {
    let node = graph.getNodeByCoords(x, y);
    if (node === undefined) throw new ParsingError(`Invalid node coordinates in ${phase}, received (${x},${y}), but graph is (${graph.width}x${graph.height})`, currentLineIdx, -1);
    return node;
}

function getSingleNodeFromCoordArgs(graph: GridGraph, coordArgs: string[], phase: string, lineIdx: number, cmd: string): GraphNode {
    ensureArgsLength(coordArgs, 2, phase, lineIdx, cmd);
    let [x, y] = coordArgs.map(n => {return parseInt(n,10)});
    return ensureGetNodeByCoords(graph, x, y, phase, lineIdx);
}

function getNodesFromCoordArgs(graph: GridGraph, coordArgs: string[], phase: string, lineIdx: number, cmd: string, nodeCount: number = 2): GraphNode[] {
    ensureArgsLength(coordArgs, 2 * nodeCount, phase, lineIdx, cmd);
    let nums = coordArgs.map(n => {return parseInt(n,10)});
    let result = [];
    for (let i = 0; i < 2 * nodeCount; i+=2) {
        let [x, y] = [nums[i], nums[i+1]];
        result.push(ensureGetNodeByCoords(graph, x, y, phase, lineIdx));
    }
    return result;        
}

const stmt_regex = /(?<cmd>[A-Z]+) +(?<args>( *("[^"]+"|\w+))+)(?<opts>( +-[\-a-zA-Z0-9]+)*)(?<data> *\{.+\})?/;
const arg_regex = /"[^"]+"|\w+/g;
function parseCommand(line: string, lineIdx: number): {cmd: string, args: string[], opts: string[], data: Object} | undefined {
    line = line.trim();
    if (line === "") return undefined;
    if (line.startsWith("#")) return undefined;
    const match = stmt_regex.exec(line);
    if (!match) throw invalidCommandSyntax(lineIdx);
    const cmd = match.groups!["cmd"];
    const argsRaw = match.groups!["args"];
    const optsRaw = match.groups!["opts"];
    const dataRaw = match.groups!["data"];
    const data: Object = dataRaw ? JSON.parse(dataRaw) : {};
    const argsMatch: RegExpMatchArray[] = [... argsRaw.matchAll(arg_regex)];
    const args = argsMatch.map(s => removeQuotes(s[0]));
    const opts: string[] = optsRaw.split(/\s+/);
    return {"cmd": cmd, "data": data, "args": args, "opts": opts};
}

export function preprocessGraphNotation(text: string): string[] {
    const result = text.trim().split(/(?:\s*\r?\n)+\s*/g).map(l => l.trim());
    // console.log(result);
    return result;
}

export function genericGraphFromNotation(lines: string[]): GenericGraph {
    let result = new GenericGraph();
    for (let i = 1; i < lines.length; i++) {
        let line = lines[i];
        let parsedCmd = parseCommand(line, i);
        if (parsedCmd === undefined) continue;
        let {cmd, args, opts, data} = parsedCmd;
        //console.log(`Parsed command: ${cmd} with args ${args} and opts ${opts}`)
        switch (cmd) {
            case "NODE":
                ensureArgsLength(args, 1, "node setup", i, cmd);
                let node = new GraphNode(result, args[0]);
                [node.data, node.style] = splitDataAndStyle<GraphNodeStyle>(data);
                let existingNode = result.getNodeById(node.id);
                if (existingNode === undefined) {
                    result.addNode(node);
                } else {
                    // If it exists, merge data and style
                    mergeInPlace(existingNode.data, node.data);
                    mergeInPlace(existingNode.style, node.style);
                }
                break;
            case "EDGE":
                ensureArgsLength(args, 2, "edge setup", i, cmd)
                let nodeA = ensureGetNodeById(result, args[0], "edge setup", line, i);
                let nodeB = ensureGetNodeById(result, args[1], "edge setup", line, i);
                let bidirectional = opts.includes("-b") || opts.includes("--bidirectional");
                let edge = new GraphEdgeSimple(result.getNextEdgeIdentifier(), nodeA, nodeB, bidirectional);
                [edge.data, edge.style] = splitDataAndStyle<GraphEdgeStyle>(data);
                result.addEdge(edge);
                break;
            case "START":
                ensureArgsLength(args, 1, "start node indication", i, cmd);
                let startNode = ensureGetNodeById(result, args[0], "start node indication", line, i);
                result.startNode = startNode;
                break;
            case "GOAL":
                ensureArgsLength(args, 1, "goal node indication", i, cmd);
                let endNode = ensureGetNodeById(result, args[0], "goal node indication", line, i);
                result.endNode = endNode;
                break;
        }
    }
    // console.log(result);
    return result;
}

export function gridGraphFromNotation(lines: string[]): GridGraph {
    let dimsRaw = lines[0].substring(lines[0].indexOf(" "))
    let dimsStr = dimsRaw.split("x");
    if (dimsStr.length != 2) throw new ParsingError("The GRID graph type requires two dimensions expressed in the format <WIDTH>x<HEIGHT> following the GRID specifier", 0, "GRID ".length, "GRID 10x8");
    let [x, y] = dimsStr.map(s => parseInt(s.trim()));

    let result = new GridGraph(x, y);
    // Create empty nodes in an X by Y grid
    for (let cx = 0; cx < x; cx++) {
        for (let cy = 0; cy < y; cy++) {
            result.createNode(cx, cy);
        }
    }
    // parsing, to include edges and set default styles
    for (let i = 1; i < y + 1; i++) {
        let line = lines[i].trim();
        let segments = line.split(/\s+/);
        let vals = segments.map(n => parseInt(n.trim()));
        for (let j in segments) {
            if (isNaN(vals[j])) throw new ParsingError(`Invalid traversability value (NaN), received "${segments[j]}" (${line})`, i, 0, "1")
        }
        if (vals.length != x) throw new ParsingError(`Invalid grid row, expected ${x} numeric values, got ${vals.length} (${line})`, i, 0, "1 ".repeat(x).trimEnd());
        for (let j = 0; j < x; j++) {
            let node = result.ensureGetNodeByCoords(j, i - 1);
            let val = vals[j];
            node.data["traversable"] = val > 0;
        }
    }
    
    let debugData: Record<string, any> = {};
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            let node = result.ensureGetNodeByCoords(j, i);
            debugData[node.id] = node.data;
        }
    }
    // console.log(debugData);

    // Construction of edges
    // Now done in a separate function!
    /*
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            const thisNode = result.ensureGetNodeByCoords(j, i);
            if (!thisNode.data["traversable"]) continue;
            for (let [dx,dy] of ADJACENT_POSITIVE_DELTAS) {
                let adjX = j + dx; let adjY = i + dy;
                if (adjX < 0 || adjX >= x || adjY < 0 || adjY >= y) continue;
                const adjNode = result.ensureGetNodeByCoords(adjX, adjY);
                if (!adjNode.data["traversable"]) continue;
                const newEdge = new GraphEdgeSimple(thisNode, adjNode, true);
                result.addEdge(newEdge);
                //console.log(`Added edge: ${newEdge.source.id}-${newEdge.target.id}`);
            }
        }
    }
    */
    //console.log(result.getAllEdges());
    result.updateAllTraversableEdges();
    for (let i = y + 1; i < lines.length; i++) {
        let line = lines[i].trim();
        let parsedCmd = parseCommand(line, i);
        if (parsedCmd === undefined) continue;
        let {cmd, args, opts, data} = parsedCmd;
        switch (cmd) {
            case "NODE":
                ensureArgsLength(args, 2, "node setup", i, cmd);
                let node = getSingleNodeFromCoordArgs(result, args, "node setup", i, cmd);
                [node.data, node.style] = splitDataAndStyle<GraphNodeStyle>(data);
                break;
            case "DIAGONAL":
                ensureArgsLength(args, 1, "diagonal setting", i, cmd);
                let diagMode = args[0].toLowerCase();
                let diagWeight = parseFloat(diagMode);
                if (!isNaN(diagWeight)) {
                    result.diagonalWeights = diagWeight;
                    result.updateAllTraversableEdges();
                    break;
                }
                if (!(diagMode in DIAG_WEIGHT_TERMS)) throw new ParsingError(`Invalid diagonal weight mode, expected one of ${Object.keys(DIAG_WEIGHT_TERMS).join(", ")} or a number, got ${diagMode}`, i, cmd.length + 1);
                result.diagonalWeights = DIAG_WEIGHT_TERMS[diagMode];
                result.updateAllTraversableEdges();
                break;
            case "EDGE":
                ensureArgsLength(args, 4, "edge setup", i, cmd);
                let [nodeA, nodeB] = getNodesFromCoordArgs(result, args, "edge setup", i, cmd, 2);
                let edge = result.getEdge(nodeA, nodeB);
                if (!edge) throw new ParsingError(`No edge exists between the two given nodes (${nodeA.id} and ${nodeB.id})`, i, -1);
                let [newData, newStyle] = splitDataAndStyle<GraphEdgeStyle>(data);
                for (let k of Object.keys(newData)) {
                    edge.data[k] = (newData as any)[k];
                }
                for (let k of Object.keys(newStyle)) {
                    edge.style[k as keyof GraphEdgeStyle] = (newStyle as any)[k];
                }
                let bidirectionality = opts.includes("-b") || opts.includes("--bidirectional");
                edge.isBidirectional = bidirectionality;
                break;
            case "START":
                ensureArgsLength(args, 2, "start node indication", i, cmd);
                let startNode = getSingleNodeFromCoordArgs(result, args, "start node indication", i, cmd);
                result.startNode = startNode;
                break;
            case "GOAL":
                ensureArgsLength(args, 2, "goal node indication", i, cmd);
                let endNode = getSingleNodeFromCoordArgs(result, args, "goal node indication", i, cmd);
                result.endNode = endNode;
                break;
        }
    }
    return result;
}

export function notationFromGridGraph(graph: GridGraph): string {
    let lines = [`GRID ${graph.width}x${graph.height}`];
    //throw new NotImplementedError("Generic Graph Stringification");
    for (let y = 0; y < graph.height; y++) {
        let nodeReprs: string[] = []
        for (let x = 0; x < graph.width; x++) {
            let node = graph.getNodeByCoords(x, y);
            if (!node) {
                nodeReprs.push(`?${GridGraph.idFromCoords(x, y)}`);
                continue;
            }
            nodeReprs.push(node.getProp("traversable") ? "1" : "0")
        }
        lines.push(nodeReprs.join(" "));
    }
    lines.push(`DIAGONAL ${getDiagonalWeightName(graph.diagonalWeights)}`);
    if (graph.startNode)
        lines.push(`START ${graph.startNode.x} ${graph.startNode.y}`);
    if (graph.endNode)
        lines.push(`GOAL ${graph.endNode.x} ${graph.endNode.y}`);

    for (let node of graph.getAllNodes()) {
        let data = node.getSerializableData();
        if (Object.keys(data).length == 0) continue;
        lines.push(`NODE ${node.x} ${node.y} ${JSON.stringify(data)}`);
    }
    for (let edge of graph.getAllEdges()) {
        let data = getSerializableEdgeData(edge);
        let [dx,dy] = [Math.abs(edge.source.x - edge.target.x), Math.abs(edge.source.y - edge.target.y)];
        let isOrthoAdjacent = dx + dy <= 1;
        let isDiagAdjacent = dx == 1 && dy == 1;
        let expectedWeight = isDiagAdjacent ? graph.diagonalWeights : 1;
        if (edge.weight !== expectedWeight) {
            data["w"] = edge.weight;
        } else {
            delete data["w"];
        }
        // Default data
        if ((isOrthoAdjacent || isDiagAdjacent) && Object.keys(data).length == 0 && edge.isBidirectional) continue;
        let opts = [];
        if (edge.isBidirectional) {
            opts.push("-b");
        }

        let dataStr = JSON.stringify(data);
        if (dataStr === "{}") dataStr = "";
        lines.push(`EDGE ${edge.source.x} ${edge.source.y} ${edge.target.x} ${edge.target.y} ${opts.join(" ")} ${dataStr}`.trimEnd());
    }
    return lines.join("\n");
}

export function getDiagonalWeightName(weight: number): string {
    for (let [name, value] of Object.entries(DIAG_WEIGHT_TERMS)) {
        if (value === weight) return name;
    }
    return weight.toString();
}

function getSafeId(id: string): string {
    if (id.indexOf(" ") != -1) return `"${id}"`;
    if (id.indexOf("\"") != -1) return `"${id.replace(/"/g, "\\\"")}"`;
    return id;
}

function getSerializableEdgeData(edge: GraphEdge): Record<string, any> {
    let innerData: Record<string, any> = {};
    if (edge.style && Object.keys(edge.style).length > 0)
        innerData.style = edge.style;
    let serializedKeyValues: [string, any][] = [["flipped", false], ["w", 1], ["label", undefined], ["forbidden", false]];
    for (let [key, defaultVal] of serializedKeyValues) {
        if (edge.data[key] && edge.data[key] != defaultVal) innerData[key] = edge.data[key];
    }
    return innerData;
}

export function notationFromGenericGraph(graph: GenericGraph): string {
    let lines = ["GENERIC"];
    for (let node of graph.getAllNodes()) {
        let dataStr = JSON.stringify(node.getSerializableData());
        if (dataStr === "{}") dataStr = "";
        lines.push(`NODE ${getSafeId(node.id)} ${dataStr}`.trimEnd());
    }
    lines.push("");
    for (let edge of graph.getAllEdges()) {
        // Handle bidirectionality
        let opts = [];
        if (edge.isBidirectional) {
            opts.push("-b");
        }

        let dataStr = JSON.stringify(getSerializableEdgeData(edge));
        if (dataStr === "{}") dataStr = "";
        lines.push(`EDGE ${getSafeId(edge.source.id)} ${getSafeId(edge.target.id)} ${opts.join(" ")} ${dataStr}`.trimEnd());
    }
    lines.push("");
    if (graph.startNode) lines.push(`START ${graph.startNode.id}`);
    if (graph.endNode) lines.push(`GOAL ${graph.endNode.id}`);
    return lines.join("\n");
}

export type RawGraph = {

}

type RawNode = {

}

type RawEdge = {

}

export function graphFromRaw(graph: RawGraph): Graph {
    return new GenericGraph();
}
