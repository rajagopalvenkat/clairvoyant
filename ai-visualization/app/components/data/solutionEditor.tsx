import { getSolution, getSolutions } from "@/lib/api/problems";
import { API_URL } from "@/lib/statics/appConstants";
import { buttonStyleClassNames } from "@/lib/statics/styleConstants";
import { capitalize } from "@/lib/strings/pretty";
import { useEffect, useState } from "react";
import Select from "react-select";
// Using ES6 import syntax
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import Script from "next/script";
import ReactCodeMirror, { EditorView } from "@uiw/react-codemirror";

// Then register the languages you need

const init_defaultAlgos: string[] = []
const fixedHeightEditorLight = EditorView.theme({
    "&": {"max-height": "20em"},
    ".cm-scroller": {overflow: "auto"}
});
const fixedHeightEditorDark = EditorView.theme({
    "&": {"max-height": "20em"},
    ".cm-scroller": {overflow: "auto"},
}, {dark: true});

export default function SolutionEditor({problem}: {problem: string}) {
    let [algoData, setAlgoData] = useState("");
    let [algoId, setAlgoId] = useState("");

    let [defaultAlgorithms, setDefaultAlgorithms] = useState(init_defaultAlgos);

    function fetchAlgorithm() {
        if (!algoId || !problem) return;
        getSolution(problem, algoId)
        .then(responseCaseData => {
            setAlgoData(responseCaseData);
        })
    }

    useEffect(() => {
        if (!problem) return;
        getSolutions(problem)
        .then(responseCases => {
            setDefaultAlgorithms(responseCases);
            setAlgoId(responseCases[0])
        })
    }, [problem])

    /*useEffect(() => {
        hljs.registerLanguage('javascript', javascript);
    }, [])
    useEffect(() => { // Runs after every render
        hljs.highlightAll();
    })*/

    return (
    <div className="h-50 h-full flex flex-col items-stretch">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"></link>
        <h2>Algorithm: </h2>
        <Select unstyled classNames={{
            control: (state) => {return `${buttonStyleClassNames} rounded pl-2 border-solid border-2 border-secondary-50 dark:border-secondary-950`}, 
            option: (state) => {return `${buttonStyleClassNames} p-1`}}}
            options={defaultAlgorithms.map(n => {return {value: n, label: capitalize(n)}})} 
            onChange={e => {setAlgoId(e?.value ?? ""); fetchAlgorithm();}}>
        </Select>
        <div>
            <ReactCodeMirror extensions={[fixedHeightEditorDark]} value={algoData} onChange={e => setAlgoData(e ?? "")}>
            </ReactCodeMirror>
        </div>
    </div>
    );
}