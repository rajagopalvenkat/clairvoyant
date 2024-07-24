class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(c: string | number[]) {
        if (typeof c === "string") {
            if (c.startsWith("#")) {
                let cd = c.substring(1); // desugaring
                switch (cd.length) {
                    case 3:
                        cd = cd + "f"; // fall-through
                    case 4:
                        this.r = parseInt(cd[0], 16) * 17;
                        this.g = parseInt(cd[1], 16) * 17;
                        this.b = parseInt(cd[2], 16) * 17;
                        this.a = parseInt(cd[3], 16) * 17;
                        break;
                    case 6:
                        cd = cd + "ff"; // fall-through
                    case 8:
                        this.r = parseInt(cd.substring(0,2), 16);
                        this.g = parseInt(cd.substring(2,4), 16);
                        this.b = parseInt(cd.substring(4,6), 16);
                        this.a = parseInt(cd.substring(6,8), 16);
                        break;
                    default:
                        throw new Error("Invalid color format: " + c);
                }
            }
            else {
                throw new Error("Invalid color format: " + c)
            }
        } else if (typeof c === "object") {
            if (c.length < 3 || c.length > 4) throw new Error("Invalid color format: " + c);
            if (c.length === 3) c.push(255);
            this.r = c[0];
            this.g = c[1];
            this.b = c[2];
            this.a = c[3];
        } else {
            throw new Error("Invalid color format: " + c);
        }
    }

    static lerp(c1: Color, c2: Color, t: number): Color {
        return new Color([
            c1.r + (c2.r - c1.r) * t,
            c1.g + (c2.g - c1.g) * t,
            c1.b + (c2.b - c1.b) * t,
            c1.a + (c2.a - c1.a) * t
        ]);
    }

    toString(): string {
        return `#${hexpzl2(this.r)}${hexpzl2(this.g)}${hexpzl2(this.b)}${hexpzl2(this.a)}`;
    }
}

// Hex pad zero left (2)
function hexpzl2(n: number): string { 
    return Math.round(n).toString(16).padStart(2, "0");
}

export function colorWithAlpha(c: string, a: number): string {
    let col = new Color(c);
    col.a = a;
    return col.toString();
}

export function colorLerp(c1: string, c2: string, t: number): string {
    let col1 = new Color(c1);
    let col2 = new Color(c2);
    return Color.lerp(col1, col2, t).toString();
}