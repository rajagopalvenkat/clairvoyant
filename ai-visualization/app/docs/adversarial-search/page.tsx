"use client"

import { DocsClass } from "@/app/components/docs/docsClass";
import { DocsContainer } from "@/app/components/docs/docsContainer";
import { DocsFunction } from "@/app/components/docs/docsFunction";
import { DocsInterface } from "@/app/components/docs/docsInterface";
import DocsProperty from "@/app/components/docs/docsProperty";
import DocsRef from "@/app/components/docs/docsReference";
import { DocsInfo, DocsWarning } from "@/app/components/docs/docsSections";
import Header from "@/app/components/header";
import { ConstDocAny, ConstDocBoolean, ConstDocCanvasContext, ConstDocGenerator, ConstDocMap, ConstDocNumber, ConstDocRecord, ConstDocString, GenericDocType, IDocType, TupleArrayDocType, UnionDocType, VisDocNodeOptions, docArrayOf, docMaybeUndefined } from "@/lib/docs/doclib";
import { CanvasHelperType, EditableComponentType } from "../docTypes";
import { GAME_CANVAS_X, GAME_CANVAS_Y } from "@/lib/statics/styleConstants";

const AdversarialSolverType = new IDocType("AdversarialSolver", "", "AdversarialSolver")
const AdversarialGameType = new IDocType("AdversarialGame", "", "AdversarialGame");
const AdversarialPositionType = new IDocType("AdversarialPosition", "", "AdversarialPosition");
const AdversarialActionType = new IDocType("Action", "", "Action");
const ExpansionType = new IDocType("Expansion", "", "");
const AlgoStepType = new IDocType("AlgoStep", "", "");
const AdversarialMoveType = new IDocType("Move", "", "Move");

export default function AdversarialSearchDocs() {
    return (
        <div>
            <Header selectedPage="adversarialsearch"></Header>
            <DocsContainer title={"Adversarial Search Documentation"}>
                <div>
                    <p>
                        This documentation refers to the Adversarial Search problem.
                    </p>

                    <div className="py-4">
                        <p className="mb-1"> Your script for the algorithm must evaluate to a function satisfying the following criteria:</p>
                        <ul className="list-disc *:ml-5">
                            <li key={0}>It shall have an arity of 2, the first argument is the base <DocsRef refs="AdversarialSolver">Solver</DocsRef> class and the second is a game instance.</li>
                            <li key={1}>It shall return an instance of a Solver object extending the base <DocsRef refs="AdversarialSolver">Solver</DocsRef> class.</li>
                            <li key={2}>The Solver object shall implement the following functions:
                                <ul className="list-disc *:ml-10">
                                    <li key={0}>A <DocsRef refs="AdversarialSolver.constructor">constructor</DocsRef> taking the game instance as its sole argument.</li>
                                    <li key={1}>A <DocsRef refs="AdversarialSolver.runAlgorithm">*runAlgorithm()</DocsRef> generator function. The yielded values should be obtained using the <DocsRef refs="AdversarialSolver.algoStep">algoStep()</DocsRef> function.</li>
                                    <li key={2}>A <DocsRef refs="AdversarialSolver.runExpansion">*runExpansion()</DocsRef> generator function. The yielded values should be obtained using the <DocsRef refs="AdversarialSolver.expand">expand()</DocsRef> function.</li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <div className="py-4">
                        <p className="mb-1"> Your script for the case must evaluate to a function satisfying the following criteria:</p>
                        <ul className="list-disc *:ml-5">
                            <li key={0}>It shall have an arity of 2, the first argument is the base <DocsRef refs="AdversarialGame">Game</DocsRef> class, and the second is the base <DocsRef refs="AdversarialPosition">Position</DocsRef> class.</li>
                            <li key={1}>It shall return an instance of a Game object extending the base <DocsRef refs="AdversarialGame">Game</DocsRef> class.</li>
                            <li key={2}>The Game object shall implement the following functions:
                                <ul className="list-disc *:ml-10">
                                    <li key={0}>A <DocsRef refs="AdversarialGame.getInitialPosition">getInitialPosition()</DocsRef> function, which returns a Position object.</li>
                                    <li key={1}>A <DocsRef refs="AdversarialGame.getActions">getActions(position)</DocsRef> function, which takes a Position object and returns an array of Action objects.</li>
                                    <li key={2}>A <DocsRef refs="AdversarialGame.getResult">getResult(position, action)</DocsRef> function, which takes a Position object and an Action object, and returns a new Position object which results from taken the given action in the given position.</li>
                                </ul>
                            </li>
                            <li key={3}>The Position object shall extend the base <DocsRef refs="AdversarialPosition">Position</DocsRef> class and implement the following functions:
                                <ul className="list-disc *:ml-10">
                                    <li key={0}>A <DocsRef refs="AdversarialPosition.getId">getId()</DocsRef> function which returns a unique {ConstDocString.render()} for this position.</li>
                                    <li key={1}>A <DocsRef refs="AdversarialPosition.render">render(context)</DocsRef> function which takes a 2D canvas rendering context which is {GAME_CANVAS_X} by {GAME_CANVAS_Y} pixels. It can be used to graphically draw the position onto the canvas.</li>
                                    <li key={2}>An <DocsRef refs="AdversarialPosition.isTerminal">isTerminal()</DocsRef> function, which returns true if no actions can be taken from the position, and false otherwise.</li>
                                    <li key={3}>A <DocsRef refs="AdversarialPosition.getScore">getScore()</DocsRef> function, which returns a value from -1 to 1 indicating the utility of a terminal position. For non-terminal positions, it can return anything.</li>
                                    <li key={4}>A <DocsRef refs="AdversarialPosition.getPlayer">getPlayer()</DocsRef> function, which returns 1 if it is the first player&apos;s turn, 0 if it is a state before a random action takes place, and -1 if it is the second player&apos;s turn.</li>
                                </ul>
                            </li>
                            <li key={4}>{AdversarialActionType.render()} objects may have any shape, however:
                                <ul className="list-disc *:ml-10">
                                    <li key={0}>They must include an accessible &quot;name&quot; field of type {ConstDocString.render()}, which must be unique among any actions that can be taken from any single position.</li>
                                    <li key={1}>They may optionally include an accessible &quot;label&quot; field of type {ConstDocString.render()}, which will be used (if present) to override the name field for the purpose of displaying text on edges representing actions. They need not be unique.</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
                <DocsWarning>At present, your code is run as-is on your web client. <b>Long-running or infinite</b> loops will therefore crash your web client. Take appropriate actions to mitigate this issue when writing custom code. </DocsWarning>
            
                <DocsClass clazzName="AdversarialSolver">
                    <DocsFunction functionName="constructor" clazzName="AdversarialSolver" hideReturnType args={[
                        {"name": "game", "type": AdversarialGameType}
                    ]}>
                        <p>Here, you can do any setup you need to execute before any position is initialized.</p>

                        <DocsWarning>If you override this function, you <b>must</b> call super() at the beginning of the function.</DocsWarning>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialSolver" abstract functionName="*runExpansion" returnType={new GenericDocType(ConstDocGenerator, [ExpansionType])} args={[
                        {"name": "position", "type": AdversarialPositionType}
                    ]}>
                        <p>Given the root position, this function should grow the game tree by expanding positions using the <DocsRef refs="AdversarialSolver.expand">expand</DocsRef> function.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialSolver" abstract functionName="*runAlgorithm" returnType={new GenericDocType(ConstDocGenerator, [AlgoStepType])} args={[
                        {"name": "position", "type": AdversarialPositionType}
                    ]}>
                        <p>Given the root position, this function should explore the existing game tree and yield steps using the <DocsRef refs="AdversarialSolver.algoStep">algoStep</DocsRef> function. This function should not call <DocsRef refs="AdversarialSolver.expand">expand()</DocsRef>.</p>

                        <p>To explore the game tree, use the <DocsRef refs="AdversarialPosition.moves">moves</DocsRef> field in the <DocsRef refs="AdversarialPosition">Position</DocsRef> object.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialSolver" functionName="expand" args={[
                        {name: "position", type: AdversarialPositionType}
                    ]} returnType={ExpansionType}>
                        <p>This function is meant to be yielded by your implementation of <DocsRef refs="AdversarialSolver.*runExpansion">runExpansion</DocsRef> generator.</p>
                        <p>It will populate the given position&apos;s <DocsRef refs="AdversarialPosition.moves">moves</DocsRef> field.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialSolver" functionName="algoStep" args={[]} returnType={AlgoStepType}>
                        <p>This function is meant to be yielded by your implementation of <DocsRef refs="AdversarialSolver.*runAlgorithm">runAlgorithm</DocsRef> generator.</p>
                    </DocsFunction>
                </DocsClass>
                <DocsClass clazzName="AdversarialGame" implementz={[EditableComponentType]}>
                    <DocsFunction clazzName="AdversarialGame" functionName="constructor" args={[]} hideReturnType>
                        <p>The constructor of the game. Note that you will have to return an instance of a game on your case script.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialGame" abstract functionName="getInitialPosition" args={[]} returnType={AdversarialPositionType}>
                        <p>You must implement this function, which will be run on initialization. It will return the initial position of the game.</p>

                        <DocsInfo>The application will check for the implementation of abstract methods from the {AdversarialPositionType.render()} type using the value returned by this function.</DocsInfo>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialGame" abstract functionName="getActions" args={[
                        {name: "position", type: AdversarialPositionType}
                    ]} returnType={docArrayOf(AdversarialActionType)}>
                        <p>Here is where you will implement legal move search for your game. If you prefer to do that in your position, simply return the result of calling your position&apos;s getActions method.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialGame" abstract functionName="getResult" args={[
                        {name: "position", type: AdversarialPositionType},
                        {name: "action", type: AdversarialActionType}
                    ]} returnType={AdversarialPositionType}>
                        <p>Here is where you will implement position generation for your game. Given a position and an action taken from that position, return the resulting position. You can assume that the action was taken from calling <DocsRef refs="AdversarialGame.getActions">getActions</DocsRef> with the source position as the argument.</p>
                    </DocsFunction>
                </DocsClass>
                <DocsClass clazzName="AdversarialPosition">
                    <DocsProperty clazzName="AdversarialPosition" property={{name: "moves", type: docArrayOf(AdversarialMoveType)}}>
                        <p>This is a list of moves that can be taken from the current position. This list is populated as a side effect the first time the <DocsRef refs="AdversarialSolver">solver</DocsRef>&apos;s <DocsRef refs="AdversarialSolver.expand">expand</DocsRef> function is called on it.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="AdversarialPosition" property={{name: "bestMoves", type: docArrayOf(AdversarialMoveType)}}>
                        <p>This is a subset of moves considered optimal for the current position. This should be populated by your algorithm.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="AdversarialPosition" property={{name: "utility", type: docMaybeUndefined(ConstDocNumber)}}>
                        <p>This is your calculated utility for the position. It should range from -1 to 1 and should be populated by your algorithm.</p>
                    
                        <p>The renderer will use this value to render the border color of nodes.</p>

                        <p>It will also be rendered as a fixed property in the Position inspector.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="AdversarialPosition" property={{name: "data", type: ConstDocAny}}>
                        <p>This is an object you can use to store serializable data.</p>

                        <p>It will be shown as a fixed property in the Position inspector</p>

                        <DocsWarning>If you store cyclic or otherwise nonserializable data in this field, it could cause issues when rendering the data in JSON.</DocsWarning>
                    </DocsProperty>
                    <DocsProperty clazzName="AdversarialPosition" property={{name: "style", type: VisDocNodeOptions}}>
                        <p>This will allow you to fine-tune the look of nodes in the tree display.</p>

                        <DocsWarning>A lot of the properties you can supply to nodes are already automatically populated by the renderer. You can override them, but this could hide some of the default behaviour.</DocsWarning>
                    </DocsProperty>
                    <DocsFunction clazzName="AdversarialPosition" functionName="constructor" args={[]} hideReturnType>
                        <p>This serves as the initialization for your position. You should call super() at the start of your code to initialize some of the internal properties indicated above.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialPosition" functionName="drawHelper" args={[
                        {name: "ctx", type: ConstDocCanvasContext}
                    ]} returnType={CanvasHelperType}>
                        <p>This can be used in your <DocsRef refs="AdversarialPosition.render">render</DocsRef> function to use the <DocsRef page="/docs" refs="CanvasHelper">CanvasHelper API</DocsRef>.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialPosition" abstract functionName="getId" returnType={ConstDocString} args={[]}>
                        <p>This function must be implemented and must return a unique string for the given position.</p>

                        <DocsInfo>If the same position ID is returned by positions generated from different sources, the last one will be discarded and the first position with that ID will be used. This can result in convergent edges, or even cycles, in the game graph.</DocsInfo>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialPosition" abstract functionName="render" args={[
                        {name: "ctx", type: ConstDocCanvasContext}
                    ]}>
                        <p>This function must be implemented. It provides a rendering context with which to graphically draw the position onto the canvas.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialPosition" abstract functionName="isTerminal" args={[]} returnType={ConstDocBoolean}>
                        <p>This function must be implemented and must return true for all terminal position and false for positions where actions can still be taken.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialPosition" abstract functionName="getScore" args={[]} returnType={ConstDocNumber}>
                        <p>This function must be implemented and must return a value from -1 to 1 for terminal positions. For non-terminal positions, it can return anything.</p>

                        <p>The closer the value is to 1, the more positive it is for the first player. The closer it is to -1, the better it is for the second player.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialPosition" abstract functionName="getPlayer" args={[]} returnType={ConstDocNumber}>
                        <p>This function must be implemented and must return -1, 0, or 1.</p>

                        <p>1 indicates that the first player is to play, -1 indicates the second player, and 0 indicates a random action turn for non-deterministic games.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="AdversarialPosition" abstract functionName="getHeuristic" args={[]} returnType={ConstDocNumber}>
                        <p>This function may be optionally implemented. If it is implemented, it should return a heuristic value from -1 to 1 which indicates the utility of the current non-terminal position.</p>

                        <p>Normally, if the position is terminal, it should return the same as <DocsRef refs="AdversarialPosition.getScore">getScore</DocsRef>.</p>
                    </DocsFunction>
                </DocsClass>
                <DocsInterface clazzName="Action">
                    <DocsProperty clazzName="Action" property={{name: "name", type: ConstDocString}}>
                        <p>This serves as an identifier for the action. It must be unique among all actions that can be taken in any single position.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="Action" property={{name: "label", type: ConstDocString, default: null}}>
                        <p>This property can be assigned to display a different label on action edges than the action <DocsRef refs="Action.name">name</DocsRef>.</p>
                    </DocsProperty>
                    <DocsInfo>Actions can and should contain more fields, defined at the user&apos;s discretion.</DocsInfo>
                </DocsInterface>
                <DocsInterface clazzName="Move">
                    <DocsProperty clazzName="Move" property={{name: "action", type: AdversarialActionType}}>
                        <p>This contains the action that goes from the source position containing this move to the target <DocsRef refs="Move.position">position</DocsRef>.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="Move" property={{name: "position", type: AdversarialPositionType}}>
                        <p>This is the target position reached when this move&apos;s <DocsRef refs="Move.action">action</DocsRef> is taken from the source position.</p>
                    </DocsProperty>
                </DocsInterface>
            </DocsContainer>
        </div>
    )
}