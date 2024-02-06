import { PROBLEMS } from "@/lib/statics/appConstants";
import Logo from "./logo";
import Link from "next/link";

export default function Header({selectedPage}: {selectedPage: string}) {
    const links: {id: string, text: string, url: string}[] = [
        {id: "home", text: "Home", url: "/"}
    ].concat(Object.keys(PROBLEMS).map(problemId => {
        const problem = PROBLEMS[problemId];
        return {id: problemId, text: problem.name, url: problem.href};
    }))

    return (
    <div className="bg-secondary-bg dark:bg-secondary-bg-dark flex flex-row items-stretch">
        <div className="p-3 pl-5">
            <Logo></Logo>
        </div>
        <nav className="ps-16 flex flex-row items-stretch">
            {links.map(link => {
                const selected: boolean = link.id == selectedPage;
                return (
                    <div key={link.id} className={`flex flex-col justify-center ${selected ? 'bg-gradient-to-b from-secondary-bg to-primary-bg dark:from-secondary-bg-dark dark:to-primary-bg-dark' : ''}`}>
                        <Link className={`m-3 ${selected 
                            ? 'text-secondary dark:text-secondary-dark underline font-bold' 
                            : 'text-secondary dark:text-secondary-dark'}`} 
                        href={link.url}>{link.text}</Link>
                    </div>
                )
            })}
        </nav>
    </div>
    )
}