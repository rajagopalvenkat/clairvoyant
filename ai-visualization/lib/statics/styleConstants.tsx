import { EditorView, Extension } from "@uiw/react-codemirror";
import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight"

export function getButtonStyleClassNamesForColor(color: string) {
    return `bg-${color}-200 dark:bg-${color}-900 text-${color} dark:text-${color}-200
    hover:bg-${color}-100 dark:hover:bg-${color}-800 hover:text-${color}-800 dark:hover:text-${color}-200
    focus:bg-${color}-50 dark:focus:bg-${color}-800 focus:text-${color}-900 dark:focus:text-${color}-100
    active:bg-${color}-300 dark:active:bg-${color}-700 active:text-${color}-900 dark:active:text-${color}-100
    disabled:bg-${color}-500 dark:disabled:bg-${color}-500 disabled:text-${color} dark:disabled:text-${color}-200`
}

export const buttonStyleClassNames = getButtonStyleClassNamesForColor("secondary");

export const dangerButtonStyleClassNames = getButtonStyleClassNamesForColor("danger");

export const themes: Record<string, Extension> = {
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

export const highlights: Record<string, HighlightStyle> = {
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