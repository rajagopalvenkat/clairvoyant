import Image from "next/image";
import { ReactNode } from "react";
import DocsElement from "./docsElement";
import { DocType, formatTypeList } from "@/lib/docs/doclib";

export function DocsInterface({clazzName, children = <></>, genericTypes = [], extendz = undefined} : {
    clazzName: string,
    children?: ReactNode,
    extendz?: DocType | undefined,
    genericTypes?: DocType[]
}) {
    return (
        <DocsElement typeCharacter="I" typeColor="#20d5a0" typeTooltip="interface" elementName={clazzName} titleElements={
            <>
            {genericTypes.length == 0
                ? <div>{clazzName}</div>
                : <div>{clazzName}&lt;{formatTypeList(genericTypes)}&gt;</div>
            }
            {extendz ? <> <span className="text-primary-900 dark:text-primary-100"> extends </span> {extendz.render()} </> : <></>}
            </>
        }>
            {children}
        </DocsElement>
    )
}