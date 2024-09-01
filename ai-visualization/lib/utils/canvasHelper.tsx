export class CanvasHelper {
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
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string | undefined = undefined, thickness: number | undefined = undefined) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        if (color) this.ctx.strokeStyle = color;
        if (thickness !== undefined) this.ctx.lineWidth = thickness;
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
    drawGrid(x: number, y: number, width: number, height: number, columns: number, rows: number, color: string | undefined = undefined, includeBorders: boolean = false) {
        if (color) this.ctx.strokeStyle = color;
        let rowHeight = height / rows;
        for (let i = 1; i < rows; i++) {
            let ry = y + i * rowHeight;
            this.drawLine(x, ry, x + width, ry, undefined);
        }
        let colWidth = width / columns;
        for (let i = 1; i < columns; i++) {
            let cx = x + i * colWidth;
            this.drawLine(cx, y, cx, y + height, undefined);
        }
        if (includeBorders) {
            this.ctx.strokeRect(x, y, width, height);
        }
    }
}
