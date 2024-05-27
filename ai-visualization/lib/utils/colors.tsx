class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(c: string) {
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
    }

    toString(): string {
        return `#${hexpzl2(this.r)}${hexpzl2(this.g)}${hexpzl2(this.b)}${hexpzl2(this.a)}`;
    }
}

function hexpzl2(n: number): string { 
    return n.toString(16).padStart(2, "0");
}

export function colorWithAlpha(c: string, a: number): string {
    let col = new Color(c);
    col.a = a;
    return col.toString();
}