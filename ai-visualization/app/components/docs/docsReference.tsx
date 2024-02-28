"use client"

import { ReactNode } from "react";

export default function DocsRef({children, page, refs}: {
    children: ReactNode
    page?: string
    refs?: string
}) {
    return (
        <a className="underline text-secondary-800 dark:text-secondary-200 hover:text-secondary-900 dark:hover:text-secondary-100" 
        href={`${page ?? ""}#${refs ?? ""}`}>
            {children}
        </a>
    )
} 