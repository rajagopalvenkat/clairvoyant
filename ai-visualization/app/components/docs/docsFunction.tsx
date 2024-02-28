import Image from "next/image";
import { ReactNode } from "react";
import DocsRef from "./docsReference";
import { ConstDocVoid, DocArg, DocType, formatArgs } from "@/lib/docs/doclib";

export function DocsFunction({clazzName = "", functionName, children, args = [], returnType, hideReturnType = false} : {
    functionName: string,
    clazzName?: string,
    returnType?: DocType,
    args?: DocArg[],
    hideReturnType?: boolean,
    children: ReactNode
}) {
    const ret = returnType ?? ConstDocVoid;
    return (
        <div className="mt-4" id={`${clazzName ? clazzName + "." : ""}${functionName}`}>
            <h4 className="flex flex-row mt-4 items-center font-bold text-secondary-800 dark:text-secondary-200">
                <div className="text-[#80dd80] text-2xl mr-2 italic">f</div>
                <div className="text-xl">{functionName}({formatArgs(args)}){hideReturnType ? (<></>) : (<> : {ret.render()}</>)}</div>
            </h4>
            <div className="ml-4">
                {children}
            </div>
        </div>
    )
}