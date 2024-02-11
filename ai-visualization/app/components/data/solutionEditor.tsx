import { getSolution, getSolutions } from "@/lib/api/problems";
import { API_URL } from "@/lib/statics/appConstants";
import { buttonStyleClassNames } from "@/lib/statics/styleConstants";
import { capitalize } from "@/lib/strings/pretty";
import { useEffect, useState } from "react";
import Select from "react-select";

const init_defaultAlgos: string[] = []

export default function SolutionEditor({problem}: {problem: string}) {
    let [algoData, setAlgoData] = useState("");
    let [algoId, setAlgoId] = useState("");

    let [defaultAlgorithms, setDefaultAlgorithms] = useState(init_defaultAlgos);

    useEffect(() => {
        if (!problem) return;
        getSolutions(problem)
        .then(responseCases => {
            setDefaultAlgorithms(responseCases);
            setAlgoId(responseCases[0])
        })
    }, [problem])

    useEffect(() => {
        if (!algoId || !problem) return;
        getSolution(problem, algoId)
        .then(responseCaseData => {
            setAlgoData(responseCaseData);
        })
    }, [problem, algoId])

    return (
    <div className="w-96 h-full flex flex-col items-stretch">
        <h2>Algorithm: </h2>
        <Select unstyled classNames={{
            control: (state) => {return `${buttonStyleClassNames} rounded pl-2 border-solid border-2 border-secondary-50 dark:border-secondary-950`}, 
            option: (state) => {return `${buttonStyleClassNames} p-1`}}}
            options={defaultAlgorithms.map(n => {return {value: n, label: capitalize(n)}})} 
            onChange={e => setAlgoId(e?.value ?? "")}>
        </Select>
        <textarea className="flex-grow bg-primary-50 dark:bg-primary-950 text-secondary dark:text-secondary-200" value={algoData} onChange={e => setAlgoData(e.target.textContent ?? "")}></textarea>
    </div>
    );
}