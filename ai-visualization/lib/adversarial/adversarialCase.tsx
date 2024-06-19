import { NodeOptions } from "vis-network";
import { EditableComponent } from "../utils/properties";

export abstract class AdversarialSearchPosition implements EditableComponent {
    data: any;
    style: NodeOptions | undefined;
    constructor() {
        console.log("Running base position constructor");
        this.data = {};
        this.style = {};
    }
    get id(): string {
        console.log([this, this.getId()]);
        return this.getId();
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
        return false;
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
        return false;
    }
    drawHelper(ctx: CanvasRenderingContext2D) {
        return new DrawHelper(ctx);
    }
    abstract getInitialPosition(): AdversarialSearchPosition;
    abstract getActions(position: AdversarialSearchPosition): any[];
    abstract getResult(position: AdversarialSearchPosition, action: any): AdversarialSearchPosition;
}

export class DrawHelper {
    ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }
    drawCircle(x: number, y: number, r: number, color: string | undefined = undefined) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        if (color) this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string | undefined = undefined) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        if (color) this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }
    drawTextCentered(text: string, x: number, y: number, size: number, color: string | undefined = undefined, strokeColor: string | undefined = undefined, maxWidth: number | undefined = undefined, fontFamily: string = "Arial") {
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = `${size}px ${fontFamily}`;
        if (color) this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y, maxWidth);
        if (strokeColor) { 
            this.ctx.strokeStyle = strokeColor;
            this.ctx.strokeText(text, x, y, maxWidth);
        }
    }

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