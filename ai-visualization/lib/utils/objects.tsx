// Merges o1 into o2
export function mergeInPlace(o1: Record<any, any>, o2: Record<any, any>) {
    _mergeInPlace(o1, o2, new Set<object>());   
}

function _mergeInPlace(o1: Record<any, any>, o2: Record<any, any>, traversed: Set<object>) {
    if (traversed.has(o1)) {
        throw new Error("Found recursive structure while executing merge.");
    }

    traversed.add(o1);
    for (let k in o2) {
        if (typeof o2[k] == "object" && k in o1 && typeof o1[k] === "object") {
            _mergeInPlace(o1[k], o2[k], traversed);
        } else {
            o1[k] = o2[k];
        }
    }
    traversed.delete(o1);
}

// Actually requires a deep copy!
export function merge(o1: any, o2: any) {
    let result = {};
    mergeInPlace(result, o1);
    mergeInPlace(result, o2);
    return result;
}