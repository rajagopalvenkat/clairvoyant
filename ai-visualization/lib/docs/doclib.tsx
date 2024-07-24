import DocsRef from "@/app/components/docs/docsReference";
import { ReactNode } from "react";
import { renderValue } from "../strings/pretty";

export interface DocArg {
    name: string,
    type?: DocType,
    default?: any
}

export interface DocType {
    render() : ReactNode
}

// Internal doc type
export class IDocType implements DocType {
    type: string
    page: string
    // referenced section
    refs?: string
    constructor(type: string = "any", page: string = "", refs: string = "") {
        this.type = type;
        this.page = page;
        this.refs = refs;
    }
    render(): ReactNode {
        return (
            (this.refs || this.page) ? 
            (<DocsRef page={this.page} refs={this.refs}>{this.type}</DocsRef>) :
            (<>{this.type}</>)
        )
    }
}

// External doc type
export class EDocType implements DocType {
    type: string
    href: string
    constructor(type: string, href: string) {
        this.type = type
        this.href = href
    }
    render(): ReactNode {
        return (
            <DocsRef page={this.href}>{this.type}</DocsRef>
        )
    }
}

export class ArrayDocType implements DocType {
    mainType: DocType
    constructor(type: DocType) {
        this.mainType = type
    }
    render(): ReactNode {
        return (
            <>
            {this.mainType.render()}<DocsRef page={ConstDocArray.href}>[]</DocsRef>
            </>
        )
    }
}

export class UnionDocType implements DocType {
    types: DocType[]
    constructor(types: DocType[]) {
        this.types = types;
    }
    render(): ReactNode {
        return (
            <>{this.types.map((t,i,arr) =>{
                let separator = i === arr.length - 1 ? "" : " | ";
                return (<>{t.render()}{separator}</>)
            })}</>
        )
    }
}

export class TupleArrayDocType implements DocType {
    types: DocType[]
    constructor(types: DocType[]) {
        this.types = types;
    }
    render(): ReactNode {
        return (
            <>[{this.types.map((t,i,arr) =>{
                let separator = i === arr.length - 1 ? "" : ", ";
                return (<>{t.render()}{separator}</>)
            })}]</>
        )
    }
}
export class GenericDocType implements DocType {
    mainType: DocType
    argTypes: DocType[]
    constructor(type: DocType, args: DocType[]) {
        this.mainType = type
        this.argTypes = args
    }
    render(): ReactNode {
        return (
            <>
            {this.mainType.render()}&lt;{
                this.argTypes.map((a,i,arr) => {
                    let separator = i === arr.length - 1 ? "" : ", ";
                    return (<>{a.render()}{separator}</>)
                })
            }&gt;
            </>
        )
    }
}

export function docArrayOf(t: DocType, long: boolean = false): DocType {
    if (long) return new GenericDocType(ConstDocArray, [t]);
    return new ArrayDocType(t);
}
export function docMaybeUndefined(t: DocType): DocType {
    return new UnionDocType([t, ConstDocUndefined]);
}

export const ConstDocVoid = new IDocType("void");
export const ConstDocAny = new IDocType("any");
export const ConstDocUndefined = new IDocType("undefined");
export const ConstDocNumber = new EDocType("number", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number");
export const ConstDocBoolean = new EDocType("boolean", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean");
export const ConstDocString = new EDocType("string", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String");
export const ConstDocArray = new EDocType("Array", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array");
export const ConstDocGenerator = new EDocType("Generator", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator");
export const ConstDocMap = new EDocType("Map", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map");
export const ConstDocSet = new EDocType("Set", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set");
export const ConstDocRecord = new EDocType("Record", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Record");

export function formatArgs(args: DocArg[]) {
    let result: ReactNode[] = []
    result = args.map((n,i,arr) => {
        let elemSeparator = i === arr.length - 1 ? "" : ", "
        return (
            <span key={i}>{n.name} : {n.type?.render() ?? "any"}{n.default !== undefined ? renderValue(n.default, " = ", "", i + arr.length) : ""}{elemSeparator}</span>
        )
    })
    return (
        <span>
            {result}
        </span>
    )
}