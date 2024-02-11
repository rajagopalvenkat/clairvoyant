export function capitalize(s : string) {
    return (s.split(" ").map(sub => sub.charAt(0).toUpperCase() + sub.slice(1))).join(" ");
}