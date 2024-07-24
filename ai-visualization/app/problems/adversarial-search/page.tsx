"use client"

import Header from "@/app/components/header";
import TreeView from "./components/treeView";
import SolutionEditor from "@/app/components/data/solutionEditor";
import CaseEditor from "@/app/components/data/problemEditor";
import { GenericGraph, Graph, GraphEdgeSimple, GraphNode, GridGraph } from "@/lib/graphs/graph";
import { GraphSearchResult, GraphSearchSolution, buildGraphSearchSolution } from "@/lib/graphs/graphsolution"; // Import the missing class
import { useCallback, useEffect, useRef, useState } from "react";
import { ensureError } from "@/lib/errors/error";
import { HDivider, VDivider } from "@/app/components/divider";
import { toast } from "react-toastify";
import Canvas from "@/app/components/graphics/canvas";
import { AdversarialExpansion, AdversarialSearchBuildError, AdversarialSearchSolution, buildAdversarialSolution } from "@/lib/adversarial/adversarialSolution";
import { AdversarialSearchCase, AdversarialSearchPosition } from "@/lib/adversarial/adversarialCase";
import { PropertyInspector } from "@/app/components/data/propertyEditor";

import "./adversarial-search.css";
import { ItemProperty } from "@/lib/utils/properties";

const defaultDraw = (ctx: CanvasRenderingContext2D) => {}

type ExpansionGenerator = {
    generator: Generator<AdversarialExpansion, void>,
    initialPosition: AdversarialSearchPosition
}

export default function GraphSearchPage() {
    let [leftWidth, setLeftWidth] = useState(480);
    let [solHeight, setSolHeight] = useState(520);
    let [caseErrorMessage, setCaseErrorMessage] = useState("");
    let [algoErrorMessage, setAlgoErrorMessage] = useState("");
    let [debugData, setDebugData] = useState<any>(null);
    let [algoData, setAlgoData] = useState("");
    let [caseData, setCaseData] = useState("");
    let [graphRenderKey, setGraphRenderKey] = useState(0);
    
    let [game, setGame] = useState<AdversarialSearchCase | null>(null);
    let [solver, setSolver] = useState<AdversarialSearchSolution | null>(null);
    let [expansionGenerator, setExpansionGenerator] = useState<ExpansionGenerator | null>(null);

    // visualization
    let [initialPosition, setInitialPosition] = useState<AdversarialSearchPosition | null>(null);
    let [shownPosition, setShownPosition] = useState<AdversarialSearchPosition | null>(null);

    // property management
    let [gameProperties, setGameProperties] = useState<ItemProperty[]>([])

    function runAlgo() {
        try {
            let [solver, game] = buildAdversarialSolution(algoData, caseData);
            setSolver(solver);
            setGame(game);
            initializeGame(game, solver);
            setGameProperties(game.properties);
            setExpansionGenerator(null);
            setCaseErrorMessage("");
            setAlgoErrorMessage("");
        } catch (err) {
            let error = ensureError(err);
            if (error instanceof AdversarialSearchBuildError) {
                let fault = error.fault;
                if (fault === "solver") {
                    setAlgoErrorMessage(error.message);
                } else if (fault === "case") {
                    setCaseErrorMessage(error.message);
                }
            }
            else 
            {
                setAlgoErrorMessage(`Runtime error: ${error.stack}`);
            }
        }
    }

    function initializeGame(game: AdversarialSearchCase, solver: AdversarialSearchSolution) {
        setGraphRenderKey(0);
        setShownPosition(solver.gameTree.startNode!.data.position);
    }

    let runExpansion = useCallback((maxExpansions: number = Infinity, timeoutMs: number = 1000) => {
        if (!game || !solver) {
            return;
        }

        let startTime = Date.now();
        let initialPos = initialPosition ?? game.getInitialPosition();
        console.log(initialPos);
        solver.allowedExpansions = maxExpansions;
        let expander = expansionGenerator;
        if (!expansionGenerator || expansionGenerator.initialPosition.id !== initialPos.id) {
            expander = {
                generator: solver.runExpansion(initialPos),
                initialPosition: initialPos
            }
            setExpansionGenerator(expander);
        }
        while (solver.allowedExpansions > 0) {
            let action : IteratorResult<AdversarialExpansion>;
            try {
                action = expander!.generator.next();
            } catch (err) {
                let error = ensureError(err);
                toast.error(error.stack);
                break;
            }
            if (action.done) {
                toast.success("Expansion complete");
                break;
            }
            if (Date.now() - startTime > timeoutMs) {
                toast.error("Timeout reached");
                break;
            }
        }
        if (solver.allowedExpansions <= 0) {
            toast.success("Expansion limit reached");
        }
        let playSequence = solver.getPlaySequence(initialPos);
        console.log(playSequence);
        // highlight move sequence
        let curNode = solver.gameTree.getNodeById(initialPos.id);
        for (let move of playSequence) {
            if (!curNode) break;
            let nextNode = solver.gameTree.getNodeById(move.position.id);
            if (!nextNode) break;
            let edge = solver.gameTree.getEdge(curNode, nextNode);
            if (edge) {
                edge.setProp("highlight", true);
            }
            curNode = nextNode;
        }
        console.log(solver);
        setGraphRenderKey(graphRenderKey + 1);
    }, [game, solver, initialPosition, graphRenderKey]);

    const onGamePropertyChange = useCallback((property: string, oldValue: any, newValue: any) => {
        game?.setProp(property, newValue);
        setGameProperties(game?.properties ?? []);
    }, [game, graphRenderKey, shownPosition, solver]);
    const onPositionPropertyChange = useCallback((property: string, oldValue: any, newValue: any) => {
        if (property === "__expand") {
            console.log(`Expanding ${shownPosition?.id}`);
            if (shownPosition) solver?.expand(shownPosition);
            setGraphRenderKey(graphRenderKey + 1);
            return;
        }
        shownPosition?.setProp(property, newValue);
    }, [shownPosition]);

    const onCaseDataChanged = useCallback((rawData: string) => {
        setCaseData(rawData);
        setCaseErrorMessage("");
        // For this problem, this is code that runs with the algorithm
    }, []);

    const onAlgoDataChanged = useCallback((rawData: string) => {
        setAlgoData(rawData);
        setAlgoErrorMessage("");
    },[]);

    const onNodeSelected = useCallback((node: GraphNode | null) => {
        let pos: AdversarialSearchPosition = node?.data.position;
        setShownPosition(pos ?? null);
    },[]);

    const positionRender = useCallback((ctx: CanvasRenderingContext2D) => {
        if (shownPosition) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            shownPosition.render(ctx);
        }
    }, [shownPosition, gameProperties]);

    let extendedProperties = shownPosition ? shownPosition.properties : [];
    let positionNode = solver?.gameTree.getNodeById(shownPosition?.id ?? "");
    if (shownPosition && positionNode) {
        let isPositionTerminal = shownPosition.isTerminal();
        extendedProperties.push(...[
            {name: "isTerminal", value: isPositionTerminal, type: "boolean", fixed: true, display: "Terminal?"},           
        ]);
        if (!isPositionTerminal) {
            extendedProperties.push(...[
                {name: "__expand", value: positionNode.data.expanded, type: "boolean", display: "Expand", trigger: true}
            ]);
        }
    }

    return (
        <div className="flex flex-col h-dvh overflow-hidden">
            <Header selectedPage="adversarialsearch"></Header>
            <div className="flex flex-row items-stretch flex-grow">
                <div className="flex flex-col justify-center" style={{"width": `${leftWidth}px`}}>
                    <SolutionEditor problem="adversarial-search" solutionHeight={solHeight} onSolutionChanged={onAlgoDataChanged} runner={runAlgo} errorMessage={algoErrorMessage}></SolutionEditor>
                    <HDivider onWidthChangeRequest={function (v: number): void {
                        setSolHeight(solHeight + v);
                    } }></HDivider>
                    <CaseEditor problem="adversarial-search" codeMode caseData={caseData} onCaseDataChanged={onCaseDataChanged} errorMessage={caseErrorMessage}></CaseEditor>
                </div>
                <VDivider onWidthChangeRequest={(v => {
                    setLeftWidth(leftWidth + v);
                })}></VDivider>
                <div className="relative overflow-hidden flex flex-row p-3 m-2 rounded-md border-accent dark:border-accent-200 border-solid border flex-grow">
                    <div className="tree-inspector max-h-[calc(100dvh-110px)]">
                        <TreeView renderKey={graphRenderKey} graph={solver?.gameTree ?? null} onNodeSelected={onNodeSelected}></TreeView>
                    </div>
                    <div className="game-view w-1/2 max-h-[calc(100dvh-110px)] flex justify-center align-middle">
                        <div className="relative w-full h-full">
                            <Canvas className="mx-auto max-h-full max-w-full" draw={positionRender} width={500} height={1000}></Canvas>
                            <div className="absolute left-0 top-0 h-full w-full" id="gameDiv"></div>
                        </div>
                    </div>
                    { game ? 
                        <div className="game-inspector">
                            <PropertyInspector properties={gameProperties} onChange={(p,o,v) => onGamePropertyChange(p,o,v)}></PropertyInspector>
                        </div> : <></>
                    }
                    { shownPosition !== null ? 
                        <div className="position-inspector">
                            <h3>{shownPosition.id}</h3>
                            <PropertyInspector properties={extendedProperties} onChange={(p,o,v) => onPositionPropertyChange(p,o,v)}></PropertyInspector>
                        </div> : <></>
                    }
                    { solver ? 
                        <div className="controls">
                            <button onClick={() => runExpansion(1)}>Expand</button>
                            <button onClick={() => runExpansion(5)}>Expand 5</button>
                            <button onClick={() => runExpansion(10)}>Expand 10</button>
                            <button onClick={() => runExpansion(Number.MAX_SAFE_INTEGER)}>Expand Unlimited</button>
                        </div> : <></>
                    }
                </div>
            </div>
        </div>
    )
}