import { iteratorToArray } from "@/lib/collections/arrays";
import { API_URL } from "@/lib/statics/appConstants";
import { buttonStyleClassNames } from "@/lib/statics/styleConstants";
import { capitalize } from "@/lib/strings/pretty";
import { useEffect, useState } from "react";
import Select, { ClassNamesConfig } from "react-select";

const init_defaultCases: string[] = [];

export default function CaseEditor({problem}: {problem: string}) {
    let [caseData, setCaseData] = useState("");
    let [caseId, setCaseId] = useState("");

    let [defaultCases, setDefaultCases] = useState(init_defaultCases);

    useEffect(() => {
        if (!problem) return;
        fetch(`${API_URL}/${problem}/cases`)
        .then(response => response.json())
        .then(json => {
            let responseCases = json as string[];
            setDefaultCases(responseCases);
            setCaseId(responseCases[0])
        })
        .catch(err => console.error(err));
    }, [problem])

    useEffect(() => {
        if (!caseId || !problem) return;
        fetch(`${API_URL}/${problem}/cases/${caseId}`)
        .then(response => response.json())
        .then(json => {
            let responseCaseData = json as string;
            setCaseData(responseCaseData);
        })
        .catch(err => console.error(err));
    }, [problem, caseId])

    return (
    <div className="w-96 h-full flex flex-col items-stretch">
        <h2>Case: </h2>
        <Select unstyled classNames={{
            control: (state) => {return `${buttonStyleClassNames} rounded pl-2 border-solid border-2 border-secondary-50 dark:border-secondary-950`}, 
            option: (state) => {return `${buttonStyleClassNames} p-1`}}}
            options={defaultCases.map(n => {return {value: n, label: capitalize(n)}})} 
            onChange={e => setCaseId(e?.value ?? "")}>
        </Select>
        <textarea className="flex-grow bg-primary-50 dark:bg-primary-950 text-secondary dark:text-secondary-200" value={caseData} onChange={e => setCaseData(e.target.textContent ?? "")}></textarea>
    </div>
    );
}