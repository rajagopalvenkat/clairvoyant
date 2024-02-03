import { PROBLEMS } from "@/lib/statics/appConstants";
import Logo from "./logo";

export default function Header({selectedPage}: {selectedPage: string}) {
    return (
    <div className="h-10 bg-secondary-bg dark:bg-secondary-bg-dark p-8 flex flex-row items-center">
        <Logo></Logo>
        <nav className="ps-16 flex flex-row">
            {Object.keys(PROBLEMS).map(problemId => {
                const problem = PROBLEMS[problemId];
                return (
                    <a className="m-3 text-secondary dark:text-secondary-dark" href={problem.href} key={problemId}>{problem.name}</a>
                )
            })}
        </nav>
    </div>
    )
}