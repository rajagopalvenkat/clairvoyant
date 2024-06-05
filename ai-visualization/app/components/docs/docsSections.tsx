import { ReactNode } from "react"

export function DocsWarning({children}: {
    children: ReactNode
}) {
    return (
        <div className="bg-[#fdff7d] dark:bg-[#676a00] text-primary-950 dark:text-primary-50 border-l-4 border-[#fbff00] p-4 mt-2 rounded-xl max-w-[75%]">
            <p className="font-bold">Warning</p>
            {children}
        </div>
    )
}