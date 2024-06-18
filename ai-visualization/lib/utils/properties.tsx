export interface ItemProperty {
    name: string;
    type: string;
    value: any;
    fixed?: boolean;
    trigger?: boolean;
    options?: any[];
    hidden?: boolean;
    dynamic?: boolean;
    description?: string;
    display?: string;
    check?: (value: any) => boolean;
}

export interface ItemPropertyChange<T> {
    property: string;
    oldValue: any;
    newValue: any;
    target: T;
}

export interface ItemPropertySet<T> {
    property: string;
    value: any;
    target: T;
}

export interface EditableComponent {
    get id(): string | number;
    get properties(): ItemProperty[];
    
    getProp(name: string): any;
    setProp(name: string, value: any): boolean;
}

export function canSetProps(properties: ItemProperty[], values: Record<string, any>): {success: boolean, errors: string[]} {
    let errors: string[] = []
    for (let [name, value] of Object.entries(values)) {
        let p = properties.find(p => p.name == name)
        if (!p) {errors.push(`Property ${name} is not a valid property for this component.`); continue;}
        if (p.fixed) {errors.push(`Property ${name} is fixed and cannot be changed.`); continue;}
        if (p.options && p.options.findIndex(o => o == value) < 0) {errors.push(`Property ${name} must be one of ${p.options.join(", ")}`); continue;}
        if (p.trigger && !value) {errors.push(`Property ${name} must be set to true to trigger an action.`); continue;}
        if (p.type != typeof value) {errors.push(`Property ${name} must be of type ${p.type}`); continue;}
        if (p.check && !p.check(value)) {errors.push(`Property ${name} failed a custom check.`); continue;}
    }
    return {success: errors.length == 0, errors: errors};
}

export function executePropertyChange<T extends EditableComponent>(change: ItemPropertyChange<T>) {
    change.target.setProp(change.property, change.newValue);
}

export function revertPropertyChange<T extends EditableComponent>(change: ItemPropertyChange<T>) {
    change.target.setProp(change.property, change.oldValue);
}