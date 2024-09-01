import Image from "next/image";
import { ReactNode } from "react";
import DocsRef from "./docsReference";
import { DocArg, formatArgs } from "@/lib/docs/doclib";

export default function DocsElement({clazzName = "", elementName = "", typeColor = "", typeCharacter, typeTooltip = "", titleElements, children = <></>} : {
    clazzName?: string,
    elementName?: string,
    typeColor?: string,
    typeCharacter: string,
    typeTooltip?: string,
    titleElements: ReactNode,
    children?: ReactNode
}) {
    return (
        <div className="mt-4" id={`${clazzName ? clazzName + "." : ""}${elementName}`}>
            <h4 className="flex flex-row gap-1 mt-4 text-xl items-center font-bold text-secondary-800 dark:text-secondary-200">
                <div className="relative group">
                    <div style={typeColor ? {color: typeColor} : {}} className="text-2xl mr-2 italic font-serif">{typeCharacter}</div>
                    {typeTooltip ? <div className="absolute z-10 top-full left-1/2 transform
                        -translate-x-1/2 mt-2 w-max px-2 py-1 
                        text-sm text-white bg-gray-700 rounded
                        shadow-lg opacity-0 group-hover:opacity-100"
                    >
                        {typeTooltip}
                    </div> : <></>}
                </div>
                {titleElements}
            </h4>
            <div className="ml-4">
                {children}
            </div>
        </div>
    )
}