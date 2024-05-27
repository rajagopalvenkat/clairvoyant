export function reverseIndexMap(items: string[]): Map<string, number> {
    let result = new Map<string, number>();
    items.forEach((item, index) => {
        result.set(item, index);
    });
    return result;
}

export function range(start: number, end: number, step: number = 1): number[] {
    let result = [];
    for (let i = start; i < end; i += step) {
        result.push(i);
    }
    return result;
}