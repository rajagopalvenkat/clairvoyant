export function getButtonStyleClassNamesForColor(color: string) {
    return `bg-${color}-200 dark:bg-${color}-900 text-${color} dark:text-${color}-200
    hover:bg-${color}-100 dark:hover:bg-${color}-800 hover:text-${color}-800 dark:hover:text-${color}-200
    focus:bg-${color}-50 dark:focus:bg-${color}-800 focus:text-${color}-900 dark:focus:text-${color}-100
    active:bg-${color}-300 dark:active:bg-${color}-700 active:text-${color}-900 dark:active:text-${color}-100
    disabled:bg-${color}-500 dark:disabled:bg-${color}-500 disabled:text-${color} dark:disabled:text-${color}-200`
}

export const buttonStyleClassNames = getButtonStyleClassNamesForColor("secondary");

export const dangerButtonStyleClassNames = getButtonStyleClassNamesForColor("danger");
