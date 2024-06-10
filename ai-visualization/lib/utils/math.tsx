export class Mathlib {
    static distanceWithDiagonalCost(deltas: [number, number], diagonalCost: number): number {
        let [dx, dy] = deltas;
        // More efficient to just move orthogonally at this point
        if (diagonalCost >= 2) {
            return dx + dy;
        }
        let diagDist = Math.min(dx, dy);
        return (dx - diagDist) + (dy - diagDist) + diagDist * diagonalCost;
    }
}