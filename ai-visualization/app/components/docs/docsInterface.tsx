import Image from "next/image";
import { ReactNode } from "react";

export function DocsInterface({clazzName, children} : {
    clazzName: string,
    children: ReactNode
}) {
    return (
        <div className="mt-4" id={clazzName}>
            <h4 className="flex flex-row mt-4 items-center font-bold text-secondary-800 dark:text-secondary-200">
                <div className="text-[#20d5a0] text-2xl mr-2 italic">I</div>
                <div className="text-xl">{clazzName}</div>
            </h4>
            <div className="ml-4">
                {children}
            </div>
        </div>
    )
}