import Image from "next/image";
import { ReactNode } from "react";
import DocsElement from "./docsElement";
import { formatTypeList, DocType } from "@/lib/docs/doclib";

export function DocsClass({clazzName, extendz, implementz = [], genericTypes = [], children = <></>} : {
    clazzName: string,
    extendz?: DocType | undefined,
    implementz?: DocType[],
    genericTypes?: DocType[],
    children?: ReactNode
}) {
    return (
        <DocsElement typeCharacter="c" typeColor="#a044ff" typeTooltip="class" elementName={clazzName} titleElements={
            <>
                {genericTypes.length == 0
                    ? <div>{clazzName}</div>
                    : <div>{clazzName}&lt;{formatTypeList(genericTypes)}&gt;</div>
                }
                {extendz ? <> <span className="text-primary-900 dark:text-primary-100"> extends </span> {extendz.render()} </> : <></>}
                {implementz && implementz.length > 0 ? 
                    <> 
                        <span className="text-primary-900 dark:text-primary-100"> implements </span> 
                        {implementz.map(((ref,idx,arr) => {
                            return (<span key={idx}>
                                <span>{idx > 0 ? ',' : ''}</span> 
                                {ref.render()}
                            </span>)
                        }))}
                    </> : <></>}
            </>
        }>
            {children}
        </DocsElement>
    )
}