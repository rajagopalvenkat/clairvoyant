import Image from "next/image";
import { PropsWithChildren, ReactNode } from "react";

export function DocsContainer({title, children} : {
    title: string,
    children: ReactNode
}) {
    return (
        <div className="h-full">
            <div className="container flex flex-col bg-primary-200 dark:bg-primary-800 m-auto p-3">
                <h2 className="flex flex-row self-center mt-4 items-center font-bold text-3xl text-secondary-800 dark:text-secondary-200">
                    <Image className="dark:invert mr-2" src="/DocScroll.png" alt="" width={40} height={40}></Image>
                    {title}
                </h2>
                {children}
            </div>
        </div>
    )
}