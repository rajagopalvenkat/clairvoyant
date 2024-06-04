export class Mathlib {
    static distanceWithDiagonalCost(deltas: [number, number], diagonalCost: number): number {
        let [dx, dy] = deltas;
        let diagDist = Math.min(dx, dy);
        return (dx - diagDist) + (dy - diagDist) + diagDist * diagonalCost;
    }
}