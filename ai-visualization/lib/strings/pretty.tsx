export function capitalize(s : string) {
    return (s.split(" ").map(sub => sub.charAt(0).toUpperCase() + sub.slice(1))).join(" ");
}

export function renderValue(value: any, prefix: string = "", suffix: string = "", key: any = 0) {
    let extraClasses = ["font-mono"];
    let str = JSON.stringify(value);
    //console.log("Value: ", value, "Str: ", str);
    if (value === undefined || value === null) {
        extraClasses.push("text-code-null");
    }
    else if (value instanceof Boolean) {
        extraClasses.push("text-code-boolean");
    }
    else if (value instanceof Number) {
        extraClasses.push("text-code-number");
    }
    else if (value instanceof String) {
        extraClasses.push("text-code-string");
        str = `"${str}"`;
    }

    let result = (
        <span key={key}>{prefix}<span className={extraClasses.join(" ")}>{str}</span>{suffix}</span>
    )
    //console.log(result)
    return result;
}