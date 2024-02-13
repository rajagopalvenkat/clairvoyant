import { getCase, getCases } from "@/lib/api/problems";
import { iteratorToArray } from "@/lib/collections/arrays";
import { API_URL } from "@/lib/statics/appConstants";
import { buttonStyleClassNames } from "@/lib/statics/styleConstants";
import { capitalize } from "@/lib/strings/pretty";
import { useCallback, useEffect, useState } from "react";
import Select, { ClassNamesConfig } from "react-select";

const init_defaultCases: string[] = [];

export default function CaseEditor({problem, errorMessage, caseData, onCaseDataChanged}: {
    problem: string, 
    errorMessage: string,
    caseData: string,
    onCaseDataChanged: (v: string) => void
}) {
    let [caseId, setCaseId] = useState("");

    let [defaultCases, setDefaultCases] = useState(init_defaultCases);

    function fetchCaseData() {
        if (!caseId || !problem) return;
        getCase(problem, caseId)
        .then(json => {
            let responseCaseData = json as string;
            onCaseDataChanged(responseCaseData);
        })
        .catch(err => console.error(err));
    }

    useEffect(() => {
        if (!problem) return;
        getCases(problem)
        .then(responseCases => {
            setDefaultCases(responseCases);
            setCaseId(responseCases[0])
        })
        .catch(err => console.error(err));
    }, [problem])

    return (
    <div className="h-50 flex flex-col items-stretch">
        <h2>Case: </h2>
        <Select unstyled classNames={{
            control: (state) => {return `${buttonStyleClassNames} rounded pl-2 border-solid border-2 border-secondary-50 dark:border-secondary-950`}, 
            option: (state) => {return `${buttonStyleClassNames} p-1`}}}
            options={defaultCases.map(n => {return {value: n, label: capitalize(n)}})} 
            onChange={e => {setCaseId(e?.value ?? ""); fetchCaseData();}}>
        </Select>
        <textarea className="flex-grow bg-primary-50 dark:bg-primary-950 text-secondary dark:text-secondary-200" 
            value={caseData} onChange={e => onCaseDataChanged(e.target.value ?? "")}>
        </textarea>
        {errorMessage ? (<div className="bg-opacity-50 max-h-32 overflow-y-auto border p-1 mt-1 border-solid rounded-md border-danger-500 bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200">
            {errorMessage}
        </div>) : (<></>)}
    </div>
    );
}