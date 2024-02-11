export function iteratorToArray<T>(iterator: Iterable<T>) {
    let result: T[] = [];
    for (let val of iterator) {
        result.push(val);
    }
    return result;
}