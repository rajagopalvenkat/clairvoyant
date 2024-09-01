import Image from "next/image";
import { ReactNode } from "react";
import DocsRef from "./docsReference";
import { DocArg, formatArgs } from "@/lib/docs/doclib";
import DocsElement from "./docsElement";

export default function DocsProperty({clazzName = "", property, getter = false, setter = false, children = <></>} : {
    clazzName?: string,
    property: DocArg,
    getter?: boolean,
    setter?: boolean,
    children?: ReactNode
}) {
    let preambleText = "";
    if (getter && setter) preambleText = "get/set"
    else if (getter) preambleText = "get";
    else if (setter) preambleText = "set";

    return (
        <DocsElement typeCharacter="p" typeColor="#8080dd" typeTooltip="property" clazzName={clazzName} elementName={property.name} titleElements={
            <>
                {preambleText ? <div className="text-primary-900 dark:text-primary-100">{preambleText}</div> : <></>}
                <div>{formatArgs([property])}</div>
            </>
        }>
            {children}
        </DocsElement>
    )
}