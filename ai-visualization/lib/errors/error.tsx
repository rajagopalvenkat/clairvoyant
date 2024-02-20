/// This function exists for the purpose of ensuring that thrown values which
/// are caught, are definitely errors! If the caught value is not an error,
/// it will be wrapped in an error and then returned.
export function ensureError(value: unknown): Error {
    if (value instanceof Error) return value;
    let stringified = "[Unable to stringify error value]";
    try {
        stringified = JSON.stringify(value);
    } catch {}
    return Error(stringified);
}

export class ParsingError extends Error {
    includedMessage: string;
    line: number;
    col: number;
    example: string | null;
    constructor(message: string, lineIdx: number, colIdx: number, example: string | null = null) {
        super(`Parsing error at line ${lineIdx + 1}, col ${colIdx + 1}: ${message}.${example === null ? '' : ` EXAMPLE SYNTAX: \"${example}\".`}`);
        this.includedMessage = message;
        this.line = lineIdx + 1;
        this.col = colIdx + 1;
        this.example = example;
    }
}

export class RuntimeError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class NotImplementedError extends Error {
    feature: string;
    constructor(feature: string) {
        super(`Feature ${feature} is not yet implemented.`);
        this.feature = feature;
    }
}