import { getSolution, getSolutions } from "@/lib/api/problems";
import { buttonStyleClassNames } from "@/lib/statics/styleConstants";
import { capitalize } from "@/lib/strings/pretty";
import { useEffect, useState } from "react";
import Select from "react-select";
import ReactCodeMirror, { EditorView, Extension } from "@uiw/react-codemirror";
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language"
import {tags} from "@lezer/highlight"
import Image from "next/image";
import { javascriptLanguage, javascript } from "@codemirror/lang-javascript";

// Then register the languages you need

const init_defaultAlgos: string[] = []


export default function SolutionEditor({problem, solutionHeight}: {
    problem: string,
    solutionHeight: number
}) {
    let [algoData, setAlgoData] = useState("");
    let [algoId, setAlgoId] = useState("");

    let [defaultAlgorithms, setDefaultAlgorithms] = useState(init_defaultAlgos);
    let [currentTheme, setCurrentTheme] = useState("dark");

    const themes: Record<string, Extension> = {
        "light": EditorView.theme({
            "": {},
            ".cm-scroller": {overflow: "auto", "flex-grow": "1", "width": "100%", "background-color": "#eee", color: "#112"},
            ".cm-cursor": {borderLeftColor: "#013"}
        }, {dark: false}),
        "dark": EditorView.theme({
            "": {},
            ".cm-scroller": {overflow: "auto", "flex-grow": "1", "width": "100%", "background-color": "#0c1b2f", color: "#ddf"},
            ".cm-cursor": {borderLeftColor: "#bfe"}
        }, {dark: true})
    }
    const highlights: Record<string, HighlightStyle> = {
        "light": HighlightStyle.define([
            {tag: tags.keyword, color:"#02b"},
            {tag: tags.comment, color:"#2b0", fontStyle: "italic"},
            {tag: tags.string, color:"#a70"},
            {tag: tags.typeName, color:"#019"},
            {tag: tags.className, color: "#3b8"},
            {tag: tags.function(tags.name), color: "#860"},
            {tag: tags.definition(tags.propertyName), color: "#b60"}
        ], {themeType: "light"}),
        "dark": HighlightStyle.define([
            {tag: tags.keyword, color:"#48f"},
            {tag: tags.comment, color:"#2b0", fontStyle: "italic"},
            {tag: tags.string, color:"#a70"},
            {tag: tags.typeName, color:"#019"},
            {tag: tags.className, color: "#3b8"},
            {tag: tags.function(tags.name), color: "#ff6"},
            {tag: tags.definition(tags.propertyName), color: "#fd8"}
        ], {themeType: "dark"})
    }

    function fetchAlgorithm() {
        if (!algoId || !problem) return;
        getSolution(problem, algoId)
        .then(responseCaseData => {
            setAlgoData(responseCaseData);
        })
    }
    function toggleTheme() {
        const allThemes = Object.keys(themes);
        const curThemeIndex = allThemes.indexOf(currentTheme);
        if (curThemeIndex < 0) {
            setCurrentTheme(allThemes[0]);
            return;
        }
        const nextThemeIndex = (curThemeIndex + 1) % allThemes.length;
        setCurrentTheme(allThemes[nextThemeIndex]);
    }
    const js = javascript();

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
    <div className="flex flex-col items-stretch">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"></link>
        <div className="flex flex-row justify-between">
            <h2 className="inline-block">Algorithm: </h2>
            <button onClick={toggleTheme}>Theme: {currentTheme}</button>
        </div>
        <div className="flex flex-row mb-1">
            <Select unstyled className="flex-grow" classNames={{
                    control: (state) => {return `${buttonStyleClassNames} rounded pl-2 border-solid border-2 border-secondary-50 dark:border-secondary-950`}, 
                    option: (state) => {return `${buttonStyleClassNames} p-1`}
                }}
                options={defaultAlgorithms.map(n => {return {value: n, label: capitalize(n)}})} 
                onChange={e => {setAlgoId(e?.value ?? ""); fetchAlgorithm();}}>
            </Select>
            <a href={`/docs/${problem}`} className={`${buttonStyleClassNames} rounded px-2 border-solid border-2 border-secondary-50 dark:border-secondary-950 flex flex-row justify-around items-center`}>
                <Image className="dark:invert" src="/DocScroll.png" alt="Documentation Icon" width={24} height={24}></Image>
            </a>
        </div>
        <div className="flex-grow flex">
            <ReactCodeMirror style={{height: `${solutionHeight}px`}} lang="javascript" extensions={[themes[currentTheme], syntaxHighlighting(highlights[currentTheme]), js]} value={algoData} onChange={e => setAlgoData(e ?? "")}>
            </ReactCodeMirror>
        </div>
    </div>
    );
}