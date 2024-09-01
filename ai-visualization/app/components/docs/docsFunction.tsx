import Image from "next/image";
import { ReactNode } from "react";
import DocsRef from "./docsReference";
import { ConstDocVoid, DocArg, DocType, formatArgs } from "@/lib/docs/doclib";
import DocsElement from "./docsElement";

export function DocsFunction({clazzName = "", functionName, children = <></>, args = [], returnType, abstract = false, hideReturnType = false} : {
    functionName: string,
    clazzName?: string,
    returnType?: DocType,
    args?: DocArg[],
    hideReturnType?: boolean,
    abstract?: boolean,
    children?: ReactNode
}) {
    const ret = returnType ?? ConstDocVoid;
    return (
        <DocsElement typeCharacter="f" typeColor="#80dd80" typeTooltip="function" clazzName={clazzName} elementName={functionName} titleElements={
            <>
                {abstract ? <div key={0} className="text-xl text-primary-900 dark:text-primary-100">abstract</div> : <></>}
                <div key={1} className="text-xl">
                    {functionName}(
                        {formatArgs(args)}
                    )
                    {hideReturnType ? 
                        (<></>) : 
                        (<> : {ret.render()}</>)
                    }
                </div>
            </>
        }>
            {children}
        </DocsElement>
    )
}