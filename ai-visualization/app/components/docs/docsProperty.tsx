import Image from "next/image";
import { ReactNode } from "react";
import DocsRef from "./docsReference";
import { DocArg, formatArgs } from "@/lib/docs/doclib";

export default function DocsProperty({clazzName = "", property, children} : {
    clazzName?: string,
    property: DocArg,
    children: ReactNode
}) {
    return (
        <div className="mt-4" id={`${clazzName ? clazzName + "." : ""}${property.name}`}>
            <h4 className="flex flex-row mt-4 items-center font-bold text-secondary-800 dark:text-secondary-200">
                <div className="text-[#8080dd] text-2xl mr-2 italic">p</div>
                <div className="text-xl">{formatArgs([property])}</div>
            </h4>
            <div className="ml-4">
                {children}
            </div>
        </div>
    )
}