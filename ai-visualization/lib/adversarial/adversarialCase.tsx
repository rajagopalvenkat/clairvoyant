import { NodeOptions } from "vis-network";
import { canSetProps, EditableComponent, ItemProperty } from "../utils/properties";
import { AdversarialSearchMove } from "./adversarialSolution";
import { CanvasHelper } from "../utils/canvasHelper";

export abstract class AdversarialSearchPosition implements EditableComponent {
    data: any;
    style?: NodeOptions;
    moves?: AdversarialSearchMove[];
    bestMoves?: AdversarialSearchMove[];
    utility?: number;
    getHeuristic?: () => number;
    constructor() {
        this.data = {};
        this.style = {};
        this.moves = [];
        this.bestMoves = [];
    }
    get id(): string {
        return this.getId();
    }
    get properties(): ItemProperty[] {
        let result: ItemProperty[] = [
            {name: "data", display: "Data", type: "object", value: this.data, fixed: true},
        ];
        if (this.utility === undefined) {
            this.utility = this.getUtility();
        }
        if (this.utility !== undefined) {
            result.push({name: "utility", display: "Utility", type: "number", value: this.utility, fixed: true});
        }
        return result;
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
        let analysis = canSetProps(this.properties, {[name]: value});
        if (!analysis.success) throw new Error(analysis.errors.join("\n"));

        return false;
    }
    drawHelper(ctx: CanvasRenderingContext2D) {
        return new CanvasHelper(ctx);
    }
    getUtility(): number | undefined {
        return this.utility;
    }
    abstract getId(): string;
    abstract render(ctx: CanvasRenderingContext2D): void;
    abstract isTerminal(): boolean;
    abstract getScore(): number;
    abstract getPlayer(): number;
}

export abstract class AdversarialSearchCase implements EditableComponent {
    constructor() {}
    get id(): string | number {
        return "";
    }
    get properties(): any[] {
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
        let analysis = canSetProps(this.properties, {[name]: value});
        if (!analysis.success) throw new Error(analysis.errors.join("\n"));

        return false;
    }
    abstract getInitialPosition(): AdversarialSearchPosition;
    abstract getActions(position: AdversarialSearchPosition): any[];
    abstract getResult(position: AdversarialSearchPosition, action: any): AdversarialSearchPosition;
}

export const requiredGameMethods = [
    {name: "getInitialPosition", args: 0},
    {name: "getActions", args: 1},
    {name: "getResult", args: 2},
]

export const requiredPositionMethods = [
    {name: "isTerminal", args: 0},
    {name: "getScore", args: 0},
    {name: "render", args: 1},
    {name: "getId", args: 0},
    {name: "getPlayer", args: 0},
]